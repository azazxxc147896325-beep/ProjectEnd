# 📋 รายงานตรวจสอบโครงการ: Campus Food Ordering System
> **ผู้ตรวจสอบ:** อาจารย์ผู้สอนวิชาวิศวกรรมซอฟต์แวร์ (Software Engineering)
> **วันที่ตรวจสอบ:** 18 สิงหาคม 2026
> **ระดับโครงการ:** ระดับปริญญาตรี / Senior Project

---

## ⭐ ภาพรวมการประเมิน (Overall Assessment)

| มิติการประเมิน | คะแนน | หมายเหตุ |
|---|---|---|
| สถาปัตยกรรมระบบ | 8.5/10 | แข็งแกร่ง Monorepo + Modular design |
| คุณภาพโค้ดฝั่ง Backend | 8.0/10 | NestJS ออกแบบดี แต่ขาด Unit Tests หลายส่วน |
| คุณภาพโค้ดฝั่ง Frontend/Mobile | 7.5/10 | ฟีเจอร์ครบ แต่มีปัญหาเรื่อง File Size ของบางไฟล์ |
| ความปลอดภัย (Security) | 6.5/10 | มีพื้นฐานดี แต่ยังขาด Rate Limiting และ Input Sanitization |
| การทดสอบ (Testing) | 4.5/10 | Unit Test มีน้อยมาก ขาด Integration Tests ทั้งหมด |
| เอกสารประกอบ (Documentation) | 7.0/10 | มี README และ Swagger API แต่ขาดเอกสาร Deployment |
| **คะแนนรวม** | **7.0/10** | **ผ่าน (เกณฑ์ผ่าน 6.0/10)** |

---

## ✅ จุดเด่นของโครงการ (Strengths)

### 1. สถาปัตยกรรมที่น่าชื่นชม
- **Monorepo พร้อม Shared Types** เป็นการตัดสินใจที่ถูกต้องมาก การแชร์ `@campus-food/shared-types` ระหว่าง 3 แพลตฟอร์มทำให้มั่นใจ Type Safety แบบ End-to-End ได้อย่างแท้จริง
- **NestJS Module Design** แบ่งโมดูลได้ชัดเจน (`auth`, `orders`, `vendors`, `menu`, `ai`, `analytics`, `notifications`) ตามหลัก **Single Responsibility Principle**
- **JWT + Role-Based Access Control (RBAC)** ฝั่ง Backend ใช้ Guards แยกสิทธิ์ระหว่าง `STUDENT`, `VENDOR`, `ADMIN` ได้อย่างถูกต้อง

### 2. Security พื้นฐานที่ทำได้ดี
- เก็บ JWT Token ใน **Expo SecureStore (Device Keychain/Keystore)** ดีกว่าการเก็บใน AsyncStorage อย่างมีนัยสำคัญ
- **bcryptjs bcrypt(password, 10)** สำหรับ Hash รหัสผ่าน ถูกต้องตามมาตรฐาน
- **Server-side Price Calculation** — ราคาคำนวณจากฐานข้อมูล ไม่เชื่อ Client ที่ส่งมา เป็นการป้องกัน Price Manipulation ที่ถูกต้อง
- **`forbidNonWhitelisted: true`** ใน ValidationPipe ป้องกัน Mass Assignment Vulnerability

### 3. Real-time Architecture ที่ครบถ้วน
- ใช้ **Socket.IO Room System** (`vendor_{vendorId}` และ `order_{orderId}`) แยก Room อย่างถูกต้อง ป้องกันการ Broadcast ข้อมูลผิดคน
- WebSocket Event Flow ครบ: `NEW_ORDER` → `ORDER_STATUS_UPDATED` → `ORDER_READY`

### 4. Order Lifecycle Management ที่รัดกุม
- การตรวจสอบสถานะก่อน Transition ใน `cancelOrderByStudent()` ป้องกัน Race Condition เบื้องต้น
- Business Rule ชัดเจน: ยกเลิกได้เฉพาะ `PENDING` ไม่ใช่ `COOKING` หรือ `READY`

---

## ⚠️ ปัญหาและข้อเสนอแนะ (Issues & Recommendations)

---

### 🔴 ระดับวิกฤติ (Critical — ต้องแก้ไขก่อน Deploy Production)

