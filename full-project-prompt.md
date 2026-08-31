# Master Prompt: Campus Food Ordering & Management System (Monorepo)

> **คู่มือการใช้งาน**: สามารถคัดลอก Prompt ด้านล่างทั้งหมดไปใส่ใน AI Coding Assistant (เช่น Claude Code, Antigravity, Cursor, หรือ ChatGPT) ในโฟลเดอร์ว่าง เพื่อสร้างโปรเจกต์นี้ทั้งหมดตั้งแต่เริ่มต้นจนจบ

---

```markdown
# Role & Goal
คุณคือ Senior Full-Stack Software Architect และ Lead Engineer หน้าที่ของคุณคือสร้างระบบสั่งอาหารในมหาวิทยาลัยแบบครบวงจร (Campus Food Ordering & Management System) ในรูปแบบ Monorepo ที่มีระบบ Real-time, ระบบคิวอัจฉริยะ, แดชบอร์ดวิเคราะห์ยอดขาย และฟีเจอร์ AI Copilot ช่วยเหลือทั้งฝั่งร้านค้าและนักศึกษา

---

# Architecture & Tech Stack Overview

โปรเจกต์เป็น Monorepo จัดการด้วย **pnpm workspaces** ประกอบด้วย 4 แพ็กเกจหลัก:

1. **`packages/shared-types`**: TypeScript Library สำหรับ Type definitions, Enums, DTO interfaces, และ WebSocket Events ที่แชร์ร่วมกัน
2. **`apps/backend`**: API Server สร้างด้วย **NestJS + TypeScript + Prisma ORM + PostgreSQL (Supabase)** พร้อมระบบ **Socket.io WebSocket Gateway** และ **AI Function Calling**
3. **`apps/web`**: Vendor Dashboard สำหรับแม่ค้า/เจ้าของร้าน สร้างด้วย **Next.js (App Router) + TypeScript + Tailwind CSS + TanStack Query + Lucide Icons + Recharts**
4. **`apps/mobile`**: Student Mobile App สำหรับนักศึกษา สร้างด้วย **React Native + Expo (Expo Router) + TypeScript + Zustand + Lucide Icons**

---

# Data Model & Prisma Schema

เชื่อมต่อ PostgreSQL (Supabase) ด้วย Prisma ORM (`apps/backend/prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  VENDOR
  ADMIN
}

enum OrderType {
  DINE_IN   // ทานที่ร้าน
  TAKEAWAY  // รับกลับบ้าน
}

enum OrderStatus {
  PENDING    // รอรับออเดอร์ / อยู่ในคิว
  ACCEPTED   // ร้านค้ารับออเดอร์แล้ว
  COOKING    // กำลังปรุง (รองรับ backward compatibility)
  READY      // อาหารปรุงเสร็จแล้ว พร้อมรับ
  COMPLETED  // ลูกค้ารับอาหารแล้ว / เสร็จสิ้น
  CANCELLED  // ยกเลิกคำสั่งซื้อ
}

enum CancelledBy {
  USER
  VENDOR
  SYSTEM
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  fullName  String
  phone     String?
  role      Role     @default(STUDENT)
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  vendor    Vendor?
  orders    Order[]

  @@map("users")
}

model Vendor {
  id          String   @id @default(uuid())
  ownerId     String   @unique
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  name        String
  description String?
  logoUrl     String?
  bannerUrl   String?
  location    String?
  isOpen      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  menuItems   MenuItem[]
  orders      Order[]

  @@map("vendors")
}

model MenuItem {
  id             String      @id @default(uuid())
  vendorId       String
  vendor         Vendor      @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  name           String
  description    String?
  price          Decimal     @db.Decimal(10, 2)
  imageUrl       String?
  category       String      @default("ทั่วไป")
  isAvailable    Boolean     @default(true)
  isDailySpecial Boolean     @default(false)
  deletedAt      DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  orderItems     OrderItem[]

  @@map("menu_items")
}

