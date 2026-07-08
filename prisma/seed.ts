import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/api-helpers';
import { calcDiscountedPrice } from '../src/lib/utils';

const DEMO_PASSWORD = 'Password123!';

const categories = [
  { id: '1', name: 'ผัก', slug: 'vegetables', icon: '🥦', color: '#E8F5E9' },
  { id: '2', name: 'ผลไม้', slug: 'fruits', icon: '🍎', color: '#FFF3E0' },
  { id: '3', name: 'เนื้อสัตว์', slug: 'meat', icon: '🥩', color: '#FCE4EC' },
  { id: '4', name: 'อาหารทะเล', slug: 'seafood', icon: '🐟', color: '#E3F2FD' },
  { id: '5', name: 'นม & ไข่', slug: 'dairy', icon: '🧀', color: '#FFF8E1' },
  { id: '6', name: 'เครื่องดื่ม', slug: 'beverage', icon: '🥤', color: '#F3E5F5' },
  { id: '7', name: 'เบเกอรี่', slug: 'bakery', icon: '🍞', color: '#E8EAF6' },
  { id: '8', name: 'แช่แข็ง', slug: 'frozen', icon: '🧊', color: '#E0F7FA' },
];

const brands = [
  { id: '1', name: 'GreenFarm', subtitle: 'ออร์แกนิคเซอร์ติไฟด์ · 120 สินค้า', gradient: 'from-green-100 to-green-200', logo: '🌿' },
  { id: '2', name: 'SunHarvest', subtitle: 'คุณภาพพรีเมียม · 85 สินค้า', gradient: 'from-yellow-100 to-amber-200', logo: '🌾' },
  { id: '3', name: 'PureLife', subtitle: 'เครื่องดื่มสุขภาพ · 60 สินค้า', gradient: 'from-blue-100 to-sky-200', logo: '💧' },
  { id: '4', name: 'DairyBest', subtitle: 'สดจากฟาร์ม · 95 สินค้า', gradient: 'from-pink-100 to-rose-200', logo: '🥛' },
];

