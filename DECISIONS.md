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

---

## 3. การย้ายจาก `next lint` ไปใช้ ESLint CLI และ Flat Config (`eslint.config.mjs`)
**วันที่:** 2026-07-10

**บริบทและปัญหา (Context):**
ใน Next.js 16 คำสั่ง `next lint` ได้ถูกนำออกจากตัว Next.js CLI อย่างถาวร ส่งผลให้การเรียกใช้คำสั่ง `npm run lint` ล้มเหลวเนื่องจากระบบหาคำสั่ง/โฟลเดอร์สำหรับตรวจไม่พบ นอกจากนี้ Next.js 16 แนะนำให้ใช้โครงสร้างการกำหนดค่าแบบ Flat Config ของ ESLint v9 แทนไฟล์คอนฟิกสไตล์เดิม (.eslintrc.json)

**การตัดสินใจ (Decision):**
1. เปลี่ยนโครงสร้างการ Lint โดยเขียนสคริปต์ `"lint"` ใน `package.json` ให้เรียกใช้ `eslint .` โดยตรงแทน `next lint`
2. สร้างไฟล์ `eslint.config.mjs` โดยสืบทอดค่าคอนฟิกจาก `eslint-config-next/core-web-vitals` และ `eslint-config-next/typescript`
3. ปิดการใช้งานกฎ `"react-hooks/set-state-in-effect": "off"` เนื่องจากกฎนี้มีความเข้มงวดสูงเกินไป และขัดขวางการใช้แพทเทิร์น `useState(false) + useEffect(() => setMounted(true), [])` ซึ่งเป็นแพทเทิร์นมาตรฐานในการป้องกันปัญหา Hydration Mismatch ของ Next.js Client Components

**เหตุผล (Rationale):**
- เพื่อสอดคล้องกับมาตรฐาน Next.js 16 และทำให้ทีมยังคงรันคำสั่ง `npm run lint` ตรวจสอบความถูกต้องของโค้ดก่อน commit งานได้สำเร็จ
- การปิดกฎ `set-state-in-effect` ช่วยป้องกันไม่ให้เราต้องเปลี่ยนโครงสร้าง Client Components กว่า 8 ไฟล์ในโปรเจกต์ซึ่งใช้งานแพทเทิร์น `mounted` เพื่อรอระบบ Hydration เสร็จสมบูรณ์อย่างปลอดภัย

