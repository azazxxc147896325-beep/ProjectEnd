# Campus Food Ordering System (Monorepo) 🎓🍔

ระบบสั่งอาหารในมหาวิทยาลัยแบบ Monorepo ครบวงจร ประกอบด้วย:

1. **`apps/backend`**: REST API Server + WebSocket Gateway (NestJS + Prisma + PostgreSQL / Supabase + Anthropic Claude)
2. **`apps/web`**: Vendor Dashboard สำหรับแม่ค้า/ร้านค้า (Next.js App Router + Tailwind CSS + TanStack Query + Recharts)
3. **`apps/mobile`**: Student App สำหรับนักศึกษาสั่งอาหาร (React Native ด้วย Expo + TypeScript + Zustand + Realtime Tracking)
4. **`packages/shared-types`**: คลัง Type/Interface/Enum ภาษา TypeScript กลางที่แชร์ร่วมกันทั้งระบบ

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── apps/
│   ├── backend/            # NestJS API Server + Prisma ORM
│   ├── web/                # Next.js Vendor Dashboard
│   └── mobile/             # Expo React Native Student App
├── packages/
│   └── shared-types/       # Shared TypeScript Types, Enums & Interfaces
├── pnpm-workspace.yaml     # pnpm Monorepo Workspace Configuration
├── tsconfig.base.json      # Base TypeScript Configuration
├── .prettierrc             # Code Formatter Configuration
└── README.md
```

---

## 🚀 ขั้นตอนการติดตั้งและการเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)

- **Node.js**: เวอร์ชัน `>= 20.x`
- **pnpm**: เวอร์ชัน `>= 9.x` หรือ `11.x` (`npm install -g pnpm`)

### 2. ตั้งค่าฐานข้อมูล PostgreSQL (ผ่าน Supabase โดยไม่ต้องติดตั้ง PostgreSQL ในเครื่อง)

1. ไปที่ [Supabase.com](https://supabase.com) แล้วสมัคร/เข้าสู่ระบบ (ใช้งานฟรี)
2. สร้างโปรเจกต์ใหม่ (Create New Project)
3. ไปที่เมนู **Project Settings** > **Database**
4. เลื่อนลงมาที่ส่วน **Connection String**:
   - เลือกแท็บ **URI** หรือ **Transaction** pooling mode (Port 6543 หรือ Session 5432)
   - คัดลอก Connection URL เช่น:
     ```text
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
5. นำ URL ดังกล่าวมาใส่ในไฟล์ `apps/backend/.env` ที่ตัวแปร `DATABASE_URL`

### 3. ติดตั้ง Dependencies และ Build Types

```bash
# ติดตั้ง dependencies ทั้งหมดใน monorepo
pnpm install

# Build shared types
pnpm build:types
```

### 4. รัน Database Migration (Prisma)

สร้างตารางบนฐานข้อมูล Supabase อัตโนมัติ:

```bash
cd apps/backend
cp .env.example .env
# (แก้ไขค่า DATABASE_URL และ JWT_SECRET ใน .env)
npx prisma migrate dev --name init
```

### 5. คำสั่งสำหรับรันโปรเจกต์ (Development Scripts)

สามารถรันแต่ละ Service แยกกันได้ดังนี้:

| ส่วนงาน                | คำสั่งจาก Root Monorepo | URL เริ่มต้น                                                        |
| ---------------------- | ----------------------- | ------------------------------------------------------------------- |
| **Backend API**        | `pnpm dev:backend`      | http://localhost:4000/api (Swagger: http://localhost:4000/api/docs) |
| **Vendor Dashboard**   | `pnpm dev:web`          | http://localhost:3000                                               |
| **Student Mobile App** | `pnpm dev:mobile`       | Expo DevTools / QR Code (Expo Go)                                   |

---

## 🔑 ตัวแปรสภาพแวดล้อม (Environment Variables)

ดูตัวอย่างการตั้งค่าทั้งหมดได้จาก [.env.example](file:///.env.example)

- **`apps/backend/.env`**:
  - `DATABASE_URL`: Supabase PostgreSQL connection string
  - `PORT`: พอร์ตของ Backend API (ค่าเริ่มต้น `4000`)
  - `JWT_SECRET`: Secret key สำหรับเข้ารหัส JWT token
  - `ANTHROPIC_API_KEY`: API Key จาก Anthropic Console สำหรับระบบ AI Assistant

- **`apps/web/.env.local`**:
  - `NEXT_PUBLIC_API_URL`: `http://localhost:4000/api`
  - `NEXT_PUBLIC_WS_URL`: `http://localhost:4000`

- **`apps/mobile/.env`**:
  - `EXPO_PUBLIC_API_URL`: `http://localhost:4000/api` (หรือใช้ IP ของเครื่องคอมพิวเตอร์เมื่อทดสอบผ่านมือถือจริง)
  - `EXPO_PUBLIC_WS_URL`: `http://localhost:4000`

---

## 🧪 การทดสอบ (Testing)

```bash
# รัน Unit Tests ใน Backend
cd apps/backend
pnpm test
```
