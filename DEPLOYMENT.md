# คู่มือการ Deploy โปรเจกต์ขึ้น Vercel (Deployment Guide)

คู่มือนี้สรุปสถาปัตยกรรมและขั้นตอนการนำแอปพลิเคชันขึ้นออนไลน์บน Vercel โดยทำงานร่วมกับคลาวด์ฐานข้อมูล **Neon PostgreSQL** ขณะที่เครื่องโลคัลยังคงพัฒนาบน **SQLite** ได้ตามปกติ

---

## 🏗️ ภาพรวมสถาปัตยกรรม (Architecture Overview)

โปรเจกต์นี้ใช้โครงสร้าง **Dual-Database** เพื่อความคล่องตัวในการพัฒนาและการนำไปใช้งานจริง:
- **Local (Development & Test):** ใช้ **SQLite** (`dev.db` และ `test.db`) ทำงานผ่าน `@prisma/adapter-better-sqlite3` เพื่อให้นักพัฒนาเขียนโค้ดและรัน Integration Test ได้ทันทีโดยไม่ต้องเชื่อมต่ออินเทอร์เน็ตหรือตั้งค่าฐานข้อมูลในเครื่อง
- **Production (Vercel):** ใช้ **PostgreSQL (Neon)** ทำงานผ่าน `@prisma/adapter-pg` เนื่องจากระบบ Serverless ของ Vercel มีลักษณะเป็น Stateless และ Ephemeral (ข้อมูลเขียนในเครื่องจะสูญหาย) จึงต้องใช้ฐานข้อมูลคลาวด์ภายนอก

---

## ⚙️ ระบบทำงานอย่างไร? (How it works)

ระบบมีการทำงานแบ่งออกเป็น 2 ช่วงเวลาหลักดังนี้:

### 1. ช่วงบิลด์เว็บ (Build Time) — จัดการโดย `prepare-prod-db.js` และ `vercel.json`
เนื่องจาก Prisma ไม่อนุญาตให้ใช้ฐานข้อมูลต่างประเภทกับที่ระบุใน `schema.prisma` เราจึงแก้ปัญหานี้โดย:
1. เมื่อ Vercel ดึงโค้ดไปบิลด์ ระบบจะอ่านไฟล์ `vercel.json` และสั่งรันคำสั่งบิลด์พิเศษ: `npm run build:vercel`
2. คำสั่งนี้จะไปรันสคริปต์ [prepare-prod-db.js](file:///Users/keeratipong/Desktop/Udemy/mikelopster/grocery-app/scripts/prepare-prod-db.js) เพื่อแปลงข้อความ `provider = "sqlite"` เป็น `provider = "postgresql"` ในไฟล์ `schema.prisma` โดยอัตโนมัติ
3. จากนั้นจะสั่ง `prisma generate` เพื่อสร้างโมเดลตัวเชื่อมต่อสำหรับ PostgreSQL ขึ้นมาในระบบของ Vercel

### 2. ช่วงรันเว็บจริง (Runtime) — จัดการโดย `src/lib/prisma.ts`
เมื่อมีผู้ใช้งานกดเข้าเว็บ โค้ดใน [prisma.ts](file:///Users/keeratipong/Desktop/Udemy/mikelopster/grocery-app/src/lib/prisma.ts) จะทำการเช็คค่าตัวแปรระบบ:
- หากตรวจสอบพบว่า `DATABASE_URL` ขึ้นต้นด้วย `postgres://` หรือ `postgresql://` -> ระบบจะโหลดตัวขับเคลื่อนเชื่อมต่อแบบ **PostgreSQL** (`PrismaPg` และ `pg`) เข้ามาเชื่อมต่อกับ Neon 
- หากไม่พบ (เช่น การเขียนโค้ดธรรมดาในเครื่อง) -> ระบบจะสลับไปใช้ **SQLite** (`PrismaBetterSqlite3` และ `better-sqlite3`) เพื่อดึงไฟล์ `dev.db` ในเครื่องแทน

---

## 🚀 ขั้นตอนการ Deploy ทีละขั้น (Step-by-Step Deployment)

### 1. สร้าง Database บน Neon.tech
1. สมัครใช้งานที่ [Neon.tech](https://neon.tech)
2. สร้างโปรเจกต์ใหม่ เลือกโซน **Singapore** (เพื่อความเร็วในการเข้าถึงข้อมูล)
3. คัดลอก **Connection String** ที่มีหน้าตาประมาณนี้ไว้:
   `postgresql://neondb_owner:...@ep-...ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

### 2. นำข้อมูลโครงสร้างตารางและสินค้าขึ้นระบบคลาวด์ (ครั้งแรก)
รันคำสั่งสองตัวนี้บน Terminal ในเครื่องคอมพิวเตอร์ของคุณ โดยชี้เป้าหมายไปที่ Neon Database (แทนที่ช่อง `<neon_connection_string>` ด้วยสายเชื่อมต่อที่ได้มาในข้อ 1):

```bash
# 1. สร้างตารางข้อมูลทั้งหมดบนระบบ Neon (ข้ามระบบ migration ของ sqlite)
DATABASE_URL="<neon_connection_string>" npx prisma db push

# 2. ใส่ข้อมูลสินค้าและหมวดหมู่เริ่มต้นลงคลาวด์
DATABASE_URL="<neon_connection_string>" npm run db:seed
```

### 3. ตั้งค่าบน Vercel และ Deploy
1. นำโค้ดโปรเจกต์ขึ้น **GitHub** และเชื่อมโยงโปรเจกต์กับ **Vercel**
2. ในส่วน **Build and Development Settings** ของ Vercel:
   - ตรวจสอบให้มั่นใจว่าเปิดใช้งานและใช้คำสั่งบิลด์เป็น: `npm run build:vercel` (ระบบจะอ่านค่านี้จากไฟล์ `vercel.json` โดยอัตโนมัติ)
3. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   - **Name:** `DATABASE_URL`
   - **Value:** `<สายเชื่อมต่อ Neon Connection String>`
4. กดปุ่ม **Deploy** เพื่อเปิดใช้งานเว็บไซต์จริง

---

## ❓ คำถามที่พบบ่อย (FAQ)

### ทำไมต้องใช้ `prisma db push` แทน `prisma migrate deploy` ตอนเอาข้อมูลขึ้น Neon ครั้งแรก?
* **คำตอบ:** เนื่องจากประวัติการ Migrate ในโฟลเดอร์ `prisma/migrations` ถูกบันทึกและล็อกโครงสร้างไว้สำหรับฐานข้อมูลประเภท SQLite ซึ่งมีไวยากรณ์ SQL ต่างจาก PostgreSQL ระบบป้องกันของ Prisma จึงปฏิเสธไม่ให้รันไฟล์เหล่านั้นข้ามประเภทฐานข้อมูล การใช้ `prisma db push` จะช่วยสร้างตารางขึ้นใหม่ตามโครงสร้างปัจจุบันบนฐานข้อมูล Neon ได้ทันทีโดยไม่ติดขัดปัญหาความต่างของประวัติการ Migrate
