'use client'; // Interacts with useCartStore and useMemberStore for quantity updates and dynamic totals

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useMemberStore } from '@/store/useMemberStore';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice } = useCartStore();
  const hydrateFromApi = useCartStore(s => s.hydrateFromApi);
  const discountRate = useMemberStore(s => s.discountRate());
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
    hydrateFromApi();
  }, [hydrateFromApi]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-[1280px] mx-auto px-6 text-center py-20">
          <p className="text-gray-500 animate-pulse">กำลังโหลดตะกร้าสินค้า…</p>
        </div>
      </main>
    );
  }

  const subtotal = totalPrice();
  const discount = Math.round((subtotal * discountRate) / 100);
  const grandTotal = subtotal - discount;

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">ตะกร้าสินค้า</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">ตะกร้าสินค้าของคุณ</h1>

        {items.length === 0 ? (
          <div className="bg-white border border-border rounded-banner p-16 text-center shadow-card">
            <span className="text-5xl block mb-4" role="img" aria-label="empty-cart">🛒</span>
            <h2 className="text-lg font-bold text-gray-800 mb-2">ตะกร้าสินค้าของคุณว่างเปล่า</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              คุณยังไม่ได้เลือกสินค้าใส่ในตะกร้า เริ่มช็อปปิ้งผักสดและของกินอร่อยๆ ได้ทันทีที่หน้าแรก
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-md transition-colors"
            >
              กลับไปหน้าแรกเพื่อเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Left side: Items list */}
            <div className="bg-white border border-border rounded-banner shadow-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_40px] gap-4 px-6 py-4 bg-muted text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border">
                <div>สินค้า</div>
                <div className="text-center">จำนวน</div>
                <div className="text-right">ราคารวม</div>
                <div></div>
              </div>

              <ul className="divide-y divide-border">
                {items.map(item => (
                  <li key={item.productId} className="p-6 grid grid-cols-1 md:grid-cols-[1fr_120px_120px_40px] gap-4 items-center">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-text-secondary mt-1">{formatPrice(item.price)} / ชิ้น</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex justify-center">
                      <div className="flex items-center gap-1.5 border border-border rounded-md p-1 bg-surface">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="w-7 h-7 rounded bg-white hover:bg-border border border-border text-sm font-bold flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="w-7 h-7 rounded bg-white hover:bg-border border border-border text-sm font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right font-bold text-gray-900 md:text-sm text-base">
                      {formatPrice(item.price * item.qty)}
                    </div>

                    {/* Remove button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`ลบ ${item.name}`}
                        className="w-8 h-8 rounded-full bg-surface hover:bg-danger hover:text-white flex items-center justify-center text-text-secondary transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: Summary panel */}
            <aside className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4">
              <h2 className="font-bold text-gray-900 border-b border-border pb-3">สรุปคำสั่งซื้อ</h2>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>ยอดรวมสินค้า</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discountRate > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>ส่วนลดสมาชิก ({discountRate}%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="border-t border-border pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">ยอดรวมทั้งหมด</span>
                <strong className="text-2xl font-extrabold text-gray-900">{formatPrice(grandTotal)}</strong>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors shadow-sm"
              >
                ดำเนินการชำระเงิน
              </Link>

              <p className="text-[11px] text-text-secondary text-center">
                จัดส่งฟรีเมื่อช้อปครบ ฿500 สำหรับลูกค้าทั่วไป
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
