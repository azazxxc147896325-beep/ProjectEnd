# Prompt สำหรับ Claude Code (VS Code) — สร้างระบบสั่งอาหารในมหาวิทยาลัย

วิธีใช้: เปิดโปรเจกต์ (โฟลเดอร์ว่าง) ใน VS Code, เปิด Claude Code extension,
วาง prompt ด้านล่างทั้งหมดเป็นข้อความแรก แล้วปล่อยให้ Claude Code เริ่มสร้างโครงสร้างและโค้ดให้

---

```
สร้างระบบสั่งอาหารในมหาวิทยาลัย (Campus Food Ordering System) เป็น Monorepo
ประกอบด้วย 3 ส่วน:

1. apps/web       -> Vendor Dashboard (Next.js + TypeScript + Tailwind CSS)
2. apps/mobile    -> Student App (React Native ด้วย Expo + TypeScript)
3. apps/backend   -> API Server (Node.js + NestJS + TypeScript)

ใช้ PostgreSQL เป็นฐานข้อมูลหลัก, Prisma เป็น ORM, และใช้ pnpm workspaces
จัดการ monorepo ทั้งหมด

================================================================
ขั้นตอนที่ 1: ตั้งค่าโครงสร้างโปรเจกต์
================================================================
- สร้าง pnpm monorepo ด้วยโครงสร้าง:
  /apps/web, /apps/mobile, /apps/backend, /packages/shared-types
- packages/shared-types เก็บ TypeScript type/interface ที่ใช้ร่วมกันทั้ง 3 แอป
  (Order, MenuItem, Vendor, User, OrderStatus enum ฯลฯ)
- ตั้งค่า ESLint + Prettier ให้เหมือนกันทั้ง monorepo
- ไม่ต้องใช้ Docker และไม่ต้องติดตั้ง PostgreSQL ในเครื่อง ให้ใช้ **Supabase**
  เป็นฐานข้อมูล PostgreSQL ที่ hosted ไว้แล้ว โดยเชื่อมผ่าน DATABASE_URL
  ที่ได้จาก Supabase Project Settings > Database > Connection string
  (ใช้ connection string แบบ "Transaction" pooling mode สำหรับ Prisma)
- สร้าง README.md อธิบายวิธี setup และรันแต่ละ app แบบ local โดยระบุขั้นตอน:
  1) สร้างโปรเจกต์ใหม่ใน supabase.com
  2) คัดลอก connection string มาใส่ใน apps/backend/.env (DATABASE_URL)
  3) รัน `npx prisma migrate dev` เพื่อสร้างตารางบน Supabase โดยตรง (ไม่ต้อง setup DB เอง)

================================================================
ขั้นตอนที่ 2: Backend (apps/backend) — NestJS + Prisma + PostgreSQL
================================================================
สร้าง Prisma schema ตามนี้:

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String
  role      Role     // student, vendor, admin
  phone     String?
  createdAt DateTime @default(now())
  vendor    Vendor?
  orders    Order[]
}

model Vendor {
  id          String     @id @default(uuid())
  ownerId     String     @unique
  owner       User       @relation(fields: [ownerId], references: [id])
  name        String
  description String?
  logoUrl     String?
  isOpen      Boolean    @default(true)
  menuItems   MenuItem[]
  orders      Order[]
}

model MenuItem {
  id             String   @id @default(uuid())
  vendorId       String
  vendor         Vendor   @relation(fields: [vendorId], references: [id])
  name           String
  description    String?
  price          Decimal
  imageUrl       String?
  category       String
  isDailySpecial Boolean  @default(false)
  isAvailable    Boolean  @default(true)
  orderItems     OrderItem[]
}

model Order {
  id           String      @id @default(uuid())
  studentId    String
  student      User        @relation(fields: [studentId], references: [id])
  vendorId     String
  vendor       Vendor      @relation(fields: [vendorId], references: [id])
  orderType    OrderType   // dine_in, takeaway
  status       OrderStatus @default(pending)
  note         String?
  totalPrice   Decimal
  queueNumber  Int
  items        OrderItem[]
  createdAt    DateTime    @default(now())
  readyAt      DateTime?
  completedAt  DateTime?
}

model OrderItem {
  id         String    @id @default(uuid())
  orderId    String
  order      Order     @relation(fields: [orderId], references: [id])
  menuItemId String
  menuItem   MenuItem  @relation(fields: [menuItemId], references: [id])
  quantity   Int
  unitPrice  Decimal
  options    Json?
  subtotal   Decimal
}

enum Role { student vendor admin }
enum OrderType { dine_in takeaway }
enum OrderStatus { pending accepted cooking ready completed cancelled }

จากนั้นสร้าง NestJS modules ต่อไปนี้ (แต่ละ module มี controller + service + DTO
พร้อม validation ด้วย class-validator):

- AuthModule: register/login ด้วย JWT, แยก role guard (student/vendor/admin)
- VendorsModule: CRUD ร้านค้า, toggle isOpen
- MenuModule: CRUD เมนู, toggle isDailySpecial/isAvailable (เฉพาะ owner ของร้าน)
- OrdersModule:
  - POST /orders สร้างออเดอร์ใหม่ (คำนวณ totalPrice, queueNumber อัตโนมัติ)
  - PATCH /orders/:id/status เปลี่ยนสถานะออเดอร์ (guard เฉพาะ vendor เจ้าของร้าน)
    เมื่อเปลี่ยนเป็น 'ready' ให้ trigger ส่ง notification ผ่าน WebSocket ทันที
  - GET /orders/vendor/:vendorId ดึงคิวออเดอร์ของร้าน (filter ตาม status)
  - GET /orders/student/:studentId ดึงประวัติออเดอร์ของนักศึกษา
- AnalyticsModule: endpoint คำนวณยอดขายรายวัน/สัปดาห์/เดือน, เมนูขายดี,
  ช่วงเวลาขายดี (query จาก orders/order_items จริง ไม่ hardcode)
- NotificationsModule: จัดการ WebSocket gateway (Socket.io) สำหรับ real-time
  อัปเดตสถานะออเดอร์ทั้งฝั่ง student และ vendor
- AiModule: endpoint ที่รับคำถามจากแดชบอร์ดแม่ค้า แล้วเรียก Anthropic API
  โดยใช้ function calling ให้ AI เรียก query ข้อมูลจริงจาก AnalyticsModule
  ก่อนตอบเสมอ (ห้ามให้ AI สร้างตัวเลขเอง) — ใช้ ANTHROPIC_API_KEY จาก .env

เขียน unit test เบื้องต้นสำหรับ OrdersModule (การคำนวณ queueNumber, totalPrice)

================================================================
ขั้นตอนที่ 3: Vendor Dashboard (apps/web) — Next.js + Tailwind
================================================================
- ใช้ App Router, เชื่อม Backend ผ่าน REST API + Socket.io client สำหรับ real-time
- หน้า /login สำหรับแม่ค้า
- หน้า /dashboard/menu จัดการเมนู (CRUD, toggle เมนูประจำวัน/พร้อมขาย)
- หน้า /dashboard/orders คิวออเดอร์แบบ Kanban 3 คอลัมน์ (รอรับออเดอร์ / กำลังเตรียมอาหาร / พร้อมรับอาหาร) โดยมีปุ่มกด "รับออเดอร์" สำหรับออเดอร์ใหม่ และปุ่ม "เสร็จแล้ว (แจ้งเตือน)" เมื่อปรุงเสร็จ
  subscribe WebSocket เพื่ออัปเดต real-time ไม่ต้อง refresh หน้า
- หน้า /dashboard/analytics กราฟยอดขาย (ใช้ recharts) + เมนูขายดี + คำนวณรายได้
- Component AI Chat widget มุมขวาล่าง เรียก /ai endpoint ของ backend
- ใช้ React Query (TanStack Query) สำหรับ data fetching + cache

================================================================
ขั้นตอนที่ 4: Student App (apps/mobile) — Expo + TypeScript
================================================================
- ใช้ Expo Router สำหรับ navigation
- หน้า Home: รายชื่อร้านค้า (fetch จาก backend), ค้นหา/กรอง
- หน้า Vendor Detail: เมนูแยกหมวด (เมนูประจำวัน/ทั่วไป), เพิ่มลงตะกร้า
- หน้า Cart: ปรับจำนวน, เลือก dine_in/takeaway, กรอก note, ยืนยันสั่งซื้อ
- หน้า Order Tracking: subscribe Socket.io แสดงสถานะ real-time เป็น step progress
- ตั้งค่า Expo push notifications (expo-notifications) รับแจ้งเตือนเมื่อสถานะเป็น ready
- หน้า Order History + ปุ่มสั่งซ้ำ + ให้รีวิว
- ใช้ Zustand หรือ Context API จัดการ cart state

================================================================
ขั้นตอนที่ 5: Environment & Config
================================================================
สร้างไฟล์ .env.example ในแต่ละ app ระบุตัวแปรที่ต้องใช้:
- backend: DATABASE_URL (Supabase connection string), JWT_SECRET, ANTHROPIC_API_KEY, PORT
- web: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
- mobile: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WS_URL

================================================================
ลำดับการทำงานที่ต้องการ
================================================================
1. เริ่มจากตั้งค่า monorepo + docker-compose + Prisma schema ก่อน
2. สร้าง Backend ให้ครบทุก module ตามข้อ 2 พร้อมรัน migration ทดสอบว่า schema ถูกต้อง
3. สร้าง Vendor Dashboard เชื่อมกับ Backend จริง ทดสอบ flow จัดการเมนู + คิวออเดอร์
4. สร้าง Student App เชื่อมกับ Backend เดียวกัน ทดสอบว่าออเดอร์ที่สั่งจากมือถือ
   ไปโผล่ที่คิวออเดอร์ของแดชบอร์ดแบบ real-time
5. เชื่อม AI module เป็นลำดับสุดท้าย

ให้เริ่มจากขั้นตอนที่ 1 ก่อน อธิบายทุกคำสั่ง terminal ที่ต้องรัน และสร้างไฟล์ทีละส่วน
ไม่ต้องรวบทุกอย่างในครั้งเดียว
```

---

### หมายเหตุการใช้งาน

- Prompt นี้ยาวมาก แนะนำวางเป็นข้อความแรกทั้งก้อน แล้วให้ Claude Code เริ่มจาก **ขั้นตอนที่ 1** ก่อน อย่าเพิ่งเร่งให้ทำทุกขั้นตอนพร้อมกันในคำสั่งเดียว เดี๋ยวโค้ดจะไม่สมบูรณ์
- ระหว่างทางถ้า Claude Code ถามอะไร (เช่น เลือก package manager, ชื่อ database) ให้ตอบตามที่ระบุไว้ในสเปก หรือปรับตามความสะดวกของเครื่อง
- ต้องติดตั้ง Node.js เวอร์ชันล่าสุดและ pnpm ในเครื่อง ส่วนฐานข้อมูลใช้ Supabase
  (สมัครฟรีที่ supabase.com สร้างโปรเจกต์ใหม่ แล้วคัดลอก connection string มาใส่
  ใน apps/backend/.env) — ไม่ต้องติดตั้งหรือรัน PostgreSQL ในเครื่องเอง
- Anthropic API key ต้องขอจาก console.anthropic.com แล้วใส่ใน apps/backend/.env