#### ปัญหาที่ 1: ไม่มี Rate Limiting บน API
**พบที่:** [`apps/backend/src/main.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/main.ts)

ปัจจุบัน API ทุก Endpoint สามารถถูกยิงซ้ำได้ไม่จำกัดครั้ง ทำให้มีความเสี่ยงสูงต่อการโจมตีแบบ:
- **Brute-force Attack** บน `/auth/login`
- **DDoS / Resource Exhaustion** บน Gemini AI Endpoints ซึ่งมีค่าใช้จ่ายต่อ Request

**วิธีแก้ไข:**
```typescript
// ติดตั้ง: pnpm add @nestjs/throttler
// ใน app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 20 },       // global: 20 requests/min
    ]),
  ],
})

// ใน auth.controller.ts
@Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 login attempts/min
@Post('login')
async login(...) {}
```

---

#### ปัญหาที่ 2: Race Condition ในการออกหมายเลขคิว (Queue Number)
**พบที่:** [`apps/backend/src/orders/orders.service.ts#L27-L47`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts)

`calculateQueueNumber()` ใช้วิธี `findFirst().queueNumber + 1` ซึ่งมีปัญหาเรื่อง Race Condition เมื่อมีออเดอร์เข้ามาพร้อมกันหลาย Request ในเวลาเดียวกัน จะได้หมายเลขคิวซ้ำกัน:

```
T=0: User A reads latestQueueNumber = 10
T=0: User B reads latestQueueNumber = 10
T=1: User A creates order with queueNumber = 11
T=1: User B creates order with queueNumber = 11 ← ❌ DUPLICATE!
```

**วิธีแก้ไข (Atomic Sequence):**
```sql
-- ใน schema.prisma เพิ่ม Unique Constraint
@@unique([vendorId, queueNumber])

-- หรือ ใช้ Prisma Transaction
const result = await this.prisma.$transaction(async (tx) => {
  const latest = await tx.order.findFirst({
    where: { vendorId, createdAt: { gte: startOfDay, lte: endOfDay } },
    orderBy: { queueNumber: 'desc' },
    select: { queueNumber: true },
  });
  const queueNumber = (latest?.queueNumber ?? 0) + 1;
  return tx.order.create({
    data: { ..., queueNumber },
    // ...
  });
});
```

---

#### ปัญหาที่ 3: API Key ของ Gemini AI ปรากฏใน Environment File อย่างไม่ปลอดภัย
**พบที่:** `apps/backend/.env`

ถ้า `.env` ถูก Commit ขึ้น Git โดยไม่ตั้งใจ (แม้มี `.gitignore` แล้ว) หรือถูก Expose ผ่าน Log จะทำให้ API Key รั่วไหล ควรเพิ่มระบบ Secret Management หรือตรวจสอบ Secret Scanning ทุกครั้ง

**วิธีแก้ไข:**
```bash
# ตรวจสอบว่า .env ไม่เคยถูก commit ขึ้น git
git log --all --full-history -- "*/.env"

# ถ้าเคย commit ให้ Rotate (เปลี่ยน) API Key ทันที
```

---

### 🟡 ระดับสำคัญ (Important — ควรแก้ไขในโครงการ)

