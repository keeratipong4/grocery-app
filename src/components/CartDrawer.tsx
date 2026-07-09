'use client'; // reads/writes useCartStore, controls drawer visibility

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } = useCartStore();
  const hydrateFromApi = useCartStore(s => s.hydrateFromApi);
  const discountRate   = useMemberStore(s => s.discountRate());
  const [mounted, setMounted] = useState(false);

  // Pull server cart once on mount (e.g. after a page reload post-login)
  useEffect(() => {
    setMounted(true);
    hydrateFromApi();
  }, [hydrateFromApi]);

  const subtotal  = totalPrice();
  const discount  = Math.round(subtotal * discountRate / 100);
  const grandTotal = subtotal - discount;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าสินค้า"
        className={`fixed top-0 right-0 bottom-0 w-[380px] max-w-full bg-white z-50 flex flex-col shadow-md transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            ตะกร้าสินค้า
            <span className="text-sm bg-danger text-white rounded-full px-2 py-0.5">{mounted ? totalItems() : 0}</span>
          </h2>
          <button
            onClick={closeCart}
            aria-label="ปิดตะกร้า"
            className="w-8 h-8 rounded-full bg-surface hover:bg-border flex items-center justify-center text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!mounted || items.length === 0 ? (
            <p className="text-center text-text-secondary pt-10 text-sm">ตะกร้าของคุณว่างเปล่า</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map(item => (
                <li key={item.productId} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-text-secondary">{formatPrice(item.price)} / ชิ้น</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded border border-border text-sm font-bold flex items-center justify-center hover:bg-surface"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded border border-border text-sm font-bold flex items-center justify-center hover:bg-surface"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold w-16 text-right">{formatPrice(item.price * item.qty)}</span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`ลบ ${item.name}`}
                    className="w-6 h-6 rounded-full bg-surface hover:bg-danger hover:text-white flex items-center justify-center text-xs text-text-secondary transition-colors"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="px-5 py-4 border-t border-border">
            {discountRate > 0 && (
              <div className="flex justify-between text-sm text-success mb-1">
                <span>ส่วนลดสมาชิก {discountRate}%</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold">รวมทั้งหมด</span>
              <strong className="text-xl font-bold">{formatPrice(grandTotal)}</strong>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors"
            >
              ชำระเงิน
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
