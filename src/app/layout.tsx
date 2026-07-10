import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Farmart — Fresh Grocery Online',
  description: 'ร้านขายของชำออนไลน์ สินค้าสดใหม่ส่งถึงบ้านทุกวัน',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900">
        <Navbar />
        <main>{children}</main>
        <CartDrawer />
      </body>
    </html>
  );
}
