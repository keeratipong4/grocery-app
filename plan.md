# Online Grocery Store — Planning Checklist

<!-- gen จาก requirement: ร้านขายของชำออนไลน์ (ผัก/ผลไม้/เนื้อ/นม/เครื่องดื่ม) -->

- [ ] Bootstrap Next.js 14 + TypeScript + Tailwind CSS + Zustand ในโฟลเดอร์ปัจจุบัน
- [ ] กำหนด TypeScript types (Product, Category, CartItem) ใน `src/types/index.ts`
- [ ] สร้าง mock data สินค้า ~50 รายการ + 6 หมวด ใน `src/data/`
- [ ] สร้าง Zustand cart store (add/remove/qty/total + localStorage persist) ใน `src/store/useCartStore.ts`
- [ ] สร้าง Zustand member store (signup → 15% discount persist) ใน `src/store/useMemberStore.ts`
- [ ] สร้าง utility functions (formatPrice, calcDiscountedPrice) ใน `src/lib/utils.ts`
- [ ] สร้าง Navbar พร้อม SearchBar + cart badge แสดงจำนวนสินค้า
- [ ] สร้าง ProductCard (รูป, ชื่อ, ราคา, ส่วนลด badge, rating, ปุ่ม Add to Cart)
- [ ] สร้าง Homepage (`/`) ประกอบด้วย HeroBanner → CategoryGrid → BestSeller → MembershipBanner → TopSaver
- [ ] สร้าง MembershipModal (กรอก email → รับ 15% off → persist)
- [ ] สร้าง CartDrawer (slide-in panel พร้อม qty control + สรุปยอด + member discount)
- [ ] สร้างหน้า Category (`/category/[slug]`) กรองสินค้าตามหมวด + sort ราคา/rating
- [ ] สร้างหน้า Product Detail (`/product/[id]`) แสดงรายละเอียด + Add to Cart
- [ ] สร้างหน้า Cart (`/cart`) แบบ full-page สำหรับ mobile
- [ ] สร้างหน้า Search (`/search?q=`) แสดง product grid + จำนวน result
- [ ] เชื่อม SearchBar ใน Navbar ให้ navigate ไปหน้า `/search?q=` จากทุกหน้า
- [ ] สร้างหน้า Checkout (`/checkout`) — กรอกที่อยู่จัดส่ง + สรุปออเดอร์ + confirm สั่งซื้อ (mock)
- [ ] ทดสอบ: add to cart, qty control, member discount, cart persist หลัง refresh, search จากทุกหน้า, checkout flow, responsive 375px
