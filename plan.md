# Online Grocery Store — Planning Checklist

<!-- gen จาก requirement: ร้านขายของชำออนไลน์ (ผัก/ผลไม้/เนื้อ/นม/เครื่องดื่ม) -->

- [x] Bootstrap Next.js 14 + TypeScript + Tailwind CSS + Zustand ในโฟลเดอร์ปัจจุบัน
- [x] กำหนด TypeScript types (Product, Category, CartItem) ใน `src/types/index.ts`
- [x] สร้าง mock data สินค้า ~50 รายการ + 6 หมวด ใน `src/data/`
- [x] สร้าง Zustand cart store (add/remove/qty/total + localStorage persist) ใน `src/store/useCartStore.ts`
- [x] สร้าง Zustand member store (signup → 15% discount persist) ใน `src/store/useMemberStore.ts`
- [x] สร้าง utility functions (formatPrice, calcDiscountedPrice) ใน `src/lib/utils.ts`
- [x] สร้าง Navbar พร้อม SearchBar + cart badge แสดงจำนวนสินค้า
- [x] สร้าง ProductCard (รูป, ชื่อ, ราคา, ส่วนลด badge, rating, ปุ่ม Add to Cart)
- [x] สร้าง Homepage (`/`) ประกอบด้วย HeroBanner → CategoryGrid → BestSeller → MembershipBanner → TopSaver
- [x] สร้าง MembershipModal (กรอก email → รับ 15% off → persist)
- [x] สร้าง CartDrawer (slide-in panel พร้อม qty control + สรุปยอด + member discount)
- [x] สร้างหน้า Category (`/category/[slug]`) กรองสินค้าตามหมวด + sort ราคา/rating
- [x] สร้างหน้า Product Detail (`/product/[id]`) แสดงรายละเอียด + Add to Cart
- [x] สร้างหน้า Cart (`/cart`) แบบ full-page สำหรับ mobile
- [x] สร้างหน้า Search (`/search?q=`) แสดง product grid + จำนวน result
- [x] เชื่อม SearchBar ใน Navbar ให้ navigate ไปหน้า `/search?q=` จากทุกหน้า
- [x] สร้างหน้า Checkout (`/checkout`) — กรอกที่อยู่จัดส่ง + สรุปออเดอร์ + confirm สั่งซื้อ (mock)
- [x] ทดสอบ: add to cart, qty control, member discount, cart persist หลัง refresh, search จากทุกหน้า, checkout flow, responsive 375px
