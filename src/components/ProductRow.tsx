'use client'; // scroll controls require useRef + onClick

import { useRef } from 'react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export default function ProductRow({ products }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    rowRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        aria-label="เลื่อนซ้าย"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-border rounded-md shadow-card flex items-center justify-center text-xl hover:bg-primary hover:text-white hover:border-primary transition-colors"
      >
        ‹
      </button>

      <div
        ref={rowRef}
        className="scroll-row flex gap-5 overflow-x-auto pb-2"
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        aria-label="เลื่อนขวา"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-border rounded-md shadow-card flex items-center justify-center text-xl hover:bg-primary hover:text-white hover:border-primary transition-colors"
      >
        ›
      </button>
    </div>
  );
}
