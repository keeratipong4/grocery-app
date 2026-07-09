'use client'; // Client side interaction for URL query params update

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchControlsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const isNew = searchParams.get('isNew') === 'true';
  const hasDiscount = searchParams.get('hasDiscount') === 'true';

  function updateParam(name: string, value: string | boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(name);
    } else {
      params.set(name, String(value));
    }
    // reset pagination if any filters change
    params.delete('page');

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 bg-white border border-border rounded-banner p-5 shadow-card">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-gray-900">ตัวกรองสินค้า</h3>
        {isPending && (
          <span className="text-xs text-primary animate-pulse">กำลังโหลด…</span>
        )}
      </div>

      {/* Text Search inside sidebar for easy desktop usage */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700">ค้นหาเพิ่มเติม</label>
        <div className="relative">
          <input
            type="search"
            placeholder="ค้นหาชื่อสินค้า..."
            defaultValue={q}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                updateParam('q', e.currentTarget.value);
              }
            }}
            className="w-full text-sm h-10 px-3 bg-surface border border-border rounded-md focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Sort options */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700">จัดเรียงตาม</label>
        <select
          value={sort}
          onChange={e => updateParam('sort', e.target.value)}
          className="w-full text-sm h-10 px-3 bg-surface border border-border rounded-md focus:outline-none focus:border-primary"
        >
          <option value="newest">ใหม่ล่าสุด</option>
          <option value="price_asc">ราคา: ต่ำ - สูง</option>
          <option value="price_desc">ราคา: สูง - ต่ำ</option>
          <option value="rating_desc">คะแนนรีวิว</option>
          <option value="discount_desc">ส่วนลดสูงสุด</option>
        </select>
      </div>

      {/* Toggle options */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNew}
            onChange={e => updateParam('isNew', e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
          />
          เฉพาะสินค้าใหม่
        </label>

        <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={e => updateParam('hasDiscount', e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
          />
          เฉพาะสินค้าลดราคา
        </label>
      </div>

      {/* Reset button if any filter is active */}
      {(q || sort !== 'newest' || isNew || hasDiscount || searchParams.has('category')) && (
        <button
          onClick={() => {
            startTransition(() => {
              router.push('/search');
            });
          }}
          className="mt-2 text-xs font-semibold text-danger hover:underline text-center"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      )}
    </div>
  );
}
