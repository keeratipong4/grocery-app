# Product Requirements Document (PRD)

## 1. Project Overview
**Product Name:** Farmart Online Grocery Store
**Description:** แพลตฟอร์มร้านขายของชำและซูเปอร์มาร์เก็ตออนไลน์ ที่ช่วยให้ลูกค้าสามารถค้นหาสินค้า (ผัก, ผลไม้, เนื้อสัตว์, นม, เครื่องดื่ม ฯลฯ) และสั่งซื้อได้อย่างสะดวกสบายโดยไม่ต้องเดินทางไปที่หน้าร้าน
**Target Audience:** ผู้ใช้งานทั่วไปที่ต้องการความสะดวกในการซื้อของกินของใช้เข้าบ้าน

## 2. Business Goals
- **Increase Sales:** เพิ่มช่องทางการขายและสร้างรายได้ผ่านช่องทางออนไลน์
- **Retain Members:** ดึงดูดให้ลูกค้ากลับมาซื้อซ้ำอย่างต่อเนื่อง (Repeat Purchases) ผ่านระบบสมาชิกที่มอบสิทธิประโยชน์ (ส่วนลด 15%)
- **Reduce In-Store Workload:** ลดความหนาแน่นและภาระงานของพนักงานที่หน้าร้านสาขา

## 3. Product Scope (MVP - Minimum Viable Product)
### 3.1. User Workflows
- **Guest / Unregistered User:**
  - สามารถเข้ามาดูสินค้า หมวดหมู่ และค้นหาสินค้าได้ตามปกติ
  - สามารถเพิ่มสินค้าลงตะกร้า (Cart) แบบ Guest ได้ (ระบบจำตะกร้าไว้ชั่วคราวผ่าน Session แบบไม่ต้องล็อกอิน)
  - ต้องเข้าสู่ระบบ (Login) หรือ สมัครสมาชิก (Register) ก่อนจึงจะสามารถ Checkout ได้
- **Member / Registered User:**
  - เมื่อเข้าสู่ระบบ ตะกร้าสินค้าของ Guest จะถูกโอนย้าย (Merge) เข้าสู่บัญชีหลักอัตโนมัติ
  - หากกดรับสิทธิ์ Member จะได้รับส่วนลด 15% ในการสั่งซื้อทุกครั้ง
  - สามารถดูประวัติการสั่งซื้อ (Order History) ได้
  - เมื่อสั่งซื้อ ระบบจะช่วยเติมข้อมูลที่อยู่ (Pre-populate Address) จากออเดอร์ล่าสุดให้เพื่อความรวดเร็ว

### 3.2. Core Features
1. **Catalog & Search:**
   - **Homepage:** หน้าหลักที่มี Hero Banner, สินค้าแนะนำ, หมวดหมู่ยอดฮิต
   - **Category Page (`/category/[slug]`):** จัดกลุ่มสินค้าตามประเภท (เช่น ผัก, ผลไม้, เนื้อสัตว์) พร้อมระบบจัดเรียง (Sort) ตาม ราคา, รีวิว, หรือส่วนลด
   - **Search (`/search`):** ค้นหาสินค้าด้วยคีย์เวิร์ด พร้อมแถบ Filter ด้านข้าง (Sidebar) สำหรับกรองสินค้าใหม่หรือสินค้าลดราคา
2. **Shopping Cart:**
   - ระบบตะกร้าสินค้าแบบ Real-time และ Slide-in Drawer เข้าถึงได้ง่ายจากทุกหน้า
   - คำนวณราคาสุทธิ, ส่วนลด, และจำนวนสินค้า
3. **Authentication & Membership:**
   - สมัครสมาชิก / เข้าสู่ระบบด้วย Email
   - ระบบโปรไฟล์ (แก้ไข Email/Password)
   - แบนเนอร์สมัครสมาชิกเพื่อรับส่วนลด 15%
4. **Checkout & Orders:**
   - หน้ากรอกที่อยู่จัดส่ง และเลือกช่องทางการชำระเงิน (COD, PromptPay, Credit Card)
   - สรุปยอดสั่งซื้อ (Invoice) อย่างชัดเจนหลังสั่งซื้อเสร็จสิ้น (Order Detail Page)
   - ระบบป้องกันไม่ให้ผู้ใช้อื่นเข้าถึงออเดอร์ที่ไม่ใช่ของตนเอง (Strict ownership check)

## 4. Future Roadmap & Backlog
ฟีเจอร์ที่อาจจะพัฒนาในอนาคตเพื่อต่อยอดแอปพลิเคชัน:
- [ ] **Payment Gateway Integration:** เชื่อมต่อ Stripe หรือ Omise สำหรับตัดบัตรเครดิตและ PromptPay จริง
- [ ] **Admin Dashboard:** ระบบจัดการหลังบ้านสำหรับพนักงาน เพื่อเพิ่ม/แก้ไขสินค้า จัดการหมวดหมู่ และดูสถานะออเดอร์
- [ ] **Order Status Tracking:** ให้ลูกค้าติดตามสถานะการจัดส่ง (Preparing -> Shipped -> Delivered)
- [ ] **Reviews & Ratings:** เปิดให้ลูกค้าที่ซื้อสินค้าไปแล้วสามารถเขียนรีวิวและให้คะแนนสินค้าได้
- [ ] **Coupon System:** ระบบคูปองส่วนลดแบบกรอกโค้ดเพิ่มเติมจากส่วนลด Member

## 5. Technical Requirements
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **State Management:** Zustand (Client-side optimistic cache)
- **Backend/API:** Next.js Route Handlers (`src/app/api/**`)
- **Database:** SQLite ควบคู่กับ Prisma ORM (`better-sqlite3` driver)
- **Deployment:** Vercel หรือ Node.js Server (ต้องรองรับ SQLite local file)