model Order {
  id           String       @id @default(uuid())
  studentId    String
  student      User         @relation(fields: [studentId], references: [id])
  vendorId     String
  vendor       Vendor       @relation(fields: [vendorId], references: [id])
  orderType    OrderType    @default(DINE_IN)
  status       OrderStatus  @default(PENDING)
  totalPrice   Decimal      @db.Decimal(10, 2)
  queueNumber  Int
  note         String?
  cancelReason String?
  cancelledBy  CancelledBy?
  readyAt      DateTime?
  completedAt  DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  items        OrderItem[]

  @@map("orders")
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  quantity   Int      @default(1)
  unitPrice  Decimal  @db.Decimal(10, 2)
  subtotal   Decimal  @db.Decimal(10, 2)
  options    Json?
  createdAt  DateTime @default(now())

  @@map("order_items")
}
```

---

# Detailed Package Specifications

## 1. `packages/shared-types`
สร้าง Type Definitions และ Enums สำหรับใช้งานร่วมกัน:
- Enums: `Role`, `OrderType`, `OrderStatus`, `CancelledBy`, `WsEvents`
- Models: `User`, `Vendor`, `MenuItem`, `Order`, `OrderItem`
- DTOs: `CreateOrderDto`, `UpdateOrderStatusDto`, `AiRecommendationDto`, `AnalyticsResponse`
- `WsEvents`:
  - `JOIN_VENDOR_ROOM = 'join_vendor_room'`
  - `LEAVE_VENDOR_ROOM = 'leave_vendor_room'`
  - `JOIN_ORDER_ROOM = 'join_order_room'`
  - `LEAVE_ORDER_ROOM = 'leave_order_room'`
  - `NEW_ORDER = 'new_order'`
  - `ORDER_STATUS_UPDATED = 'order_status_updated'`
  - `ORDER_READY = 'order_ready'`

---

## 2. `apps/backend` (NestJS API & Real-time Server)

### โครงสร้างโมดูล:
- **`AuthModule`**:
  - `POST /auth/register` & `POST /auth/login` (JWT payload พร้อม userId, role)
  - `JwtAuthGuard` & `RolesGuard` (`@Roles(Role.VENDOR, Role.STUDENT)`)
- **`VendorsModule`**:
  - `GET /vendors` (ดึงรายการร้านทั้งหมด พร้อมสถานะ isOpen)
  - `GET /vendors/:id` (ดึงข้อมูลร้านและเมนู)
  - `PATCH /vendors/:id/status` (เปิด/ปิดร้าน)
- **`MenuModule`**:
  - `GET /menu/vendor/:vendorId`
  - `POST /menu` (เฉพาะ vendor เจ้าของร้าน)
  - `PATCH /menu/:id` (แก้ไขราคา, ข้อมูล, toggle `isDailySpecial`, toggle `isAvailable`)
  - `DELETE /menu/:id` (Soft-delete โดยเซ็ต `deletedAt`)
- **`OrdersModule` (Business Logic สำคัญ)**:
  - `POST /orders`:
    - ใช้ **Prisma Transaction** เพื่อคำนวณ `queueNumber` อัตโนมัติ (รีเซ็ตคิวทุกวันเริ่มต้นที่ #1) ป้องกัน Race Condition
    - คำนวณ `totalPrice` จากราคาจริงใน DB ป้องกันการปลอมแปลงราคาจาก client
    - ยิง Socket.io event `NEW_ORDER` ไปยัง Vendor Room แบบ Real-time
  - `PATCH /orders/:id/status`:
    - อัปเดตสถานะ (เช่น `PENDING` -> `ACCEPTED` -> `READY` -> `COMPLETED`)
    - เมื่อสถานะเปลี่ยนเป็น `READY`: บันทึก `readyAt = now()` และยิง Socket.io event `ORDER_READY` & `ORDER_STATUS_UPDATED` ไปยัง Order Room ของนักศึกษา
  - `PATCH /orders/:id/cancel`:
    - อนุญาตให้นักศึกษายกเลิกได้เฉพาะสถานะ `PENDING` (ก่อนที่ร้านค้าจะกดรับออเดอร์)
  - `PATCH /orders/:id/confirm-receipt`:
    - นักศึกษากดยืนยันรับอาหาร เปลี่ยนสถานะเป็น `COMPLETED`
  - `GET /orders/vendor/:vendorId` & `GET /orders/student/:studentId`
- **`AnalyticsModule`**:
  - `GET /analytics/vendor/:vendorId/summary` (ยอดขายรวม, จำนวนออเดอร์, ยอดเฉลี่ยต่อบิล)
  - `GET /analytics/vendor/:vendorId/revenue-trends` (กราฟรายได้ ย้อนหลัง 7 วัน/30 วัน)
  - `GET /analytics/vendor/:vendorId/top-items` (เมนูขายดี)
  - `GET /analytics/vendor/:vendorId/peak-hours` (ช่วงเวลาที่มีออเดอร์หนาแน่น)
- **`NotificationsModule`**:
  - `NotificationsGateway` (`@WebSocketGateway({ cors: true })`) จัดการ Rooms (`vendor_{id}`, `order_{id}`)
  - `NotificationsService` ส่ง real-time broadcast
- **`AiModule` (AI Copilot & Recommender)**:
  - **สำหรับแม่ค้า (Vendor Copilot)**: `POST /ai/vendor-chat`
    - เชื่อมต่อ AI ด้วยระบบ **Function/Tool Calling** บังคับให้ AI เรียก query ข้อมูลจริงจาก `AnalyticsService` ก่อนตอบ (ห้ามมโนตัวเลขเอง)
    - เครื่องมือ Tool Calling: `query_daily_analytics`, `query_popular_items`, `query_peak_hours`
  - **สำหรับนักศึกษา (AI Food Advisor)**: `POST /ai/recommend-food`
    - รับเงื่อนไข: งบประมาณ (Budget), ความอยากทาน (Craving), ข้อจำกัดอาหาร (แพ้อาหาร/มังสวิรัติ)
    - วิเคราะห์และจับคู่กับเมนูจริงของร้านที่เปิดอยู่ ณ ปัจจุบัน

---

## 3. `apps/web` (Vendor Dashboard — Next.js 14 App Router)

### หน้าจอและองค์ประกอบ:
- **ธีมและการออกแบบ**: Modern Glassmorphic Dark UI สวยงามระดับพรีเมียม ใช้โทนสี Emerald / Dark Slate (#0A110E, #111E18, #10B981) พร้อม Micro-animations
- **`/login`**: หน้าล็อกอินสำหรับร้านค้า
- **`/dashboard/orders` (Kanban คิวออเดอร์ 3 คอลัมน์ พร้อมปุ่มรับออเดอร์)**:
  - **คอลัมน์ 1: "รอรับออเดอร์ (คิวใหม่)"**
    - แสดงคิวหมายเลขใหญ่ชัดเจน, รายการอาหาร, ตัวเลือกพิเศษ, หมายเหตุลูกค้า, ยอดรวม
    - ปุ่มกด: ❌ ปฏิเสธคำสั่งซื้อ | ✅ **"รับออเดอร์"** (เปลี่ยนสถานะเป็น `ACCEPTED` และย้ายไปคอลัมน์กำลังเตรียม)
  - **คอลัมน์ 2: "กำลังเตรียมอาหาร (รับแล้ว)"**
    - แสดงคิวที่ร้านค้ายืนยันรับออเดอร์แล้วและกำลังปรุง
    - ปุ่มกด: 🔔 **"เสร็จแล้ว (แจ้งเตือน)"** (เปลี่ยนสถานะเป็น `READY` และส่ง Push Noti เตือนนักศึกษาทันที)
  - **คอลัมน์ 3: "พร้อมรับอาหาร / เสร็จแล้ว"**
    - แสดงคิวที่ทำเสร็จแล้วและแจ้งเตือนลูกค้าแล้ว
    - ปุ่มกด: 🎉 **"ลูกค้ารับแล้ว"** (เปลี่ยนเป็น `COMPLETED`)
  - Real-time Alert Banner เมื่อมีออเดอร์ใหม่เข้ามา
  - ฟิลเตอร์แยก: ทั้งหมด / ทานที่ร้าน / รับกลับบ้าน
- **`/dashboard/menu` (จัดการเมนู + AI Image Generation)**:
  - เพิ่ม/แก้ไข/ลบ เมนูอาหาร พร้อมสวิตช์ toggle เมนูประจำวัน / พร้อมขาย
  - แกลเลอรีรูปภาพอาหาร AI และปุ่มค้นหา/สร้างรูปเมนูอาหาร
- **`/dashboard/analytics` (วิเคราะห์ธุรกิจ)**:
  - การ์ดยอดขายรวม, ออเดอร์ทั้งหมด, บิลเฉลี่ย
  - กราฟแนวโน้มยอดขายแบบ Interactive (Recharts)
  - ตาราง 5 อันดับเมนูขายดี
- **AI Assistant Widget (มุมขวาล่าง)**:
  - แชตบอทถาม-ตอบอัจฉริยะสำหรับแม่ค้า เช่น *"วันนี้เมนูไหนขายดีสุด?", "ช่วงบ่ายสองควรเตรียมวัตถุดิบอะไร?"*

---

## 4. `apps/mobile` (Student Mobile App — Expo + TypeScript)

### หน้าจอและฟังก์ชัน:
- **ธีมและการออกแบบ**: Dark Forest Green (#0A110E, #162720, #10B981) สบายตาและคมชัด
- **Tab 1: หน้าหลัก (`/(tabs)/index`)**:
  - แบนเนอร์เมนูแนะนำประจำวัน (Daily Specials)
  - หมวดหมู่อาหาร (ข้าว, ก๋วยเตี๋ยว, เครื่องดื่ม, ของทานเล่น)
  - รายการร้านค้าในมหาวิทยาลัย พร้อม badge เปิด/ปิด
  - แตะเพื่อเข้าสู่หน้ารายละเอียดร้าน (`/vendor/[id]`) เพื่อเลือกอาหารและปรับ Options
- **Tab 2: AI สั่งอาหาร (`/(tabs)/ai`)**:
  - กรอกงบประมาณ, ประเภทอาหารที่อยากทาน, ข้อจำกัดอาหาร
  - AI ประมวลผลและแนะนำเมนูจากร้านค้าจริง พร้อมปุ่มกดเพิ่มลงตะกร้าทันที
- **Tab 3: ตะกร้าสินค้า (`/(tabs)/cart`)**:
  - จัดกลุ่มรายการอาหารตามร้านค้า
  - เลือกประเภทการสั่ง: "🍽️ ทานที่ร้าน" หรือ "🛍️ รับกลับบ้าน"
  - ช่องกรอกหมายเหตุถึงพ่อครัว/แม่ค้า
  - ปุ่มยืนยันการสั่งซื้อ พร้อมแสดงยอดรวมสุทธิ
- **Tab 4: ประวัติและคิวออเดอร์ (`/(tabs)/orders`)**:
  - แท็บ "กำลังดำเนินการ" และแท็บ "ประวัติที่ผ่านมา"
  - ปุ่มกด "ติดตามสถานะ", "สั่งซ้ำ (1-Tap Reorder)", และ "ให้คะแนนรีวิว"
- **หน้ารอคิวและติดตามสถานะ Real-time (`/order/[id]`)**:
  - การ์ดหมายเลขคิวขนาดใหญ่พร้อมแอนิเมชัน Pulse นุ่มนวล
  - ไทม์ไลน์ติดตามสถานะ Real-time 4 ขั้นตอน:
    1. 🕒 **รอร้านรับออเดอร์** (คำสั่งซื้อส่งแล้ว รอร้านค้ายืนยัน)
    2. 👨‍🍳 **ร้านรับออเดอร์แล้ว** (ร้านค้ากำลังเตรียมอาหารตามคิว)
    3. 🔔 **อาหารพร้อมรับแล้ว 🎉** (อาหารปรุงเสร็จแล้ว กรุณาไปรับที่หน้าร้าน)
    4. 🍽️ **รับประทานให้อร่อย (เสร็จสมบูรณ์)**
  - รับการแจ้งเตือน Real-time ผ่าน WebSocket และ Local Push Notification ทันทีที่แม่ค้ากดเสร็จ
  - ปุ่มยกเลิกคำสั่งซื้อ (ก่อนร้านค้ารับออเดอร์)
  - ปุ่มยืนยัน "ฉันได้รับอาหารเรียบร้อยแล้ว"

---

# ลำดับขั้นตอนการสร้างโปรเจกต์ (Step-by-Step Implementation Guide)

### ขั้นตอนที่ 1: ติดตั้งโครงสร้าง Monorepo
1. สร้างไฟล์ `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`
2. สร้าง `packages/shared-types` พร้อม exports enums, models, DTOs
3. รัน `pnpm install`

### ขั้นตอนที่ 2: สร้าง Backend (NestJS + Prisma + Supabase)
1. Initialize NestJS ใน `apps/backend`
2. ติดตั้ง `@prisma/client`, `prisma`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `class-validator`, `class-transformer`, `@nestjs/websockets`, `socket.io`, `bcryptjs`
3. ตั้งค่า `prisma/schema.prisma` และรัน `npx prisma generate`
4. สร้าง Module: `Auth`, `Users`, `Vendors`, `Menu`, `Orders`, `Analytics`, `Notifications`, `Ai`
5. เขียน Unit Test ด้วย Jest สำหรับ `OrdersService` (การคำนวณคิวและยอดเงิน)

### ขั้นตอนที่ 3: สร้าง Vendor Dashboard (Next.js)
1. Initialize Next.js 14 ใน `apps/web`
2. ติดตั้ง `tailwindcss`, `@tanstack/react-query`, `lucide-react`, `recharts`, `socket.io-client`, `clsx`, `tailwind-merge`
3. สร้างหน้า `/login`, `/dashboard/orders` (Kanban 2 คอลัมน์), `/dashboard/menu`, `/dashboard/analytics` และ AI Copilot widget

### ขั้นตอนที่ 4: สร้าง Student Mobile App (Expo)
1. Initialize Expo ด้วย Expo Router ใน `apps/mobile`
2. ติดตั้ง `zustand`, `lucide-react-native`, `socket.io-client`, `expo-notifications`
3. สร้างโครงสร้าง Tabs: `index`, `ai`, `cart`, `orders`, `profile`
4. สร้างหน้ารายละเอียดร้านค้าและหน้า Live Tracking `/order/[id]`

### ขั้นตอนที่ 5: การตรวจสอบและทดสอบระบบ
1. รัน Backend Unit Tests: `cd apps/backend && npm test`
2. Typecheck ทั้งหมด: `npx tsc --noEmit`
3. ทดสอบ Real-time Lifecycle: นักศึกษาสั่งออเดอร์ -> ร้านค้าได้รับแจ้งเตือนบน Kanban -> ร้านค้ากดเสร็จแล้ว -> นักศึกษาได้รับ Push Notification และหน้าจอเปลี่ยนเป็นพร้อมรับทันที
```
