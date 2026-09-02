# 🔍 รายงานวิเคราะห์เชิงลึกของโปรเจกต์ Campus Food Ordering System

> **ผู้วิเคราะห์:** AI Code Reviewer  
> **วันที่วิเคราะห์:** 2 กันยายน 2026  
> **ขอบเขต:** ตรวจสอบ Source Code ทุกส่วนของ Monorepo (Backend, Web, Mobile, Shared-Types) รวม ~21,554 บรรทัด  
> **เกณฑ์:** Production-readiness, Security, Performance, Type Safety, Maintainability, Testing

---

## 📊 สรุปผลการวิเคราะห์ (Executive Summary)

| ด้าน | คะแนน | สถานะ |
|---|---|---|
| 🏗️ สถาปัตยกรรมโดยรวม | 8.5 / 10 | ✅ ดีมาก — Monorepo + Shared Types ทำได้ถูกต้อง |
| 🔒 ความปลอดภัย (Security) | 6.0 / 10 | ⚠️ มีช่องโหว่สำคัญหลายจุด ต้องแก้ก่อน Production |
| 🧩 Type Safety | 6.5 / 10 | ⚠️ มี `as unknown as`, `as any` จำนวนมากที่ต้องกำจัด |
| ⚡ Performance | 7.0 / 10 | ✅ ดี — มี In-memory Cache แต่ Analytics ยังมีปัญหา |
| 🧪 Testing Coverage | 4.0 / 10 | 🔴 ไม่เพียงพอ — มี Unit Test เพียง 2 ไฟล์, ไม่มี E2E/Integration |
| 📐 Code Quality | 7.5 / 10 | ✅ ดี — โครงสร้างดี แต่มี God Files หลายไฟล์ |
| 🌐 DevOps / Deployment | 3.0 / 10 | 🔴 ขาดหายทั้งหมด — ไม่มี Dockerfile, CI/CD, Health Check |

---

## 🔴 ระดับวิกฤติ (Critical — ต้องแก้ก่อน Deploy)

---

### ปัญหาที่ 1: 🔑 PromptPay Phone Number ถูก Hardcode ในโค้ด

