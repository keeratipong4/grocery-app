'use client'; // reads cart badge from useCartStore, toggles mobile menu

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'โปรโมชั่น',     href: '#' },
  { label: "ดีลวันนี้ 🔥",   href: '#', highlight: true },
  { label: 'อาหาร',          href: '#' },
  { label: 'แช่แข็ง',        href: '#' },
  { label: 'เครื่องดื่ม',    href: '#' },
  { label: 'ร้านค้า',        href: '#' },
  { label: 'บล็อก',          href: '#' },
  { label: 'หน้าอื่น ▾',     href: '#' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, totalPrice, openCart } = useCartStore();

  const count = totalItems();
  const total = totalPrice();

  return (
    <header className="sticky top-0 z-30 shadow-card">

      {/* Topbar */}
      <div className="bg-white border-b border-border h-20">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-6">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">F</span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">farmart</span>
          </a>

          {/* Search */}
          <form className="flex-1 flex items-center border border-border rounded-md overflow-hidden h-[42px] max-w-[600px] focus-within:border-primary transition-colors" onSubmit={e => e.preventDefault()}>
            <select className="h-full px-3 border-r border-border bg-surface text-sm text-text-secondary outline-none flex-shrink-0">
              <option>ทุกหมวด</option>
              <option>ผัก</option>
              <option>ผลไม้</option>
              <option>นม & ไข่</option>
              <option>เนื้อสัตว์</option>
            </select>
            <input
              type="search"
              placeholder="ค้นหาสินค้า แบรนด์…"
              className="flex-1 h-full px-4 text-sm outline-none bg-transparent"
            />
            <button type="submit" className="h-full px-4 bg-primary hover:bg-primary-hover text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
              </svg>
            </button>
          </form>

          {/* Hotline */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="#F4B223" strokeWidth="1.8" className="w-8 h-8 flex-shrink-0">
              <path d="M3 3h4l2 5-2.5 1.5a11 11 0 005 5L13 12l5 2v4a1 1 0 01-1 1C7.16 19 1 12.84 1 5a1 1 0 011-1z"/>
            </svg>
            <div>
              <span className="block text-[11px] text-text-secondary">Hotline</span>
              <span className="block text-sm font-semibold">1800-000-000</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-1 text-sm text-gray-700 hover:text-primary transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <circle cx="10" cy="7" r="3.5"/>
                <path d="M2.5 18c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"/>
              </svg>
              <span className="hidden md:inline">เข้าสู่ระบบ</span>
            </button>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2 rounded-md transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M1 1h3l2 10h10l2-7H5"/>
                <circle cx="8" cy="17" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="17" r="1.2" fill="currentColor" stroke="none"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
              <span className="hidden sm:inline">{count > 0 ? formatPrice(total) : 'ตะกร้า'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-border h-[52px]" aria-label="เมนูหลัก">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-6">
          <button className="flex-shrink-0 flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-4 h-9 rounded-md text-sm transition-colors">
            ☰ หมวดหมู่สินค้า
          </button>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-1 flex-1 overflow-hidden">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-surface ${link.highlight ? 'text-danger' : 'text-gray-800'}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden ml-auto"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label="เปิด/ปิดเมนู"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
              <path d="M3 5h14M3 10h14M3 15h14"/>
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <ul className="md:hidden absolute left-0 right-0 bg-white border-b border-border px-6 py-3 flex flex-col gap-1 shadow-md z-20">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-surface ${link.highlight ? 'text-danger' : 'text-gray-800'}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

    </header>
  );
}
