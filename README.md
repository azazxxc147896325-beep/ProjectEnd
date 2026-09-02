# 🎓 Campus Food: Smart Canteen & AI-Powered Food Ordering Ecosystem 🍔⚡

> **ระบบสั่งอาหารโรงอาหารมหาวิทยาลัยอัจฉริยะแบบครบวงจร (Full-cycle Smart Canteen Platform)**  
> พัฒนาด้วยสถาปัตยกรรม **Monorepo (TypeScript 100%)** ครอบคลุมทั้ง **แอปพลิเคชันมือถือนักศึกษา**, **เว็บแดชบอร์ดร้านค้า**, **ระบบคิดเงินหน้าร้าน (POS)**, **จอแสดงผลในครัว (KDS)**, **จอแสดงคิวลูกค้า (Queue TV Board)**, **จอสอง Sunmi POS** และ **ผู้ช่วย AI อัจฉริยะ "น้องหยก"** พร้อมระบบติดตามคิวและคำสั่งซื้อแบบ **Real-time (WebSockets)**

---

## 📌 สารบัญ (Table of Contents)

1. [🌟 ภาพรวมของโครงการและปัญหาที่แก้ไข (Project Overview & Problem Statement)](#-ภาพรวมของโครงการและปัญหาที่แก้ไข-project-overview--problem-statement)
2. [🏗️ สถาปัตยกรรมระบบและแผนผังการทำงาน (System Architecture & Diagrams)](#️-สถาปัตยกรรมระบบและแผนผังการทำงาน-system-architecture--diagrams)
3. [📦 ส่วนประกอบภายใน Monorepo (Project Modules Breakdown)](#-ส่วนประกอบภายใน-monorepo-project-modules-breakdown)
4. [🛠️ ตารางเทคโนโลยีที่เลือกใช้ (Technology Stack Overview)](#️-ตารางเทคโนโลยีที่เลือกใช้-technology-stack-overview)
5. [💡 เหตุผลเบื้องหลังการเลือก Framework & Tech Stack (Engineering Rationale / ADR)](#-เหตุผลเบื้องหลังการเลือก-framework--tech-stack-engineering-rationale--adr)
6. [✨ ฟีเจอร์หลักของระบบ (Key Features & Capabilities)](#-ฟีเจอร์หลักของระบบ-key-features--capabilities)
7. [🔒 ความปลอดภัยและคุณภาพซอฟต์แวร์ (Security & Quality Engineering)](#-ความปลอดภัยและคุณภาพซอฟต์แวร์-security--quality-engineering)
8. [📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Directory Structure)](#-โครงสร้างโฟลเดอร์ของโปรเจกต์-directory-structure)
9. [🚀 คู่มือการติดตั้งและการเริ่มใช้งาน (Getting Started & Setup Guide)](#-คู่มือการติดตั้งและการเริ่มใช้งาน-getting-started--setup-guide)
10. [👥 บัญชีผู้ใช้ตัวอย่างสำหรับทดสอบ (Demo Accounts & Seed Data)](#-บัญชีผู้ใช้ตัวอย่างสำหรับทดสอบ-demo-accounts--seed-data)

---

## 🌟 ภาพรวมของโครงการและปัญหาที่แก้ไข (Project Overview & Problem Statement)

### 🔴 ปัญหาเดิมของโรงอาหารมหาวิทยาลัย (Pain Points)

1. **ความแออัดและคิวยาวในช่วงเวลาพักเที่ยง**: นักศึกษาต้องเสียเวลาพักอันมีค่าไปกับการยืนรอคิวหน้าร้านอาหาร โดยไม่รู้ว่าต้องรอนานเท่าใด
2. **ปัญหา "มื้อนี้กินอะไรดี?"**: นักศึกษาเกิดความลังเล มีข้อจำกัดด้านงบประมาณ หรือความต้องการทางโภชนาการเฉพาะ (คลีน, เผ็ดน้อย, ฮาลาล) แต่ไม่มีเครื่องมือช่วยตัดสินใจ
3. **ความสับสนในการจัดการคิวของร้านค้า**: แม่ค้าต้องรับออเดอร์ จดมือ ทำอาหาร คิดเงิน และคอยตะโกนเรียกคิวพร้อมกัน ทำให้เกิดความผิดพลาด ลืมออเดอร์ หรือคิดเงินผิด
4. **ขาดข้อมูลสถิติเพื่อการบริหารสต็อก**: ร้านค้าไม่ทราบช่วงเวลาเร่งด่วนที่แท้จริง (Peak Hours) และยอดขายรายเมนู ทำให้เตรียมวัตถุดิบขาดหรือเหลือทิ้ง

### 🟢 โซลูชันของ Campus Food Ecosystem

**Campus Food** เชื่อมต่อทุกภาคส่วนในโรงอาหารเข้าด้วยกันเป็นระบบดิจิทัลแบบครบวงจร (Single Unified Ecosystem):

- **📱 Student Mobile App**: สั่งอาหารล่วงหน้า ระบุทานที่ร้านหรือสั่งกลับบ้าน ติดตามสถานะคิวแบบ Real-time และมี **AI "น้องหยก"** ช่วยแนะนำเมนูตามงบและรสชาติ
- **💻 Vendor Web Dashboard**: จัดการออเดอร์ในรูปแบบ **Kanban Board**, จัดการเมนู/สต็อก และดูรายงานสถิติยอดขายพร้อมช่วงเวลาขายดี
- **🧾 POS System (`/pos`)**: ระบบคิดเงินหน้าร้านสำหรับพนักงาน ออกบัตรคิว ชำระเงินผ่าน PromptPay Dynamic QR หรือเงินสด พร้อมสั่งพิมพ์สลิปความร้อน (Thermal Receipt)
- **👨‍🍳 Kitchen Display System (`/kds`)**: หน้าจอสัมผัสสำหรับพ่อครัว/แม่ครัวในครัว เห็นออเดอร์ชัดเจน มีตัวจับเวลาความล่าช้า และเสียงกระดิ่งแจ้งเตือน
- **📺 Customer Queue Display (`/queue-display`)**: หน้าจอทีวีขนาดใหญ่ติดตั้งหน้าร้าน/โรงอาหาร แสดงเลขคิว "กำลังปรุง" และ "พร้อมรับอาหาร" อัปเดตสดแบบเสี้ยววินาที
- **🖥️ Sunmi Dual-Screen Display (`/sunmi`, `/sunmi-display`)**: ระบบจอแสดงผลสองด้านสำหรับเครื่อง Sunmi Android POS แสดงยอดเงินและ QR Code ให้ลูกค้าสแกนจ่าย

---

## 🏗️ สถาปัตยกรรมระบบและแผนผังการทำงาน (System Architecture & Diagrams)

### 1. แผนผังสถาปัตยกรรมภาพรวม (System Architecture Diagram)

```mermaid
graph TD
    subgraph Client Apps Layer
        Mobile["📱 Mobile App<br/>(React Native / Expo SDK 54 / Expo Router)"]
        WebDash["💻 Vendor Dashboard<br/>(Next.js 14 App Router / Tailwind)"]
        WebPOS["🧾 POS Cashier System<br/>(Next.js 14 / Thermal Slip Print)"]
        WebKDS["👨‍🍳 Kitchen Display System - KDS<br/>(Next.js 14 / High Contrast Touch)"]
        WebQueue["📺 Customer Queue TV Display<br/>(Next.js 14 / Audio Chime Alerts)"]
        WebSunmi["🖥️ Sunmi Dual-Screen Display<br/>(Customer-Facing QR Screen)"]
    end

    subgraph Communication & Gateway Layer
        REST["🌐 RESTful API Gateway<br/>(HTTP/HTTPS, JWT Auth, Throttler)"]
        WS["⚡ Real-time WebSocket Gateway<br/>(Socket.IO Rooms: vendor_{id}, order_{id})"]
    end

    subgraph Backend Core Services
        Nest["🚀 NestJS 10 API Server<br/>(Modular, Dependency Injection, DTOs)"]
        AuthMod["🔑 Auth & RBAC Module<br/>(JWT, Passport, bcrypt)"]
        OrderMod["📋 Order & Queue Lifecycle Module<br/>(Atomic Transactions)"]
        MenuMod["🍲 Menu & Soft-Delete Module"]
        AnalyticsMod["📊 Analytics & Peak Hours Module"]
        AIMod["🤖 AI Engine Service<br/>(Anthropic Claude & Google Gemini 1.5)"]
    end

    subgraph Data & Persistence Layer
        Prisma["💎 Prisma ORM 6.x<br/>(Type-safe Query Builder)"]
        Postgres[("🐘 PostgreSQL Database<br/>(Supabase + PgBouncer Pool)")]
        SecureStore["🔐 SecureStore / Keystore<br/>(Encrypted Device Token)"]
    end

    %% Client Connections
    Mobile -->|REST API| REST
    Mobile <-->|Live Queue & Order Events| WS
    Mobile -.->|Store Token| SecureStore

    WebDash -->|REST API| REST
    WebDash <-->|Order Kanban Updates| WS

    WebPOS -->|Create Counter Order| REST
    WebPOS <-->|Payment Sync| WS

    WebKDS <-->|Live Kitchen Orders & Status Toggle| WS
    WebQueue <-->|Live Ready/Cooking Broadcasts| WS
    WebSunmi <-->|Live Payment QR Display| WS

    %% Gateway to Backend
    REST --> Nest
    WS --> Nest

    %% Nest Modules
    Nest --> AuthMod
    Nest --> OrderMod
    Nest --> MenuMod
    Nest --> AnalyticsMod
    Nest --> AIMod

    %% Persistence
    OrderMod --> Prisma
    MenuMod --> Prisma
    AnalyticsMod --> Prisma
    AuthMod --> Prisma
    Prisma --> Postgres
```

---

### 2. วงจรชีวิตของคำสั่งซื้อ (Order Lifecycle State Machine)

```mermaid
stateDiagram-v2
    [*] --> PENDING : 1. ลูกค้าสั่งอาหาร (Mobile หรือ POS หน้าร้าน)

    state PENDING {
        description: ออกหมายเลขคิว (Queue Number) อัตโนมัติในระดับ Database Transaction
    }

    PENDING --> CANCELLED : นักศึกษากดยกเลิก (ก่อนร้านเริ่มปรุง)
    PENDING --> CANCELLED : ร้านค้าปฏิเสธ (เช่น วัตถุดิบหมด)
    PENDING --> COOKING : ร้านค้า/พ่อครัวกดรับออเดอร์ (ผ่าน Dashboard หรือ KDS)

    state COOKING {
        description: ครัวกำลังปรุงอาหาร (แสดงบน KDS และ Queue Display ช่อง 'กำลังปรุง')
    }

    COOKING --> READY : ร้านค้า/ครัวปรุงอาหารเสร็จแล้ว

    state READY {
        description: ส่งเสียง Chime + แจ้งเตือนกระดิ่ง และขึ้นจอทีวี 'พร้อมรับอาหาร'
    }

    READY --> COMPLETED : นักศึกษาไปรับอาหาร & กดยืนยันการรับ (หรือร้านกดยืนยัน)

    COMPLETED --> [*] : บันทึกเข้าประวัติคำสั่งซื้อ (สามารถสั่งซ้ำ / รีวิวให้ดาวได้)
    CANCELLED --> [*] : บันทึกเหตุผลการยกเลิก (เช่น วัตถุดิบหมด หรือลูกค้ายกเลิก)
```

---

### 3. แผนภาพการทำงานของระบบ AI น้องหยก (AI Grounding Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Student as 📱 นักศึกษา (Mobile App)
    participant AI_Service as 🚀 Backend AI Service
    participant DB as 🐘 PostgreSQL Database (Prisma)
    participant LLM as 🤖 Google Gemini / Claude LLM

    Student->>AI_Service: ถามคำถาม "มีงบ 60 บาท อยากกินอะไรร้อนๆ เผ็ดๆ"
    AI_Service->>DB: ดึงข้อมูลร้านค้าและเมนูอาหารจริงที่ยัง 'isAvailable: true'
    Note over AI_Service,DB: Dynamic Grounding ป้องกัน AI หลอน (Hallucination)
    AI_Service->>LLM: ส่ง System Prompt (สวมบทบาทน้องหยก) + รายการเมนูจริงในฐานข้อมูล
    LLM-->>AI_Service: ตอบกลับเป็นบทสนทนาภาษาไทยที่เป็นกันเอง + JSON รายการเมนูที่แนะนำ
    AI_Service-->>Student: แสดงข้อความตอบกลับ พร้อม Render การ์ดเมนูที่มีปุ่ม "สั่งเมนูนี้เลย"
```

---

## 📦 ส่วนประกอบภายใน Monorepo (Project Modules Breakdown)

```text
campus-food-ordering-monorepo/
├── apps/
│   ├── backend/            # 🚀 NestJS REST API Server, WebSocket Gateway & AI Services
│   ├── web/                # 💻 Next.js 14 Web App (Dashboard, POS, KDS, Queue TV, Sunmi)
│   └── mobile/             # 📱 React Native Expo App (สำหรับนักศึกษา iOS & Android)
├── packages/
│   └── shared-types/       # 📦 คลัง Type Definitions, Enums, DTOs กลางที่แชร์ร่วมกัน 100%
├── pnpm-workspace.yaml     # กำหนดขอบเขต Workspace ของ Monorepo
├── tsconfig.base.json      # Base TypeScript Configuration
└── README.md
```

### 1. `apps/backend` (Backend Core Services)

- **NestJS 10**: สถาปัตยกรรมระดับองค์กร แยกโมดูลชัดเจน (`auth`, `orders`, `vendors`, `menu`, `ai`, `analytics`, `notifications`)
- **Prisma ORM 6.x**: จัดการ Schema, Migrations และ Type-safe Database Queries
- **Socket.IO Gateway**: จัดการ WebSocket Rooms สำหรับการแจ้งเตือนแบบเสี้ยววินาที
- **Throttler Module**: ระบบ Rate Limiting ป้องกัน Brute-force บน `/auth` และป้องกัน DDoS บน AI Endpoints
- **Swagger / OpenAPI**: สร้างคู่มือ API อัตโนมัติที่ `/api/docs`

### 2. `apps/web` (Vendor & Operations Web Suite)

- **Vendor Dashboard (`/dashboard`)**: แดชบอร์ด Kanban จัดการคิวออเดอร์, จัดการเมนู/รูปภาพ, และกราฟวิเคราะห์ยอดขาย
- **POS System (`/pos`)**: หน้าจอคิดเงินหน้าร้าน ออกบัตรคิว สแกน PromptPay และพิมพ์สลิปความร้อน
- **Kitchen Display System (`/kds`)**: หน้าจอสัมผัสสำหรับพ่อครัว พร้อมตัวนับเวลาและระบบสลับสถานะทำอาหาร
- **Queue Display Board (`/queue-display`)**: หน้าจอทีวีแสดงเลขคิว Real-time สำหรับติดตั้งในโรงอาหาร
- **Sunmi Dual-Screen Display (`/sunmi`, `/sunmi-display`)**: หน้าจอหันหาลูกค้าบนเครื่อง POS สำหรับแสดง QR ชำระเงิน

### 3. `apps/mobile` (Student Mobile Application)

- **React Native 0.81 + Expo SDK 54**: รองรับทั้ง iOS และ Android
- **Expo Router v6**: ระบบ File-based Routing สไตล์ Next.js
- **Zustand + Storage Middleware**: จัดการ Global State (Auth, ตะกร้าสินค้าข้ามเซสชัน)
- **Expo SecureStore**: บันทึก JWT Token ลง Hardware Keychain/Keystore
- **AI Chat "น้องหยก"**: แชทบอทแนะนำอาหารอัจฉริยะ พร้อมปุ่มกดสั่งได้ทันที

### 4. `packages/shared-types` (Centralized Type Definitions)

- คลังกลางสำหรับ `Enums` (เช่น `OrderStatus`, `OrderType`, `PaymentMethod`, `Role`, `CancelledBy`), `Models`, `DTOs` และ `WsEvents`
- รับประกัน Type Safety แบบ 100% End-to-End หากแก้ Schema ฝั่งหนึ่ง ฝั่งอื่นจะทราบทันทีตอน Compile

---

## 🛠️ ตารางเทคโนโลยีที่เลือกใช้ (Technology Stack Overview)

| เลเยอร์ / ส่วนงาน         | เทคโนโลยีที่เลือกใช้            | ภาษา / เครื่องมือ   | บทบาทและหน้าที่ในระบบ                                                         |
| ------------------------- | ------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| **Monorepo Architecture** | **pnpm Workspace + Turborepo**  | YAML / Node.js      | จัดการ Dependency, แชร์แพ็กเกจ และเร่งความเร็วในการ Build                     |
| **Language Baseline**     | **TypeScript 5.x**              | TypeScript          | ภาษาหลัก 100% ทั้ง Frontend, Mobile, Backend และ Shared Packages              |
| **Backend Framework**     | **NestJS 10**                   | TypeScript          | แบ็กเอนด์ระดับ Enterprise (Modular, Dependency Injection, Clean Architecture) |
| **Database ORM**          | **Prisma ORM 6.x**              | Prisma Schema / SQL | ตัวเชื่อมฐานข้อมูลแบบ Type-safe, จัดการ Data Migrations และ Seeding           |
| **Database**              | **PostgreSQL (Supabase)**       | SQL / Relational    | ฐานข้อมูลหลัก รองรับ ACID Transactions และ PgBouncer Connection Pooling       |
| **Real-time Engine**      | **Socket.IO (WebSockets)**      | WebSocket Protocol  | ระบบรับ-ส่งสัญญาณแจ้งเตือนออเดอร์และบัตรคิวแบบ 2 ทิศทาง ความหน่วงต่ำ          |
| **Web Framework**         | **Next.js 14 (App Router)**     | TSX / React 18      | ระบบเว็บแอปพลิเคชันสำหรับ Dashboard, POS, KDS และ Queue Display               |
| **Web Styling**           | **Tailwind CSS + Lucide Icons** | PostCSS / CSS3      | ออกแบบดีไซน์ทันสมัย Responsive Dark Glassmorphism                             |
| **Web Data & Cache**      | **TanStack React Query v5**     | TypeScript          | จัดการ Server State, Caching, Optimistic Updates และ Background Refetching    |
| **Mobile Framework**      | **React Native (Expo SDK 54)**  | TSX / React 19      | พัฒนา Cross-Platform Mobile App (iOS & Android)                               |
| **Mobile Routing**        | **Expo Router v6**              | TypeScript          | ระบบจัดการหน้าจอแบบ File-based Navigation Routing                             |
| **Mobile State**          | **Zustand + SecureStore**       | TypeScript          | จัดการ State น้ำหนักเบา พร้อมระบบจำตะกร้าสินค้าและการเข้ารหัส Token           |
| **AI Intelligence**       | **Google Gemini 1.5 & Claude**  | REST / AI SDK       | สมองกลผู้ช่วย AI "น้องหยก" และระบบ AI ช่วยเจนเนอเรตภาพถ่ายอาหาร               |
| **Security & Auth**       | **Passport.js + JWT + bcrypt**  | TypeScript          | ระบบยืนยันตัวตน Token-based พร้อม Role-Based Access Control (RBAC)            |
| **Testing Suite**         | **Jest + ts-jest**              | TypeScript          | ระบบรัน Unit Tests สำหรับตรวจสอบความถูกต้องของ Business Logic                 |

---

## 💡 เหตุผลเบื้องหลังการเลือก Framework & Tech Stack (Engineering Rationale / ADR)

การคัดเลือกเทคโนโลยีสำหรับโปรเจกต์ **Campus Food** ไม่ได้เลือกตามกระแส แต่ผ่านการวิเคราะห์เชิงวิศวกรรมซอฟต์แวร์ (Architectural Decision Records - ADR) โดยมีเหตุผลสำคัญดังนี้:

### 1. ทำไมต้องใช้ Monorepo ด้วย `pnpm Workspace`?

- **Zero Type Duplication**: ระบบสั่งอาหารมีโครงสร้างข้อมูลที่ซับซ้อน (เช่น `Order`, `OrderItem`, `MenuItem`, `OrderStatus`) การใช้ Monorepo ช่วยให้แชร์แพ็กเกจ `@campus-food/shared-types` ระหว่าง Backend, Web และ Mobile ได้ทันที ลดความเสี่ยงจากการที่ Client และ Server เข้าใจ Type ไม่ตรงกัน
- **Efficient Disk Space & Speed**: `pnpm` ใช้ระบบ **Content-addressable storage** และ **Hard Links** ทำให้ประหยัดเนื้อที่บน Hard Disk มหาศาล และติดตั้ง Dependency ในแต่ละแอปได้เร็วกว่า `npm` หรือ `yarn` หลายเท่า
- **Single Source of Truth & Refactoring**: สามารถทำการ Refactor ข้ามโปรเจกต์ (เช่น แก้ชื่อ Property ของ Order) แล้วเห็นผลกระทบทันทีทั้งระบบใน Commit เดียว

### 2. ทำไมต้องใช้ `TypeScript 100% End-to-End`?

- **กำจัดข้อผิดพลาด Compile-Time**: ป้องกันข้อผิดพลาดประเภท `TypeError: Cannot read property of undefined` หรือส่ง Field ที่สะกดผิดมายัง API
- **IntelliSense & Developer Velocity**: นักพัฒนาได้รับ Auto-completion ครบทุก Property ตั้งแต่การเขียน Query ใน Backend จนถึงการ Render UI ใน Mobile App

### 3. ทำไมต้องเลือก `NestJS` เป็น Backend Framework?

- **สถาปัตยกรรมระดับ Enterprise (Enterprise-Grade Structure)**: มีโครงสร้างชัดเจนตามหลัก Modular Design, Dependency Injection (DI) และ Separation of Concerns (แยก Controller, Service, DTO, Entity ชัดเจน) ทำให้ระบบขยายตัวได้ง่าย (Scalable)
- **First-class WebSocket & Microservice Support**: NestJS มี `@WebSocketGateway()` ในตัว ทำให้การผสานรวม REST API และ WebSocket Event เข้ากับ Business Logic ใน Service ทำได้อย่างเป็นเนื้อเดียวกัน
- **Validation Pipeline**: การใช้ `class-validator` ร่วมกับ `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` ช่วยป้องกันช่องโหว่แบบ **Mass Assignment** ได้อย่างสมบูรณ์

### 4. ทำไมต้องใช้ `Next.js 14 (App Router)` สำหรับ Web Dashboard, POS และ KDS?

- **ประสิทธิภาพและความยืดหยุ่น**: รองรับทั้ง Server Components (SSR) สำหรับหน้าเว็บที่ต้องการความเร็ว และ Client Components (`'use client'`) สำหรับหน้าที่ต้องการ Interactivity สูง เช่น POS และ Live Kanban Board
- **Unified Web Ecosystem**: สามารถรันระบบ Dashboard, POS คิดเงินหน้าร้าน, KDS จอในครัว และ Queue Display TV ให้อยู่ภายใต้โปรเจกต์เดียวกัน ผ่านโครงสร้าง File-based Routing ที่เป็นระเบียบ

### 5. ทำไมต้องเลือก `React Native + Expo SDK 54` สำหรับ Mobile App?

- **Single Codebase**: เขียนโค้ดชุดเดียวสามารถคอมไพล์ใช้งานได้ทั้ง iOS และ Android ช่วยประหยัดเวลาและทรัพยากรในการพัฒนา
- **Expo Router v6**: นำเสนอแนวคิด File-based routing ที่ทันสมัย ใช้งานง่าย มีโครงสร้างโฟลเดอร์เหมือน Next.js ทำให้ทีมงาน Front-end และ Mobile ปรับตัวเข้าหากันได้อย่างรวดเร็ว
- **Hardware Security Access**: มีโมดูลอย่าง `expo-secure-store` ที่เข้าถึง Hardware Keystore / Keychain โดยตรง เพื่อความปลอดภัยสูงสุดในการเก็บ Access Token

### 6. ทำไมต้องใช้ `PostgreSQL (Supabase)` ร่วมกับ `Prisma ORM 6.x`?

- **ความถูกต้องของข้อมูลระดับ ACID (ACID Compliance)**: ข้อมูลการสั่งอาหาร การเงิน และหมายเลขคิว ไม่สามารถยอมรับข้อผิดพลาดเรื่อง Data Inconsistency ได้ ฐานข้อมูลแบบ Relational อย่าง PostgreSQL จึงเหมาะสมที่สุด
- **Prisma Schema Driven & Type-safe Queries**: Prisma สร้าง TypeScript Client ให้อัตโนมัติจาก `schema.prisma` ป้องกัน SQL Injection 100% และลดความผิดพลาดในการเขียน Query
- **Supabase Cloud Infrastructure**: ให้บริการ Managed PostgreSQL พร้อมระบบ Connection Pooling (PgBouncer) ทำให้รองรับ Concurrent Connections จำนวนมากจากหลายไคลเอนต์พร้อมกันได้อย่างเสถียร

### 7. ทำไมต้องใช้ `Socket.IO (WebSockets)` แทน HTTP Polling?

- **ความหน่วงต่ำระดับมิลลิวินาที (Low Latency)**: การจัดการคิวและระบบอาหารหน้าร้านต้องการความเร็วแบบทันที (Instant Update) เมื่ออาหารเสร็จ หน้าจอของนักศึกษาและจอทีวีต้องเปลี่ยนสถานะทันที
- **ประหยัด Bandwidth และ CPU**: การยิง HTTP Polling ทุกๆ 2-3 วินาทีจากผู้ใช้หลายร้อยคนจะสร้างโหลดมหาศาลให้ Database และ Server ขณะที่ WebSockets ใช้การเชื่อมต่อแบบ Persistent Connection เพียงเส้นเดียวและส่งข้อมูลเฉพาะเมื่อมี Event เกิดขึ้นจริง
- **Room Isolation**: สามารถแบ่ง Room ตาม `vendor_{id}` (สำหรับร้านค้า) และ `order_{id}` (สำหรับนักศึกษา) ป้องกันปัญหาข้อมูลรั่วไหลข้ามร้าน

### 8. ทำไมต้องใช้ `TanStack React Query v5` บน Web?

- **จัดการ Server State และ Caching อัจฉริยะ**: ไม่ต้องเขียน `useEffect` ซ้ำซ้อน มีระบบ Invalidate Query อัตโนมัติเมื่อเกิด Mutation
- **Optimistic Updates**: ในหน้า Kanban Board เมื่อแม่ค้ากด "รับออเดอร์" การ์ดจะย้ายคอลัมน์ทันทีโดยไม่ต้องรอ Round-trip ของ Network ทำให้ UX ลื่นไหลไร้รอยต่อ

### 9. ทำไมต้องใช้ `Zustand` บน Mobile?

- **น้ำหนักเบาและไร้ Boilerplate**: มีขนาดไฟล์ไม่ถึง 2KB เร็วกว่า Redux และไม่ต้องสร้าง Context Provider ซ้อนกันหลายชั้น
- **Persistence Support**: ทำงานร่วมกับ Storage Middleware ได้ง่ายดาย ช่วยให้รายการในตะกร้าสินค้า (Cart Store) ไม่สูญหายแม้ผู้ใช้จะปิดแอปไป

### 10. ทำไมต้องผสานรวม `Google Gemini 1.5 & Anthropic Claude` สำหรับ AI Engine?

- **ความเข้าใจภาษาไทยระดับสูง**: เข้าใจภาษาไทย สำนวน วัฒนธรรมอาหารไทย และการพูดคุยแบบเป็นกันเองกับนักศึกษา
- **Database Grounding Architecture**: ระบบนำเมนูอาหารจริงในฐานข้อมูลมาร้อยเรียงเข้ากับ System Prompt ของ AI ทำให้ AI แนะนำเฉพาะเมนูที่มีขายจริง ป้องกันปัญหาการสร้างข้อมูลเท็จ (Hallucination)

---

## ✨ ฟีเจอร์หลักของระบบ (Key Features & Capabilities)

### 📱 1. สำหรับนักศึกษา (Student Mobile App)

- **ร้านค้าและเมนูอาหาร**: เลือกร้านค้าจาก 8 ร้านในโรงอาหาร ดูเมนูแนะนำประจำวัน และสถานะเปิด/ปิดร้าน
- **Interactive Stepper**: ปรับจำนวนอาหาร `+` / `-` ได้ทันทีจากหน้ารายการเมนู
- **Persistent Cart**: ตะกร้าสินค้าถูกบันทึกในเครื่อง ไม่หายเมื่อปิดแอป เลือกว่าจะทานที่ร้านหรือสั่งกลับบ้าน
- **Dynamic PromptPay QR & Cash**: ชำระเงินผ่าน PromptPay QR Code หรือเลือกชำระเงินสดหน้าร้าน
- **Real-time Queue Tracking**: บัตรคิวพร้อมตัวเลขขนาดใหญ่ และ Timeline 4 สถานะที่อัปเดตอัตโนมัติ
- **Smart Cancellation**: กดยกเลิกคำสั่งซื้อได้ด้วยตนเองหากร้านค้ายังไม่ได้เริ่มปรุงอาหาร
- **Confirm Receipt & History**: ปุ่มกดยืนยันเมื่อได้รับอาหาร เพื่อย้ายเข้าประวัติการสั่งซื้อ พร้อมฟังก์ชันกดสั่งซ้ำ (Re-order) และให้คะแนนรีวิวร้านค้า (Star Rating)
- **AI น้องหยก Assistant**: แชทบอทถาม-ตอบ "กินอะไรดี?" กรองตามงบประมาณ (เช่น งบ 50 บาท), รสชาติ (เผ็ด/หวาน/คลีน), และมีปุ่มกดสั่งได้ทันที

### 💻 2. สำหรับผู้ประกอบการร้านค้า (Vendor Dashboard)

- **Live Kanban Order Board**: คอลัมน์ 3 ขั้นตอน _(รอยืนยัน ➔ กำลังปรุง ➔ พร้อมรับอาหาร)_ พร้อมเสียงกระดิ่งเตือนเมื่อมีออเดอร์ใหม่
- **Quick Status Toggle**: กดรับออเดอร์, แจ้งอาหารเสร็จ, หรือกดยกเลิกพร้อมระบุเหตุผล (เช่น วัตถุดิบหมด)
- **Menu & Stock Management**: เพิ่ม/แก้ไข/ลบ เมนูอาหาร พร้อมสวิตช์เปิด-ปิดการขาย (In-stock / Out-of-stock)
- **AI Food Photography**: สร้างรูปภาพเมนูอาหารคุณภาพสูงด้วย AI เพื่อนำไปใช้เป็นรูปประกอบเมนู
- **Sales Analytics & Peak Hours**: กราฟแสดงสถิติยอดขายรวม, จำนวนออเดอร์, และวิเคราะห์ช่วงเวลาที่ลูกค้าหนาแน่นที่สุดในแต่ละวัน

### 🧾 3. ระบบคิดเงินและสั่งอาหารหน้าร้าน (POS System - `/pos`)

- **Fast Touch Ordering**: พนักงานหน้าร้านแตะเลือกเมนู ปรับตัวเลือก และเพิ่มลงตะกร้าได้อย่างรวดเร็ว
- **Split Payment**: รองรับทั้งเงินสด (พร้อมระบบคำนวณเงินทอน) และสร้าง PromptPay Dynamic QR
- **Thermal Receipt Slip Printing**: สั่งพิมพ์สลิปใบเสร็จ/บัตรคิวขนาด 80mm/58mm อัตโนมัติ

### 👨‍🍳 4. ระบบจอสัมผัสในครัว (Kitchen Display System - `/kds`)

- **High-Contrast Dark Theme**: ออกแบบให้อ่านง่าย ชัดเจน แม้ในสภาพแวดล้อมที่มีควันหรือแสงสะท้อนในครัว
- **Order Preparation Timer**: มีตัวนับเวลาความล่าช้า แจ้งเตือนด้วยสีเมื่อออเดอร์รอนานเกินเกณฑ์
- **Sound Alerts**: เสียงแจ้งเตือนระดับกระดิ่งครัวเมื่อมีออเดอร์ใหม่เข้ามา

### 📺 5. จอแสดงผลคิวสำหรับลูกค้า (Queue Display Board - `/queue-display`)

- **Full-Screen TV Display**: เหมาะสำหรับเปิดบน Smart TV หน้าร้านหรือใจกลางโรงอาหาร
- **Split View**: แยกฝั่งชัดเจนระหว่าง "กำลังปรุงอาหาร (Preparing)" และ "พร้อมรับอาหารแล้ว (Ready for Pickup)"
- **Audio Chime System**: ส่งเสียงสัญญาณ Chime สองโทนแจ้งเตือนอัตโนมัติเมื่อมีหมายเลขคิวใหม่ที่อาหารปรุงเสร็จ

### 🖥️ 6. ระบบจอสอง Sunmi POS (`/sunmi`, `/sunmi-display`)

- รองรับเครื่อง POS แบรนด์ Sunmi หรือจอ Dual-Screen สำหรับหันหน้าให้ลูกค้า
- แสดงรายการสินค้าที่กำลังสแกนแบบ Real-time พร้อมแสดง PromptPay QR Code ขนาดใหญ่ให้ลูกค้าสแกนจ่ายได้ทันที

---

## 🔒 ความปลอดภัยและคุณภาพซอฟต์แวร์ (Security & Quality Engineering)

โปรเจกต์ได้รับการปรับปรุงและทดสอบตามมาตรฐานวิศวกรรมซอฟต์แวร์ระดับสากล:

1. **Rate Limiting & Anti-Brute-force (`@nestjs/throttler`)**:
   - ควบคุมการเรียกใช้งาน API ทั่วไปไม่เกิน **60 requests/นาที**
   - ควบคุม Endpoint สำคัญอย่างเข้มงวด: `/auth/login` สูงสุด **5 ครั้ง/นาที** และ `/auth/register` สูงสุด **3 ครั้ง/นาที**
2. **Atomic Queue Number Sequence in Database Transaction**:
   - การออกหมายเลขคิว (`queueNumber`) ทำงานภายใน **Prisma Transaction** เดียวกันกับการสร้างออเดอร์ เพื่อป้องกันปัญหา **Race Condition** ในกรณีที่มีผู้ใช้ส่งคำสั่งซื้อพร้อมกันในเสี้ยววินาที
   - เสริมด้วย Unique Constraint: `@@unique([vendorId, queueNumber])` ในระดับฐานข้อมูล
3. **IDOR (Insecure Direct Object References) Protection**:
   - API ดูประวัติการสั่งซื้อ `/orders/student/:id` มีการตรวจสอบสิทธิ์ว่าผู้ขอข้อมูลต้องเป็นเจ้าของ `studentId` นั้นจริง หรือเป็นผู้ดูแลระบบ (`Role.ADMIN`) เท่านั้น
4. **Server-Side Price Calculation**:
   - ราคาของอาหารทั้งหมดถูกคำนวณจากราคาต่อหน่วยในฐานข้อมูล ไม่เชื่อถือราคาที่ส่งมาจาก Client เพื่อป้องกันการดัดแปลงราคา (Price Manipulation)
5. **Hardware Encrypted Token Storage**:
   - แอปมือถือจัดเก็บ JWT Token ลงใน **Expo SecureStore** ซึ่งเข้ารหัสด้วย Hardware Keystore (Android) และ Keychain Services (iOS) ปลอดภัยกว่า AsyncStorage ทั่วไป
6. **Soft-Delete Pattern & Index Optimization**:
   - ตาราง `MenuItem` ใช้เทคนิค Soft-Delete (`deletedAt`) เพื่อรักษาประวัติในใบเสร็จออเดอร์เก่าย้อนหลัง
   - เพิ่ม Database Index สำหรับ Column ที่ใช้ค้นหาบ่อย เช่น `[vendorId, queueNumber]`, `[studentId]`, `[status]`
7. **Comprehensive Unit Testing**:
   - ชุดการทดสอบ Unit Tests ด้วย Jest ครอบคลุมฟังก์ชันคำนวณราคา, ระบบคำสั่งซื้อ, การยืนยันสิทธิ์ และระบบ Authentication

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Directory Structure)

```text
proj/
├── apps/
│   ├── backend/                     # 🚀 NestJS REST API & WebSocket Server
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database Schema & Index Definitions
│   │   │   └── seed.ts              # Seeding 8 realistic vendors and 35+ menu items
│   │   └── src/
│   │       ├── ai/                  # AI Assistant Service (Gemini / Claude / NanoBanana)
│   │       ├── analytics/           # Sales Statistics & Peak Hours Calculator
│   │       ├── auth/                # JWT Auth, Refresh Token, Passport Strategies & Guards
│   │       ├── common/              # Global Filters, Interceptors, Decorators
│   │       ├── menu/                # Menu Management & Soft Delete
│   │       ├── notifications/       # Socket.IO WebSocket Gateway & Rooms
│   │       ├── orders/              # Order Creation, Lifecycle & Atomic Queue Logic
│   │       ├── prisma/              # Prisma Service & Database Connection
│   │       └── vendors/             # Vendor Profile & Store Status
│   │
│   ├── mobile/                      # 📱 React Native (Expo SDK 54) Student App
│   │   └── src/
│   │       ├── app/                 # Expo Router File-based Navigation
│   │       │   ├── (tabs)/          # Main Tab Screens (Home, AI, Orders, Cart, Profile)
│   │       │   ├── vendor/[id].tsx  # Vendor Menu & Daily Specials Screen
│   │       │   ├── order/[id].tsx   # Live Queue Number & Tracking Screen
│   │       │   └── login.tsx        # Authentication Screen (Login / Register)
│   │       ├── components/          # Reusable UI (AiInputBar, ErrorState, Stepper, etc.)
│   │       ├── lib/                 # Axios Client, Socket Client, Audio & Notifications
│   │       └── stores/              # Zustand Stores (AuthStore, CartStore with Persist)
│   │
│   └── web/                         # 💻 Next.js 14 App Router (Vendor Suite)
│       └── src/
│           ├── app/
│           │   ├── dashboard/       # Vendor Dashboard (Orders Kanban, Menu, Analytics)
│           │   ├── pos/             # Counter POS Cashier System
│           │   ├── kds/             # Kitchen Display System for Chefs
│           │   ├── queue-display/   # Customer Queue TV Display Board
│           │   ├── sunmi/           # Sunmi Dual-Screen Secondary Customer Display
│           │   └── login/           # Vendor Login Screen
│           ├── components/          # Kanban Cards, Charts, Slip Templates, Modals
│           └── lib/                 # TanStack Query Client, Socket Listener, Audio Chime
│
├── packages/
│   └── shared-types/                # 📦 Centralized Shared TypeScript Definitions
│       └── src/
│           ├── enums.ts             # OrderStatus, Role, PaymentMethod, CancelledBy
│           ├── models.ts            # User, Vendor, MenuItem, Order, OrderItem
│           ├── dtos.ts              # CreateOrderDto, AiChatDto, LoginDto
│           └── events.ts            # WebSocket Event Constants (NEW_ORDER, etc.)
│
├── pnpm-workspace.yaml             # pnpm Monorepo Workspace Configuration
├── tsconfig.base.json              # Shared Base TypeScript Rules
├── .env.example                    # Sample Environment Variables
└── README.md
```

---

## 🚀 คู่มือการติดตั้งและการเริ่มใช้งาน (Getting Started & Setup Guide)

### 1. ความต้องการของระบบ (Prerequisites)

- **Node.js**: เวอร์ชัน `>= 20.x`
- **pnpm**: เวอร์ชัน `>= 9.x` หรือ `11.x` (`npm install -g pnpm`)
- **PostgreSQL**: บัญชี [Supabase](https://supabase.com) (ฟรี) หรือ Local PostgreSQL
- **Expo Go App**: ติดตั้งบนสมาร์ทโฟน iOS หรือ Android เพื่อทดสอบ Mobile App

---

### 2. ติดตั้ง Dependencies และ Build Types

```bash
# 1. โคลนโปรเจกต์
git clone https://github.com/azazxxc147896325-beep/ProjectEnd.git
cd ProjectEnd

# 2. ติดตั้ง dependencies ทั้งหมดใน monorepo
pnpm install

# 3. คอมไพล์ shared-types สำหรับทั้งระบบ
pnpm build:types
```

---

### 3. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ตัวอย่าง `.env.example` ไปยังแต่ละโมดูล:

#### 🔹 `apps/backend/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET="super-secret-jwt-key-change-in-production"
GEMINI_API_KEY="your-google-gemini-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

#### 🔹 `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

#### 🔹 `apps/mobile/.env`:

```env
# หมายเหตุ: สำหรับทดสอบบนมือถือจริง ให้เปลี่ยน localhost เป็น IP ของเครื่องคอมพิวเตอร์ (เช่น 192.168.1.50)
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_WS_URL=http://localhost:4000
```

---

### 4. ซิงค์ฐานข้อมูลและสร้างข้อมูลตัวอย่าง (Database Migration & Seeding)

```bash
# Push schema ขึ้นไปยังฐานข้อมูล Supabase
pnpm --filter @campus-food/backend prisma:push

# รัน Seed เพื่อสร้างร้านค้า 8 ร้าน และเมนูอาหารกว่า 35+ รายการ
pnpm --filter @campus-food/backend seed
```

---

### 5. คำสั่งสำหรับรันโปรเจกต์ (Development Scripts)

สามารถเปิดรันแต่ละ Service แยกตาม Terminal ได้ดังนี้:

| ส่วนงาน                   | คำสั่งจาก Root Monorepo | URL เริ่มต้น / การเข้าถึง                                                                                                          |
| ------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **🚀 Backend API**        | `pnpm dev:backend`      | [http://localhost:4000/api](http://localhost:4000/api) (Swagger: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)) |
| **💻 Vendor Web Suite**   | `pnpm dev:web`          | [http://localhost:3000](http://localhost:3000) (Dashboard, POS, KDS, Queue)                                                        |
| **📱 Student Mobile App** | `pnpm dev:mobile`       | สแกน QR Code ผ่าน **Expo Go** บนมือถือ                                                                                             |

#### 🔗 ทางลัดหน้า Web Suite สำหรับทดสอบ:

- **Vendor Dashboard**: `http://localhost:3000/dashboard`
- **POS หน้าร้าน**: `http://localhost:3000/pos`
- **KDS จอในครัว**: `http://localhost:3000/kds`
- **จอแสดงคิวลูกค้า TV**: `http://localhost:3000/queue-display`
- **จอสอง Sunmi Display**: `http://localhost:3000/sunmi`

---

### 6. การทดสอบ (Automated Testing)

```bash
# รัน Unit Tests ทั้งหมดใน Backend
cd apps/backend
pnpm test

# ดู Coverage การทดสอบ
pnpm test:cov
```

---

## 👥 บัญชีผู้ใช้ตัวอย่างสำหรับทดสอบ (Demo Accounts & Seed Data)

ระบบได้เตรียมข้อมูลร้านค้าจำลองในโรงอาหารไว้ 8 ร้าน พร้อมเมนูอาหารครบถ้วน (รหัสผ่านทุกบัญชีคือ: `password123`):

| บทบาท (Role)    | ร้านค้า / ผู้ใช้                            | อีเมล (Email)                                    | รหัสผ่าน (Password) |
| --------------- | ------------------------------------------- | ------------------------------------------------ | ------------------- |
| 👩‍🍳 **Vendor 1** | ครัวป้าสมใจ (อาหารตามสั่ง/กะเพรา)           | `vendor.somjai@campus.ac.th`                     | `password123`       |
| 🍗 **Vendor 2** | ข้าวมันไก่เฮียชัย ประตู 1                   | `vendor.chaichicken@campus.ac.th`                | `password123`       |
| 🍜 **Vendor 3** | เตี๋ยวเรืออยุธยา สูตรโบราณ                  | `vendor.boatnoodle@campus.ac.th`                 | `password123`       |
| 🥗 **Vendor 4** | แซ่บอีสาน ส้มตำ-ไก่ย่าง                     | `vendor.zaabisarn@campus.ac.th`                  | `password123`       |
| 🍛 **Vendor 5** | ข้าวแกงปักษ์ใต้ คุณนายเรณู                  | `vendor.southern@campus.ac.th`                   | `password123`       |
| ☕ **Vendor 6** | Green Canteen & Cafe (เครื่องดื่ม/เบเกอรี่) | `vendor.greencafe@campus.ac.th`                  | `password123`       |
| 🇯🇵 **Vendor 7** | Tokyo Donburi ข้าวหน้าญี่ปุ่น               | `vendor.tokyodonburi@campus.ac.th`               | `password123`       |
| 🍲 **Vendor 8** | ครัวฮาลาล ซาบีฮะห์                          | `vendor.halalkitchen@campus.ac.th`               | `password123`       |
| 🎓 **Student**  | สมชาย สายกิน (นักศึกษา)                     | _สามารถสมัครสมาชิกใหม่ผ่านหน้าแอปมือถือได้ทันที_ | -                   |

---

<div align="center">
  <b>🎓 Campus Food Ordering System</b> — พัฒนาด้วยความพิถีพิถัน เพื่อยกระดับประสบการณ์การสั่งอาหารในโรงอาหารมหาวิทยาลัยให้สะดวก รวดเร็ว และทันสมัยที่สุด ✨
</div>