#### ปัญหาที่ 4: Unit Tests น้อยมาก (Coverage ต่ำ)
**พบที่:** มีเพียง [`orders.service.spec.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.spec.ts) ไฟล์เดียว

โครงการที่มีฟีเจอร์หลักหลายอย่าง แต่มี Unit Test ครอบคลุมแค่ 4 กรณี (calculateTotalPrice, calculateQueueNumber, createOrder validation) ถือว่าน้อยมาก

**ส่วนที่ควรเพิ่ม Unit Tests:**

| ส่วนที่ขาดหาย | ความสำคัญ |
|---|---|
| `auth.service.ts` — test register/login flow | 🔴 สูงมาก |
| `orders.service.ts` — test `updateOrderStatus()`, `cancelOrderByStudent()` | 🔴 สูงมาก |
| `orders.service.ts` — test `confirmOrderReceipt()` | 🟡 ปานกลาง |
| Mobile `cart-store.ts` — test `addItem()`, `updateQuantity()` | 🟡 ปานกลาง |
| Integration Tests — API Endpoint ทดสอบแบบ E2E | 🟡 ปานกลาง |

**ตัวอย่างที่ขาดหาย:**
```typescript
// ควรเพิ่มใน orders.service.spec.ts
describe('cancelOrderByStudent', () => {
  it('should throw BadRequestException if order is already COOKING', async () => {
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 'order-1', studentId: 'student-1', status: 'cooking', vendor: {}
    });
    await expect(
      service.cancelOrderByStudent('order-1', 'student-1')
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ForbiddenException if different student tries to cancel', async () => {
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 'order-1', studentId: 'student-1', status: 'pending', vendor: {}
    });
    await expect(
      service.cancelOrderByStudent('order-1', 'different-student')
    ).rejects.toThrow(ForbiddenException);
  });
});
```

---

#### ปัญหาที่ 5: ไฟล์ Component ขนาดใหญ่เกินไป (God Component)
**พบที่:**
- [`apps/mobile/src/app/login.tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/app/login.tsx) — **526 บรรทัด** (Login + Register รวมกัน)
- [`apps/mobile/src/app/order/[id].tsx`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/app/order/[id].tsx) — **631 บรรทัด**
- [`apps/backend/src/ai/ai.service.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/ai/ai.service.ts) — **532 บรรทัด**

ไฟล์ที่ใหญ่เกิน 300 บรรทัดโดยทั่วไปแสดงถึงการมีหน้าที่หลายอย่างใน Component เดียว ซึ่งขัดกับหลัก **Single Responsibility Principle**

**วิธีแก้ไขตัวอย่าง (login.tsx):**
```
แยกออกเป็น:
├── components/auth/LoginForm.tsx      (ฟอร์ม Login + Validation)
├── components/auth/RegisterForm.tsx   (ฟอร์ม Register + Validation)
└── app/login.tsx                      (หน้าหลักที่ toggle ระหว่างสอง form)
```

---

#### ปัญหาที่ 6: ขาด Authorization Check ใน `getStudentOrders()`
**พบที่:** [`apps/backend/src/orders/orders.controller.ts#L80-L86`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.controller.ts)

```typescript
@Get('student/:studentId')
@UseGuards(JwtAuthGuard) // ← ตรวจ Auth แต่ไม่ตรวจว่าเป็นตัวเอง!
async getStudentOrders(@Param('studentId') studentId: string) {
  return this.ordersService.getStudentOrders(studentId); // ← ดึงข้อมูลของใครก็ได้!
}
```

ผู้ใช้งานคนใดก็ตามสามารถดูประวัติการสั่งอาหารของผู้ใช้งานคนอื่นได้ ถ้ารู้ UUID ของเขา (นับเป็น **IDOR Vulnerability** — Insecure Direct Object Reference)

**วิธีแก้ไข:**
```typescript
@Get('student/:studentId')
@UseGuards(JwtAuthGuard)
async getStudentOrders(
  @Param('studentId') studentId: string,
  @CurrentUser('sub') requestingUserId: string,
  @CurrentUser('role') role: Role,
) {
  // ตรวจว่าเป็นตัวเองหรือ Admin เท่านั้น
  if (studentId !== requestingUserId && role !== Role.ADMIN) {
    throw new ForbiddenException('You can only view your own orders');
  }
  return this.ordersService.getStudentOrders(studentId);
}
```

---

#### ปัญหาที่ 7: การใช้ `any` Type มากเกินไป
**พบที่:**
- [`apps/backend/src/notifications/notifications.service.ts#L11`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/notifications/notifications.service.ts) — `notifyNewOrder(vendorId: string, order: any)`
- [`apps/backend/src/notifications/notifications.service.ts#L20`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/notifications/notifications.service.ts) — `notifyOrderStatusChanged(order: any, ...)`
- หลายจุดใน ai.service.ts

การใช้ `any` ทำให้ TypeScript ไม่สามารถตรวจสอบ Type ได้ ขัดกับหลักการที่ตั้งใจไว้ตั้งแต่แรก

**วิธีแก้ไข:**
```typescript
// ใน notifications.service.ts
import { Order } from '@campus-food/shared-types';

notifyNewOrder(vendorId: string, order: Order) { ... }  // ✅

notifyOrderStatusChanged(
  order: Order,
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
) { ... }  // ✅
```

---

### 🟢 ระดับปรับปรุง (Suggestions — เพื่อคุณภาพดียิ่งขึ้น)

#### ข้อเสนอที่ 1: เพิ่ม Database Index สำหรับ Query ที่ใช้บ่อย
**พบที่:** [`apps/backend/prisma/schema.prisma`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/prisma/schema.prisma)

ปัจจุบัน Schema ไม่มี Index ใดเลยนอกจาก Primary Key และ Unique Constraints การดึงออเดอร์ตาม `vendorId`, `studentId` และ `status` ที่ทำบ่อยมากควรมี Index

```prisma
model Order {
  // ... existing fields

  @@index([vendorId])             // ดึงออเดอร์ตามร้านค้า
  @@index([studentId])            // ดึงประวัติออเดอร์ของนักศึกษา
  @@index([status])               // กรองตามสถานะ
  @@index([vendorId, createdAt])  // คำนวณ Queue Number รายวัน
  @@map("orders")
}

model MenuItem {
  // ...
  @@index([vendorId])    // ดึงเมนูตามร้านค้า
  @@index([category])   // กรองตามประเภท
}
```

---

#### ข้อเสนอที่ 2: ขาด Loading State / Error Boundary บนหน้าหลัก Mobile
**พบที่:** Mobile App ทั่วไป

ขณะนี้ถ้า API ล้มเหลว หน้าจอส่วนใหญ่จะเงียบ (แสดงหน้าเปล่า) ไม่มี Error Message ที่ชัดเจนหรือปุ่ม "Retry" ให้ผู้ใช้งาน

**วิธีแก้ไข:** สร้าง Reusable Component:
```typescript
// components/ErrorState.tsx
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <AlertCircle size={48} color="#ef4444" />
      <Text style={{ color: '#94a3b8', textAlign: 'center' }}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={{ ...buttonStyle }}>
        <Text>ลองอีกครั้ง</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

#### ข้อเสนอที่ 3: ขาด Pagination ใน API
**พบที่:** [`apps/backend/src/orders/orders.service.ts#L328-L343`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/orders/orders.service.ts)

`getVendorOrders()` และ `getStudentOrders()` ดึงข้อมูลทั้งหมดในคราวเดียว ถ้าร้านค้ามีออเดอร์หลักพันรายการ Response จะช้ามาก

**วิธีแก้ไข:**
```typescript
async getStudentOrders(studentId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({
      where: { studentId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // ...
    }),
    this.prisma.order.count({ where: { studentId } }),
  ]);
  return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

---

#### ข้อเสนอที่ 4: Cart Store ไม่มีการ Persist ข้อมูล
**พบที่:** [`apps/mobile/src/stores/cart-store.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/stores/cart-store.ts)

