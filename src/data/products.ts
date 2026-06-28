import type { Product } from '@/types';

export const products: Product[] = [
  { id: '1',  name: 'บร็อคโคลี่ออร์แกนิค',    category: 'ผัก',         price: 99,  discount: 20, image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=75', rating: 4.5, reviewCount: 128, isNew: false },
  { id: '2',  name: 'สตรอว์เบอร์รี่สด 500g',   category: 'ผลไม้',       price: 149, discount: 15, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=75', rating: 4.0, reviewCount: 84,  isNew: false },
  { id: '3',  name: 'นมสดโฮลมิลค์ 1L',         category: 'นม & ไข่',    price: 59,  discount: 0,  image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=75', rating: 5.0, reviewCount: 230, isNew: false },
  { id: '4',  name: 'อกไก่สด 500g',             category: 'เนื้อสัตว์',  price: 199, discount: 25, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d11640?w=400&q=75', rating: 4.5, reviewCount: 56,  isNew: false },
  { id: '5',  name: 'น้ำส้มคั้น 1L',            category: 'เครื่องดื่ม', price: 89,  discount: 10, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=75', rating: 4.0, reviewCount: 97,  isNew: false },
  { id: '6',  name: 'ขนมปังซาวโดว์',           category: 'เบเกอรี่',    price: 129, discount: 0,  image: 'https://images.unsplash.com/photo-1585478259715-4d3128f9ca74?w=400&q=75', rating: 5.0, reviewCount: 173, isNew: false },
  { id: '7',  name: 'แซลมอนแอตแลนติก 400g',   category: 'อาหารทะเล',  price: 390, discount: 30, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=75', rating: 4.5, reviewCount: 41,  isNew: false },
  { id: '8',  name: 'กรีกโยเกิร์ต 500g',        category: 'นม & ไข่',    price: 139, discount: 0,  image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=75', rating: 4.0, reviewCount: 210, isNew: false },
  { id: '9',  name: 'มะเขือเทศเชอร์รี่ 300g',  category: 'ผัก',         price: 79,  discount: 0,  image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=75', rating: 5.0, reviewCount: 311, isNew: false },
  { id: '10', name: 'อะโวคาโด x3',              category: 'ผลไม้',       price: 159, discount: 18, image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400&q=75', rating: 4.5, reviewCount: 189, isNew: false },
  { id: '11', name: 'เชดดาร์ชีส 200g',          category: 'นม & ไข่',    price: 119, discount: 0,  image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=75', rating: 4.0, reviewCount: 142, isNew: false },
  { id: '12', name: 'น้ำแร่ซ่า 6 แพ็ค',        category: 'เครื่องดื่ม', price: 149, discount: 12, image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&q=75', rating: 5.0, reviewCount: 88,  isNew: false },
  { id: '13', name: 'ผักโขม 150g',              category: 'ผัก',         price: 69,  discount: 0,  image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=75', rating: 4.0, reviewCount: 76,  isNew: false },
  { id: '14', name: 'มะม่วง x2',                category: 'ผลไม้',       price: 109, discount: 22, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=75', rating: 5.0, reviewCount: 201, isNew: false },
  { id: '15', name: 'มันเทศม่วง',               category: 'ผัก',         price: 89,  discount: 0,  image: 'https://images.unsplash.com/photo-1596097557552-0dcfc2d7bbb1?w=400&q=75', rating: 4.0, reviewCount: 12,  isNew: true  },
  { id: '16', name: 'แก้วมังกร',                category: 'ผลไม้',       price: 199, discount: 0,  image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=400&q=75', rating: 5.0, reviewCount: 8,   isNew: true  },
  { id: '17', name: 'คีเฟอร์ 500ml',            category: 'นม & ไข่',    price: 129, discount: 0,  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=75', rating: 4.0, reviewCount: 5,   isNew: true  },
  { id: '18', name: 'วากิวบีฟ 300g',            category: 'เนื้อสัตว์',  price: 790, discount: 0,  image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=75', rating: 5.0, reviewCount: 3,   isNew: true  },
  { id: '19', name: 'โคลด์บรูว์กาแฟ 250ml',    category: 'เครื่องดื่ม', price: 119, discount: 0,  image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=75', rating: 4.0, reviewCount: 19,  isNew: true  },
  { id: '20', name: 'ขนมปังไร้กลูเตน',          category: 'เบเกอรี่',    price: 179, discount: 0,  image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=75', rating: 4.0, reviewCount: 27,  isNew: true  },
];

export const topSaverProducts = products.slice(0, 8);
export const bestSellerProducts = products.slice(8, 14);
export const justLandingProducts = products.filter(p => p.isNew);