// categoryId mirrors src/data/categories.ts ids; keep in sync with src/data/products.ts (ids/prices/discounts unchanged — cart/checkout tests depend on them)
const products = [
  { id: '1',  name: 'บร็อคโคลี่ออร์แกนิค',    categoryId: '1', price: 99,  discount: 20, image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=75', rating: 4.5, reviewCount: 128, isNew: false },
  { id: '2',  name: 'สตรอว์เบอร์รี่สด 500g',   categoryId: '2', price: 149, discount: 15, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=75', rating: 4.0, reviewCount: 84,  isNew: false },
  { id: '3',  name: 'นมสดโฮลมิลค์ 1L',         categoryId: '5', price: 59,  discount: 0,  image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=75', rating: 5.0, reviewCount: 230, isNew: false },
  { id: '4',  name: 'อกไก่สด 500g',             categoryId: '3', price: 199, discount: 25, image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=75', rating: 4.5, reviewCount: 56,  isNew: false },
  { id: '5',  name: 'น้ำส้มคั้น 1L',            categoryId: '6', price: 89,  discount: 10, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=75', rating: 4.0, reviewCount: 97,  isNew: false },
  { id: '6',  name: 'ขนมปังซาวโดว์',           categoryId: '7', price: 129, discount: 0,  image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=75', rating: 5.0, reviewCount: 173, isNew: false },
  { id: '7',  name: 'แซลมอนแอตแลนติก 400g',   categoryId: '4', price: 390, discount: 30, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=75', rating: 4.5, reviewCount: 41,  isNew: false },
  { id: '8',  name: 'กรีกโยเกิร์ต 500g',        categoryId: '5', price: 139, discount: 0,  image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=75', rating: 4.0, reviewCount: 210, isNew: false },
  { id: '9',  name: 'มะเขือเทศเชอร์รี่ 300g',  categoryId: '1', price: 79,  discount: 0,  image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=75', rating: 5.0, reviewCount: 311, isNew: false },
  { id: '10', name: 'อะโวคาโด x3',              categoryId: '2', price: 159, discount: 18, image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400&q=75', rating: 4.5, reviewCount: 189, isNew: false },
  { id: '11', name: 'เชดดาร์ชีส 200g',          categoryId: '5', price: 119, discount: 0,  image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=75', rating: 4.0, reviewCount: 142, isNew: false },
  { id: '12', name: 'น้ำแร่ซ่า 6 แพ็ค',        categoryId: '6', price: 149, discount: 12, image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&q=75', rating: 5.0, reviewCount: 88,  isNew: false },
  { id: '13', name: 'ผักโขม 150g',              categoryId: '1', price: 69,  discount: 0,  image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=75', rating: 4.0, reviewCount: 76,  isNew: false },
  { id: '14', name: 'มะม่วง x2',                categoryId: '2', price: 109, discount: 22, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=75', rating: 5.0, reviewCount: 201, isNew: false },
  { id: '15', name: 'มันเทศม่วง',               categoryId: '1', price: 89,  discount: 0,  image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=75', rating: 4.0, reviewCount: 12,  isNew: true  },
  { id: '16', name: 'แก้วมังกร',                categoryId: '2', price: 199, discount: 0,  image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=400&q=75', rating: 5.0, reviewCount: 8,   isNew: true  },
  { id: '17', name: 'คีเฟอร์ 500ml',            categoryId: '5', price: 129, discount: 0,  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=75', rating: 4.0, reviewCount: 5,   isNew: true  },
  { id: '18', name: 'วากิวบีฟ 300g',            categoryId: '3', price: 790, discount: 0,  image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=75', rating: 5.0, reviewCount: 3,   isNew: true  },
  { id: '19', name: 'โคลด์บรูว์กาแฟ 250ml',    categoryId: '6', price: 119, discount: 0,  image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=75', rating: 4.0, reviewCount: 19,  isNew: true  },
  { id: '20', name: 'ขนมปังไร้กลูเตน',          categoryId: '7', price: 179, discount: 0,  image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=75', rating: 4.0, reviewCount: 27,  isNew: true  },
  { id: '21', name: 'ผักรวมแช่แข็ง 400g',       categoryId: '8', price: 89,  discount: 0,  image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=75', rating: 4.5, reviewCount: 14,  isNew: true  },
  { id: '22', name: 'เกี๊ยวซ่าแช่แข็ง 300g',    categoryId: '8', price: 149, discount: 0,  image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=75', rating: 4.5, reviewCount: 9,   isNew: true  },
];

const demoUsers = [
  { email: 'demo.member@example.com', isMember: true },
  { email: 'demo.guest@example.com', isMember: false },
  { email: 'member2@example.com', isMember: true },
  { email: 'member3@example.com', isMember: true },
  { email: 'guest2@example.com', isMember: false },
];

function computeOrderTotals(items: { price: number; qty: number }[], discountRate: number) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round((subtotal * discountRate) / 100);
  return { subtotal, discount, grandTotal: subtotal - discount };
}

const orderStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;

const shippingTemplate = {
  name: 'สมชาย ใจดี',
  phone: '0812345678',
  addressLine: '123 ถนนสุขุมวิท',
  district: 'คลองเตย',
  province: 'กรุงเทพมหานคร',
  postalCode: '10110',
};

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
  }

  for (const b of brands) {
    await prisma.brand.upsert({ where: { id: b.id }, update: b, create: b });
  }

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
  }

  const users = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { isMember: u.isMember },
      create: { email: u.email, password: hashPassword(DEMO_PASSWORD), isMember: u.isMember },
    });
    users.push(user);
  }

  const orderOwners = [users[0], users[0], users[0], users[0], users[2], users[2]];
  for (let i = 0; i < orderStatuses.length; i++) {
    const status = orderStatuses[i];
    const owner = orderOwners[i];
    const id = `ord_seed_${String(i + 1).padStart(2, '0')}`;
    const p = products[i % products.length];
    const price = calcDiscountedPrice(p.price, p.discount);
    const items = [
      { productId: p.id, name: p.name, price, qty: 1 + (i % 3) },
    ];
    const discountRate = owner.isMember ? 15 : 0;
    const totals = computeOrderTotals(items, discountRate);

    await prisma.order.upsert({
      where: { id },
      update: {},
      create: {
        id,
        userId: owner.id,
        subtotal: totals.subtotal,
        discountRate,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        paymentMethod: i % 2 === 0 ? 'cod' : 'transfer',
        status,
        estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000),
        items: { create: items },
        shippingAddress: { create: shippingTemplate },
      },
    });
  }

  const counts = {
    Category: await prisma.category.count(),
    Brand: await prisma.brand.count(),
    Product: await prisma.product.count(),
    User: await prisma.user.count(),
    Order: await prisma.order.count(),
  };

  console.log('Seed complete:', counts);
  console.log(`Demo login password for all seeded users: ${DEMO_PASSWORD}`);
  console.log('Demo emails:', demoUsers.map(u => u.email).join(', '));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