ถ้าผู้ใช้กด Home Button ออกแล้วกลับมา หรือ App Crash ระหว่างเลือกอาหาร ตะกร้าจะถูกล้างทันที ทำให้ UX ไม่ดี

**วิธีแก้ไข:** ใช้ Zustand `persist` middleware:
```typescript
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'campus-food-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

#### ข้อเสนอที่ 5: Gemini API ถูกเรียกโดยตรงผ่าน Raw `fetch()`
**พบที่:** [`apps/backend/src/ai/ai.service.ts#L47-L80`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/ai/ai.service.ts)

การเรียก Gemini API ผ่าน Raw `fetch()` ทำให้โค้ดยาว อ่านยาก และอาจพลาด Error Handling บางกรณี ควรใช้ Official SDK แทน

```bash
pnpm add @google/generative-ai
```

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const result = await model.generateContent(prompt);
const text = result.response.text();
```

---

#### ข้อเสนอที่ 6: ขาด Refresh Token Mechanism
**พบที่:** [`apps/backend/src/auth/auth.service.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/src/auth/auth.service.ts) และ [`apps/mobile/src/stores/auth-store.ts`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/mobile/src/stores/auth-store.ts)

ปัจจุบันออก JWT Token เพียง 1 Token ที่ไม่มี Expiry หรือ Expiry นานเกินไป เมื่อ Token หมดอายุ ผู้ใช้จะต้อง Login ใหม่ทันทีโดยไม่มี Silent Refresh

**วิธีแก้ไข:**
1. กำหนด `expiresIn: '1h'` สำหรับ Access Token
2. สร้าง Refresh Token (อายุ 7 วัน) เก็บใน Secure Storage แยก
3. เพิ่ม Middleware ใน `mobileApi.ts` ที่ Intercept 401 Error และ Silent Refresh อัตโนมัติ

---

#### ข้อเสนอที่ 7: ขาด Soft Delete สำหรับ Menu Items
**พบที่:** [`apps/backend/prisma/schema.prisma`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/prisma/schema.prisma)

ถ้าลบ MenuItem ออกจาก Database จริง จะทำให้ `OrderItem` ที่อ้างอิงถึง MenuItem นั้นสูญเสีย Reference และข้อมูลประวัติการสั่งออเดอร์จะแสดงชื่อเมนูไม่ถูกต้อง

**วิธีแก้ไข:**
```prisma
model MenuItem {
  // ...
  isAvailable Boolean  @default(true)
  deletedAt   DateTime?  // ← เพิ่ม Soft Delete field

  @@map("menu_items")
}
```
และเพิ่ม `where: { deletedAt: null }` ในทุก Query ที่ดึงเมนูสำหรับผู้ใช้งาน