**พบที่:** [`orders.service.ts:115`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts#L115)

```typescript
// ❌ ปัญหา: หมายเลข PromptPay ถูก hardcode เป็นเลขเดียวกันทุกร้านค้า!
promptpayQrPayload = generatePromptPayPayload('0812345678', totalPrice);
```

**ผลกระทบ:**  
- เงินทุกออเดอร์จากทุกร้านค้าจะไหลเข้าบัญชีเดียวกัน (เลข `0812345678`) ไม่ว่าลูกค้าจะสั่งร้านไหน
- ร้านค้าไม่สามารถรับเงินเข้าบัญชีตนเองได้ = **ใช้งานจริงไม่ได้เลย**

**วิธีแก้ไข:**
1. เพิ่ม Field `promptpayId` ใน Model `Vendor` ใน `schema.prisma`
2. ดึง `promptpayId` จากข้อมูลร้านค้าที่อยู่ใน Transaction แทน
3. สร้างหน้าจัดการข้อมูลร้านค้าให้ร้านค้ากรอกเลข PromptPay ของตนเอง

```typescript
// ✅ แก้ไข
const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });
promptpayQrPayload = generatePromptPayPayload(vendor.promptpayId, totalPrice);
```

---

### ปัญหาที่ 2: 🔓 WebSocket Gateway ไม่มีการ Authenticate

**พบที่:** [`notifications.gateway.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/notifications/notifications.gateway.ts)

```typescript
// ❌ ปัญหา: ใครก็ได้สามารถ join ห้อง vendor_ ใดก็ได้ โดยไม่ต้อง Login
@SubscribeMessage(WsEvents.JOIN_VENDOR_ROOM)
handleJoinVendorRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { vendorId: string }) {
  client.join(`vendor_${data.vendorId}`); // ไม่มีการตรวจสอบสิทธิ์!
}
```

**ผลกระทบ:**
- ผู้ไม่หวังดีสามารถ Join ห้องของร้านค้าใดก็ได้ → **เห็นข้อมูลออเดอร์ ราคา ชื่อลูกค้าของร้านค้าอื่น**
- สามารถแอบฟัง (Eavesdrop) ข้อมูลการชำระเงินและ QR Code PromptPay ของร้านอื่นได้

**วิธีแก้ไข:**
1. ตรวจสอบ JWT Token ใน `handleConnection()` เพื่อระบุตัวตนผู้เชื่อมต่อ
2. ใน `handleJoinVendorRoom()` ตรวจสอบว่า User เป็นเจ้าของร้านนั้นหรือเป็น Admin

```typescript
// ✅ แก้ไข
handleConnection(client: Socket) {
  const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
  try {
    const decoded = this.jwtService.verify(token);
    client.data.user = decoded;
  } catch {
    client.disconnect(true); // ตัดการเชื่อมต่อ
  }
}
```

---

### ปัญหาที่ 3: 💳 ระบบยืนยันการชำระเงิน PromptPay เป็นแบบ "Self-Verify" (Mock)

**พบที่:** [`orders.service.ts:445-481`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts#L445-L481)

```typescript
// ❌ ปัญหา: ลูกค้ากดยืนยันการจ่ายเงินเองได้ โดยไม่มีการตรวจสอบกับธนาคาร
async verifyPayment(orderId: string, studentId: string, transactionId?: string) {
  // ...
  transactionId: transactionId || `TXN-PP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  // ↑ สร้าง Transaction ID ปลอมขึ้นมาเอง ไม่ได้มาจาก Payment Gateway จริง
}
```

**ผลกระทบ:**
- ลูกค้าสามารถ **กดยืนยันชำระเงินโดยไม่ต้องจ่ายจริง** = ได้อาหารฟรี
- ไม่มีกลไกยืนยันว่ามีเงินเข้าบัญชี PromptPay จริงหรือไม่

**วิธีแก้ไข:**
1. ในระยะสั้น: ให้ **ร้านค้าเป็นคนกดยืนยันการชำระเงิน** แทนลูกค้า (เพราะร้านค้าเห็นว่าเงินเข้าแล้ว)
2. ในระยะยาว: เชื่อมต่อกับ Payment Gateway จริง (เช่น Omise, 2C2P, SCB Open API) ที่มี Webhook Callback

---

### ปัญหาที่ 4: 🔐 Web Dashboard เก็บ JWT Token ใน localStorage (XSS Vulnerable)

**พบที่:** [`auth-context.tsx:72`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/lib/auth-context.tsx#L72) และ [`api.ts:14`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/lib/api.ts#L14)

```typescript
// ❌ auth-context.tsx
localStorage.setItem('token', data.accessToken);

// ❌ api.ts
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
```

**ผลกระทบ:**
- หาก Web Dashboard ถูกโจมตีด้วย XSS (Cross-Site Scripting) ผู้โจมตีสามารถ **ขโมย JWT Token** ได้ทันทีด้วย `document.cookie` หรือ JavaScript injection
- สำหรับแอปพลิเคชันที่จัดการข้อมูลการเงินและออเดอร์ นี่เป็นความเสี่ยงที่สูงมาก

**วิธีแก้ไข:**
1. เปลี่ยนไปเก็บ Token ใน **HTTP-Only Cookie** ที่มี flag `Secure`, `SameSite=Strict` (JavaScript อ่านไม่ได้)
2. หรืออย่างน้อยเก็บใน `sessionStorage` แทน `localStorage` (หมดอายุเมื่อปิดแท็บ)

---

### ปัญหาที่ 5: 🛡️ API `GET /orders/:id` ไม่มีการตรวจสอบสิทธิ์เจ้าของ

**พบที่:** [`orders.controller.ts:139-145`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.controller.ts#L139-L145)

```typescript
// ❌ ปัญหา: Login แล้วดูออเดอร์ใครก็ได้ ขอแค่รู้ UUID
@Get(':id')
@UseGuards(JwtAuthGuard)
async getOrderById(@Param('id') orderId: string) {
  return this.ordersService.getOrderById(orderId); // ไม่ตรวจว่าเป็นเจ้าของออเดอร์
}
```

**ผลกระทบ:**
- User A สามารถดูข้อมูลออเดอร์ของ User B ได้ หากรู้ UUID ของออเดอร์ (**IDOR Vulnerability**)
- เห็นชื่อ เบอร์โทร อีเมลของคนอื่น รวมถึงรายการสั่งซื้อ

**วิธีแก้ไข:**
```typescript
// ✅ แก้ไข
async getOrderById(orderId: string, requestingUserId: string, requestingRole: Role) {
  const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { vendor: true } });
  if (order.studentId !== requestingUserId && order.vendor.ownerId !== requestingUserId && requestingRole !== Role.ADMIN) {
    throw new ForbiddenException('You cannot view this order');
  }
  return order;
}
```

---

## 🟡 ระดับสำคัญ (Important — ควรแก้ก่อน Production)

---

### ปัญหาที่ 6: 🧩 Type Safety — `as unknown as Order` ซ้ำ 6 จุดใน orders.service.ts

**พบที่:** [`orders.service.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts) — บรรทัด 154, 215, 273, 315, 475, 516

```typescript
// ❌ ปรากฏซ้ำ 6 ครั้ง
this.notificationsService.notifyNewOrder(dto.vendorId, order as unknown as Order);
```

**สาเหตุ:** Prisma สร้าง Type ของตนเองที่ไม่ตรงกับ Interface `Order` ใน `shared-types` ทำให้ต้องใช้ double-cast  
**ผลกระทบ:** หาก Field ใน Prisma Schema เปลี่ยน แต่ `shared-types` ไม่ได้อัปเดตตาม จะเกิด Runtime Error โดย Compiler ไม่แจ้งเตือน

**วิธีแก้ไข:**
1. สร้าง Helper function `toDomainOrder(prismaOrder): Order` ที่ Map field อย่างชัดเจนและ Type-safe
2. หรือ Generate `shared-types` จาก Prisma Schema โดยตรงด้วย `prisma-json-types-generator`

---

### ปัญหาที่ 7: 📊 Analytics Service ดึงข้อมูลออเดอร์ทั้งหมดมาคำนวณใน Memory

**พบที่:** [`analytics.service.ts:42-53`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/analytics/analytics.service.ts#L42-L53)

```typescript
// ❌ ปัญหา: ดึง ALL orders มาแล้วคำนวณใน JavaScript
const orders = await this.prisma.order.findMany({
  where: { vendorId, createdAt: { gte: start, lte: end } },
  include: { items: { include: { menuItem: true } } },
  orderBy: { createdAt: 'asc' },
});
// แล้ว loop ในตัวแปร orders ทั้งหมดเพื่อนับ, group by, aggregate
```

**ผลกระทบ:**
- เมื่อร้านค้ามีออเดอร์เป็นหมื่นรายการ (`period: 'month'`) การดึงข้อมูลทั้งหมดมาไว้ใน Memory จะทำให้ API ตอบช้าและใช้ RAM สูง
- `getPopularItems()` และ `getPeakHours()` เรียก `getSummary()` ซ้ำ ทำให้ Query ฐานข้อมูลซ้ำโดยไม่จำเป็น

**วิธีแก้ไข:**
1. ใช้ **Prisma Raw Query** หรือ **`$queryRaw` + SQL Aggregate Functions** (`SUM`, `COUNT`, `GROUP BY`) ให้ PostgreSQL คำนวณในระดับฐานข้อมูลแทน
2. เพิ่ม Cache Layer (Redis หรือ In-memory TTL) สำหรับข้อมูล Analytics ที่ไม่ต้องอัปเดตทุกวินาที

---

### ปัญหาที่ 8: 🗃️ In-Memory Cache ใน Menu/Vendor Service ไม่ Scale ข้ามอินสแตนซ์

**พบที่:** [`menu.service.ts:9-11`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/menu/menu.service.ts#L9-L11) & [`vendors.service.ts:9-11`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/vendors/vendors.service.ts#L9-L11)

```typescript
// ❌ ปัญหา: Cache อยู่ใน Process memory เดียวกับ Backend
private cache = new Map<string, { data: any; expiresAt: number }>();
```

**ผลกระทบ:**
- หากรัน Backend หลาย Instance (Scale Horizontally) แต่ละ Instance จะมี Cache คนละชุด → **ข้อมูลไม่สอดคล้องกัน** (Stale data)
- Cache key ใช้ `any` เป็น value type → สูญเสีย Type Safety

**วิธีแก้ไข:**
1. **ระยะสั้น:** ใช้ต่อได้ถ้ารัน 1 Instance แต่ควรเพิ่ม Max Size ป้องกัน Memory Leak
2. **ระยะยาว:** ย้ายไปใช้ Redis/Valkey เพื่อแชร์ Cache ข้ามอินสแตนซ์

---

### ปัญหาที่ 9: 🔄 Web Dashboard ไม่มีระบบ Refresh Token

**พบที่:** [`auth-context.tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/lib/auth-context.tsx) & [`api.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/lib/api.ts)

**ข้อสังเกต:** Mobile App มีระบบ Refresh Token สมบูรณ์ (`refreshTokens()` + Auto-retry on 401) แต่ Web API Client **ไม่มีเลย**

**ผลกระทบ:** Token ของ Web Dashboard หมดอายุใน 1 ชั่วโมง หลังจากนั้น API ทุกอย่างจะหยุดทำงาน โดยไม่มีการ Refresh อัตโนมัติ → แม่ค้าต้อง Login ใหม่ทุกชั่วโมง

**วิธีแก้ไข:** เพิ่ม Interceptor ใน `apiClient()` ของ Web ให้ตรวจจับ 401 → เรียก `/auth/refresh` → Retry request อัตโนมัติ (เช่นเดียวกับที่ Mobile ทำ)

---

### ปัญหาที่ 10: 📝 Order State Transition ไม่มี Validation ที่เข้มงวด

**พบที่:** [`orders.service.ts:159-221`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts#L159-L221) — `updateOrderStatus()`

```typescript
// ❌ ปัญหา: ไม่มีการตรวจสอบว่า Transition ที่ขอนั้นถูกต้องหรือไม่
// ร้านค้าสามารถเปลี่ยนสถานะข้ามขั้นได้ เช่น PENDING → COMPLETED โดยตรง
const newStatus = dto.status;
// ↑ ไม่มี guard ว่า previousStatus → newStatus เป็น Valid Transition หรือไม่
```

**ผลกระทบ:** ร้านค้าอาจเปลี่ยนสถานะข้ามขั้นตอน (เช่น `PENDING` → `COMPLETED` โดยไม่ผ่าน `COOKING` → `READY`) ทำให้ข้อมูล `readyAt`, `completedAt` ไม่สอดคล้อง

**วิธีแก้ไข:**
```typescript
// ✅ แก้ไข: สร้าง State Machine Map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]:   [OrderStatus.ACCEPTED, OrderStatus.COOKING, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]:  [OrderStatus.COOKING, OrderStatus.CANCELLED],
  [OrderStatus.COOKING]:   [OrderStatus.READY],
  [OrderStatus.READY]:     [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

if (!VALID_TRANSITIONS[previousStatus]?.includes(newStatus)) {
  throw new BadRequestException(`Cannot transition from ${previousStatus} to ${newStatus}`);
}
```

---

### ปัญหาที่ 11: 📄 God Files — ไฟล์ที่มีขนาดใหญ่เกินควรจัด Refactor

| ไฟล์ | บรรทัด | ปัญหา | แนะนำ |
|---|---|---|---|
| [`ai.service.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/ai/ai.service.ts) | 692 | รวม 3 AI Provider + Tools + Fallback | แยกเป็น `GeminiProvider`, `ClaudeProvider`, `FallbackProvider` |
| [`kds/page.tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/app/kds/page.tsx) | 614 | UI + Logic + WebSocket ทั้งหมดอยู่ในไฟล์เดียว | แยก Custom Hook `useKdsOrders()` + UI Components |
| [`sunmi/page.tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/app/sunmi/page.tsx) | 604 | เช่นเดียวกับ KDS | แยก Custom Hook + Components |
| [`orders.service.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts) | 525 | จัดการทั้ง CRUD + Payment + Queue + Notification | แยก `PaymentService`, `QueueService` |
| [`KdsWalkInOrderDrawer.tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/web/src/components/kds/KdsWalkInOrderDrawer.tsx) | 577 | Component เดียว 577 บรรทัด | แยก Form Logic ออกจาก UI |

---

## 🟢 ข้อเสนอแนะเพิ่มเติม (Enhancements)

---

### ปัญหาที่ 12: 🧪 Test Coverage ต่ำมาก (2 ไฟล์จาก 60+ Services/Components)

**สถานะปัจจุบัน:**
- มี Test เพียง 2 ไฟล์: `auth.service.spec.ts` และ `orders.service.spec.ts`
- ❌ ไม่มี Test สำหรับ: `menu.service`, `vendors.service`, `analytics.service`, `ai.service`, `notifications.gateway`
- ❌ ไม่มี Integration Test ระดับ Controller/API endpoint
- ❌ ไม่มี E2E Test
- ❌ ไม่มี Mobile/Web Component Tests

**แนะนำเพิ่ม:**
1. **Backend:** เพิ่ม Unit Test สำหรับทุก Service (อย่างน้อย Menu, Vendors, Analytics)
2. **Backend:** เพิ่ม Integration Test ระดับ Controller ด้วย `@nestjs/testing` + SuperTest
3. **Web:** เพิ่ม Component Test ด้วย React Testing Library / Playwright
4. **CI:** ตั้ง Coverage Threshold ขั้นต่ำที่ 70%

---

### ปัญหาที่ 13: 🚀 ไม่มี DevOps Pipeline เลย

**สิ่งที่ขาดหายทั้งหมด:**
- ❌ ไม่มี `Dockerfile` / `docker-compose.yml` สำหรับรันในเครื่อง Dev
- ❌ ไม่มี GitHub Actions / CI Pipeline สำหรับ Lint, Test, Build อัตโนมัติ
- ❌ ไม่มี Health Check Endpoint (`GET /api/health`)
- ❌ ไม่มี Logging Framework (ใช้แค่ `NestJS Logger` ไม่มี structured JSON log)
- ❌ ไม่มี Error Tracking (Sentry / Bugsnag)
- ❌ ไม่มีคู่มือ Deployment

**แนะนำ:**
1. สร้าง `Dockerfile` + `docker-compose.yml` (Backend + PostgreSQL + Redis)
2. สร้าง `.github/workflows/ci.yml` สำหรับ CI Pipeline
3. เพิ่ม `GET /api/health` ที่ตรวจ Database Connection

---

### ปัญหาที่ 14: 📱 Mobile API Client ไม่มี Request Timeout

**พบที่:** [`mobile/src/lib/api.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/lib/api.ts)

ทั้ง `mobileApi()` ใช้ `fetch()` ตรงๆ โดยไม่มีกำหนด Timeout → หากเซิร์ฟเวอร์ไม่ตอบ แอปจะค้างรอตลอดกาล

**วิธีแก้ไข:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 วินาที
const response = await fetch(url, { ...options, signal: controller.signal });
clearTimeout(timeoutId);
```

---

### ปัญหาที่ 15: 🗄️ Prisma Schema ขาด Constraint สำคัญ

| ปัญหา | ผลกระทบ | วิธีแก้ไข |
|---|---|---|
| `Vendor` ไม่มี Field `promptpayId` | PromptPay QR ทุกร้านชี้ไปที่เบอร์เดียวกัน | เพิ่ม `promptpayId String?` ใน Model Vendor |
| `Order.queueNumber` ไม่มี `@@unique` constraint ร่วมกับ `vendorId` + `createdAt(date)` | อาจเกิดเลขคิวซ้ำข้ามวัน | เพิ่ม Composite Unique: `@@unique([vendorId, queueNumber])` |
| ไม่มี `updatedAt` ใน Model `Order`, `Vendor`, `User` | ไม่สามารถ Audit ว่าข้อมูลถูกแก้ไขครั้งสุดท้ายเมื่อไหร่ | เพิ่ม `updatedAt DateTime @updatedAt` |
| ไม่มีตาราง `Review` / `Rating` | README ระบุว่ามีฟังก์ชันให้ดาว แต่ไม่มี Schema รองรับ | สร้าง Model `Review` ใหม่ |

---

### ปัญหาที่ 16: 🔁 Duplicated Code Pattern — Secure Storage Adapter

**พบที่:** 
- [`auth-store.ts:9-31`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/stores/auth-store.ts#L9-L31)
- [`cart-store.ts:7-29`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/stores/cart-store.ts#L7-L29)

Secure Storage adapter ถูกเขียนซ้ำ 2 ไฟล์ (เหมือนกันทุกบรรทัด)

**วิธีแก้ไข:** สร้างไฟล์กลาง `lib/secure-storage-adapter.ts` แล้ว import ใช้งานร่วมกัน

---

### ปัญหาที่ 17: ⚙️ .env.example ไม่ครบ / ไม่ตรงกับโค้ดจริง

**ปัญหา:**
- `.env.example` ไม่มี `GEMINI_API_KEY`, `AI_API_KEY`, `NANOBANANA_API_KEY` (แต่โค้ดใน `ai.service.ts` ใช้)
- `.env.example` มี `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWKS_URL` แต่โค้ดไม่ได้ใช้ตัวแปรเหล่านี้เลย
- `.env.example` มี `JWT_EXPIRES_IN` แต่โค้ดจริง Hardcode `1h` / `7d` ใน `auth.service.ts`

**วิธีแก้ไข:** ตรวจสอบตัวแปรทั้งหมดที่ใช้จริงใน Source Code และอัปเดต `.env.example` ให้ตรงกัน

---

### ปัญหาที่ 18: 🌐 CORS Configuration ไม่ปลอดภัยใน Development

**พบที่:** [`main.ts:21`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/main.ts#L21)

```typescript
// ❌ ปัญหา: ใน Development mode อนุญาตทุก Origin
if (process.env.NODE_ENV !== 'production') return callback(null, true);
```

**ปัญหาเพิ่มเติม:**  ไม่มีการตั้ง `NODE_ENV=production` ที่ไหนเลย → ตอน Deploy Production อาจลืมตั้ง → CORS เปิดกว้างถึง Production

---

## 📋 Checklist สำหรับ Production Readiness

### 🔴 ต้องทำ (Must Have)
- [ ] แก้ไข PromptPay Hardcode → ดึงจาก Vendor Profile
- [ ] เพิ่ม Authentication ใน WebSocket Gateway
- [ ] แก้ไข Payment Verification → ให้ร้านค้ายืนยัน หรือต่อ Payment Gateway
- [ ] ย้าย JWT Token จาก localStorage ไปเป็น HTTP-Only Cookie
- [ ] เพิ่ม Authorization check ใน `getOrderById()`
- [ ] เพิ่ม Order State Transition Validation

### 🟡 ควรทำ (Should Have)
- [ ] แก้ไข `as unknown as Order` → สร้าง Mapper function
- [ ] ย้าย Analytics Query ไปคำนวณในระดับ SQL
- [ ] เพิ่ม Refresh Token ใน Web Dashboard API Client
- [ ] เพิ่ม `updatedAt` ใน Prisma Schema ทุก Model
- [ ] เพิ่ม Request Timeout ใน Mobile API Client
- [ ] Refactor God Files (ai.service.ts, kds/page.tsx, sunmi/page.tsx)
- [ ] แก้ Duplicated Secure Storage Adapter

### 🟢 ถ้ามีเวลา (Nice to Have)
- [ ] เพิ่ม Dockerfile + docker-compose.yml
- [ ] เพิ่ม GitHub Actions CI Pipeline
- [ ] เพิ่ม Health Check Endpoint
- [ ] เพิ่ม Unit Test Coverage ให้ครบทุก Service
- [ ] เพิ่ม E2E Test ด้วย Playwright
- [ ] เพิ่ม Error Tracking (Sentry)
- [ ] สร้าง Model Review/Rating ใน Schema

---

## 🏆 จุดเด่นที่น่าชื่นชม (Things Done Right)

ท่ามกลางข้อเสนอแนะเหล่านี้ ควรเน้นย้ำว่าโปรเจกต์นี้ **ทำได้ดีมากในหลายด้าน**:

1. ✅ **Monorepo Architecture + Shared Types** — การแชร์ Type ข้ามแพลตฟอร์มเป็นแนวทางที่ถูกต้อง
2. ✅ **Server-Side Price Calculation** — ป้องกัน Price Manipulation ได้ดี
3. ✅ **Atomic Queue Number Generation** — ใช้ Prisma Transaction ป้องกัน Race Condition
4. ✅ **IDOR Guard ใน `getStudentOrders()`** — ตรวจสอบสิทธิ์อย่างถูกต้อง
5. ✅ **ValidationPipe + whitelist + forbidNonWhitelisted** — ป้องกัน Mass Assignment
6. ✅ **Expo SecureStore สำหรับ Mobile Token** — ใช้ Hardware Keystore เก็บ Token
7. ✅ **Mobile Auto Refresh Token** — Silent refresh เมื่อ Token หมดอายุ
8. ✅ **Socket.IO Room Isolation** — แยก Room ตาม Vendor และ Order
9. ✅ **Soft-Delete Pattern ใน MenuItem** — รักษาข้อมูลอ้างอิงในออเดอร์เก่า
10. ✅ **Rate Limiting ด้วย @nestjs/throttler** — ป้องกัน Brute-force บน Auth Endpoints
11. ✅ **PromptPay QR Generator ตามมาตรฐาน EMVCo** — CRC-16 Checksum ถูกต้อง
12. ✅ **PoS / KDS / Queue Display / Sunmi** — ระบบครบวงจรสำหรับโรงอาหารจริง

---

> **สรุป:** โปรเจกต์มีฐาน Architecture ที่แข็งแกร่งมาก มีความซับซ้อนสูง (POS, KDS, Queue TV, AI) ในระดับที่เหนือกว่าโปรเจกต์ทั่วไป แต่ยังมีช่องโหว่ด้านความปลอดภัยที่ **ต้องแก้ไขก่อนใช้งานจริงอย่างแน่นอน** — โดยเฉพาะ PromptPay Hardcode, WebSocket ไม่มี Auth และระบบยืนยันการจ่ายเงินแบบ Self-Verify
