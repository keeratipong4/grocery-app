'use client'; // reads cart badge from useCartStore, toggles mobile menu

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import { categories } from '@/data/categories';

const NAV_LINKS = [
  { label: 'โปรโมชั่น',     href: '/search?hasDiscount=true' },
  { label: "ดีลวันนี้ 🔥",   href: '/search?hasDiscount=true&sort=discount_desc', highlight: true },
  { label: 'ผัก & ผลไม้',   href: '/category/vegetables' },
  { label: 'เนื้อสัตว์',    href: '/category/meat' },
  { label: 'แช่แข็ง',        href: '/category/frozen' },
  { label: 'เครื่องดื่ม',    href: '/category/beverage' },
  { label: 'นม & ไข่',       href: '/category/dairy' },
  { label: 'เบเกอรี่',       href: '/category/bakery' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, userMenuOpen]);

  const { totalItems, totalPrice, openCart } = useCartStore();
  const discountRate = useMemberStore(s => s.discountRate());
  const member = useMemberStore(s => s.member);
  const leave = useMemberStore(s => s.leave);

  const count = mounted ? totalItems() : 0;
  const subtotal = mounted ? totalPrice() : 0;
  const discount = Math.round(subtotal * discountRate / 100);
  const total = subtotal - discount;

  return (
    <header className="sticky top-0 z-30 shadow-card">

      {/* Topbar */}
      <div className="bg-white border-b border-border h-20">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">F</span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">farmart</span>
          </Link>

          {/* Search */}
          <form
            action="/search"
            method="GET"
            className="flex-1 flex items-center border border-border rounded-md overflow-hidden h-[42px] max-w-[600px] focus-within:border-primary transition-colors"
          >
            <select
              name="category"
              className="h-full px-3 border-r border-border bg-surface text-sm text-text-secondary outline-none flex-shrink-0 cursor-pointer"
            >
              <option value="">ทุกหมวด</option>
              <option value="vegetables">ผัก</option>
              <option value="fruits">ผลไม้</option>
              <option value="dairy">นม & ไข่</option>
              <option value="meat">เนื้อสัตว์</option>
            </select>
            <input
              type="search"
              name="q"
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
          <div className="flex items-center gap-4 flex-shrink-0">
            {mounted && member ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-surface border border-transparent hover:border-border"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {member.email[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate text-gray-800 font-medium">
                    {member.email.split('@')[0]}
                  </span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-md shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-text-secondary">บัญชีผู้ใช้</p>
                      <p className="text-sm font-semibold text-gray-900 truncate" title={member.email}>{member.email}</p>
                    </div>
                    <div className="px-2 pt-2 border-b border-border pb-2">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-surface rounded-md transition-colors font-medium text-left"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>โปรไฟล์ของฉัน</span>
                      </Link>
                    </div>
                    <div className="px-2 pt-2">
                      <button
                        onClick={() => {
                          leave();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium text-left"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/#membership-section"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-surface"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                  <circle cx="10" cy="7" r="3.5"/>
                  <path d="M2.5 18c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"/>
                </svg>
                <span className="hidden md:inline">เข้าสู่ระบบ</span>
              </Link>
            )}

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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex-shrink-0 flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-4 h-9 rounded-md text-sm transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              ☰ หมวดหมู่สินค้า
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-border rounded-md shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span
                      className="text-lg w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-1 flex-1 overflow-hidden">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-surface ${link.highlight ? 'text-danger' : 'text-gray-800'}`}
                >
                  {link.label}
                </Link>
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
                <Link
                  href={link.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-surface ${link.highlight ? 'text-danger' : 'text-gray-800'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

    </header>
  );
}