---

#### ข้อเสนอที่ 8: `cancelledBy` ควรเป็น Enum ไม่ใช่ String
**พบที่:** [`apps/backend/prisma/schema.prisma#L71`](file:///Users/a1/Desktop/Film/GitHub/proj/apps/backend/prisma/schema.prisma) และ [`packages/shared-types/src/models.ts#L73`](file:///Users/a1/Desktop/Film/GitHub/proj/packages/shared-types/src/models.ts)

```prisma
// ปัจจุบัน (ไม่ดี)
cancelledBy  String?   // อาจเป็น 'user', 'vendor', 'system' หรืออะไรก็ได้

// ควรเป็น
enum CancelledBy {
  user
  vendor
  system
}

model Order {
  cancelledBy CancelledBy?
}
```

---

## 📚 สรุปคำแนะนำตามลำดับความสำคัญ (Action Items)

### 🔴 ต้องทำก่อน Deploy (Critical)
- [x] **เพิ่ม Rate Limiting** — `@nestjs/throttler` บน `/auth/login` และ AI Endpoints
- [x] **แก้ Race Condition Queue Number** — ใช้ Prisma Transaction แบบ Atomic พร้อม Index ประสิทธิภาพสูง
- [x] **แก้ IDOR Vulnerability** — ตรวจสอบ `studentId === requestingUserId` ใน `getStudentOrders()`
- [x] **ตรวจสอบ .env ไม่เคยถูก commit** และ Rotate API Keys ถ้าจำเป็น

### 🟡 ควรทำก่อนนำเสนอ (Important)
- [x] **เพิ่ม Unit Tests** — มีทั้ง `auth.service.spec.ts` และ `orders.service.spec.ts` รวม 24 tests ผ่าน 100%
- [x] **แก้ `any` Types** ใน `notifications.service.ts`
- [x] **เพิ่ม Database Indexes** ใน Prisma Schema
- [x] **เพิ่ม Pagination** ใน `getVendorOrders()` และ `getStudentOrders()`
- [x] **`cancelledBy` เปลี่ยนเป็น Enum**

### 🟢 ทำหลังนำเสนอ (Enhancement)
- [x] **เพิ่ม Cart Persistence** ใน Zustand (`expo-secure-store` persist)
- [x] **Refresh Token Mechanism** — Access Token (1h) + Refresh Token (7d) พร้อม `POST /auth/refresh`
- [x] **Soft Delete สำหรับ MenuItem** (`deletedAt: DateTime?`)
- [x] **แยก God Components** (`login.tsx` 526 บรรทัด → `LoginForm.tsx` & `RegisterForm.tsx`)
- [x] **เพิ่ม Error Boundary / Retry UI** บน Mobile (`ErrorState.tsx`)

---

## 💬 ความเห็นเพิ่มเติมจากอาจารย์

โครงการนี้แสดงให้เห็นถึงความเข้าใจ **Full-Stack Web and Mobile Development** ในระดับที่ดีมากสำหรับนักศึกษาระดับปริญญาตรี โดยเฉพาะ:

1. ✅ การเลือกใช้ TypeScript ตลอดทั้ง Stack แสดงถึงความเข้าใจเรื่อง Type Safety
2. ✅ สถาปัตยกรรม Monorepo พร้อม Shared Types ถือเป็น **Industry Best Practice** ที่บริษัทชั้นนำใช้จริง
3. ✅ Real-time WebSocket System ที่ทำงานได้จริงเป็นเรื่องที่ทำยาก และทีมสามารถทำได้สำเร็จ
4. ✅ การ Integrate AI (Gemini) เข้ากับระบบพร้อม Grounding ด้วยข้อมูลจริงจากฐานข้อมูล แสดงถึงการออกแบบที่คิดมาแล้ว

อย่างไรก็ดี จุดที่ต้องพัฒนาคือ **ด้านความปลอดภัย (Security)** และ **การทดสอบ (Testing)** ซึ่งเป็น 2 เรื่องที่นักศึกษามักมองข้ามในโครงการเรียน แต่มีความสำคัญสูงมากในระบบที่จะนำไปใช้งานจริง

---

*หากต้องการอภิปรายรายละเอียดเพิ่มเติมเกี่ยวกับปัญหาหรือวิธีแก้ไขใดๆ สามารถนัดพบอาจารย์ได้ที่ห้องพักอาจารย์*
