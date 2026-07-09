# Architecture Decision Records (ADR)

เอกสารนี้ใช้สำหรับบันทึกการตัดสินใจสำคัญเชิงสถาปัตยกรรม (Architectural Decisions) และทิศทางในการพัฒนาโปรเจกต์ (Technical Choices) เพื่อให้ทีมงานในอนาคต หรือตัวเราเองที่กลับมาอ่าน เข้าใจถึง "เหตุผล" ของการเลือกใช้เทคโนโลยี หรือแนวทางเหล่านั้น

---

## 1. การใช้งาน `better-sqlite3` เป็น Database Driver
**วันที่:** 2026-07-09

**บริบทและปัญหา (Context):**
โปรเจกต์นี้เริ่มต้นจาก Frontend เป็นหลัก และเราต้องการฐานข้อมูลจริงสำหรับการทำตะกร้าสินค้า (Cart), ผู้ใช้งาน (Auth) และการชำระเงิน (Checkout) โดยไม่ต้องการ Setup Database Server แยกให้ยุ่งยาก (Zero-config)

**การตัดสินใจ (Decision):**
เราเลือกใช้ **SQLite** ควบคู่กับ **Prisma ORM** โดยใช้ Driver เป็น `better-sqlite3`

**เหตุผล (Rationale):**
1. **ประสิทธิภาพ (Performance):** `better-sqlite3` เป็น Native C++ module ที่ทำงานแบบ Synchronous ทำให้มีความรวดเร็วสูงมากเมื่อเทียบกับ Driver SQLite ตัวอื่นๆ ของ Node.js
2. **การทำงานร่วมกับ Next.js 16:** ใน Next.js 16 (และ App Router) การใช้ Native modules อาจทำให้ระบบ Build ของ Turbopack หรือ Webpack แจ้งเตือนข้อผิดพลาดเกี่ยวกับการ bundle binary ได้ เราจึงต้องตั้งค่าให้อยู่นอกเหนือการ bundle ด้วยการใส่ `serverExternalPackages: ['better-sqlite3', '@prisma/client']` ใน `next.config.mjs` แทนที่จะเปลี่ยนไปใช้ Database อื่น

---

## 2. การอัปเกรด Next.js เป็นเวอร์ชัน 16
**วันที่:** 2026-07-09

**บริบทและปัญหา (Context):**
ระบบเดิมใช้ Next.js 14 ซึ่งเวอร์ชันใหม่ (15+) มีการเปลี่ยน API สำคัญเกี่ยวกับ `params`, `searchParams` และ `cookies()` จาก Synchronous object ให้กลายเป็น `Promise` (Asynchronous) ทั้งหมด

**การตัดสินใจ (Decision):**
อัปเกรดโปรเจกต์จากเวอร์ชัน 14 สู่ **Next.js 16 (ล่าสุด)** แบบก้าวกระโดด

**เหตุผล (Rationale):**
- เพื่อรองรับฟีเจอร์ใหม่และปรับตาม Best Practices ล่าสุดของ React 19 / Next.js 16
- แม้จะมี Breaking Changes ที่ต้องไล่แก้ `await params` ในหลายไฟล์ แต่การอัปเกรดตั้งแต่เนิ่นๆ ในช่วงที่โปรเจกต์ยังมีขนาดเล็กถึงกลาง จะช่วยลด Technical Debt และไม่ต้องปวดหัวกับการ Migration ครั้งใหญ่ในอนาคต
