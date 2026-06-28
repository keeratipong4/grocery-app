import type { Category, Brand } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'ผัก', slug: 'vegetables', icon: '🥦', color: '#E8F5E9' },
  { id: '2', name: 'ผลไม้', slug: 'fruits', icon: '🍎', color: '#FFF3E0' },
  { id: '3', name: 'เนื้อสัตว์', slug: 'meat', icon: '🥩', color: '#FCE4EC' },
  { id: '4', name: 'อาหารทะเล', slug: 'seafood', icon: '🐟', color: '#E3F2FD' },
  { id: '5', name: 'นม & ไข่', slug: 'dairy', icon: '🧀', color: '#FFF8E1' },
  { id: '6', name: 'เครื่องดื่ม', slug: 'beverage', icon: '🥤', color: '#F3E5F5' },
  { id: '7', name: 'เบเกอรี่', slug: 'bakery', icon: '🍞', color: '#E8EAF6' },
  { id: '8', name: 'แช่แข็ง', slug: 'frozen', icon: '🧊', color: '#E0F7FA' },
];

export const brands: Brand[] = [
  {
    id: '1',
    name: 'GreenFarm',
    subtitle: 'ออร์แกนิคเซอร์ติไฟด์ · 120 สินค้า',
    gradient: 'from-green-100 to-green-200',
    logo: '🌿',
  },
  {
    id: '2',
    name: 'SunHarvest',
    subtitle: 'คุณภาพพรีเมียม · 85 สินค้า',
    gradient: 'from-yellow-100 to-amber-200',
    logo: '🌾',
  },
  {
    id: '3',
    name: 'PureLife',
    subtitle: 'เครื่องดื่มสุขภาพ · 60 สินค้า',
    gradient: 'from-blue-100 to-sky-200',
    logo: '💧',
  },
  {
    id: '4',
    name: 'DairyBest',
    subtitle: 'สดจากฟาร์ม · 95 สินค้า',
    gradient: 'from-pink-100 to-rose-200',
    logo: '🥛',
  },
];
