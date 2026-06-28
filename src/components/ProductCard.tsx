'use client'; // interacts with useCartStore on "Add to Cart"

import Image from 'next/image';
import type { Product } from '@/types';
import { formatPrice, calcDiscountedPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import DiscountBadge from './DiscountBadge';

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: Props) {
  const { addItem, openCart } = useCartStore();
  const finalPrice = calcDiscountedPrice(product.price, product.discount);

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, price: finalPrice });
    openCart();
  }

  return (
    <article className="w-[220px] flex-shrink-0 bg-white border border-border rounded-banner shadow-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 group">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="220px"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <DiscountBadge discount={product.discount} />
        {product.isNew && product.discount === 0 && (
          <span className="absolute top-2 left-2 bg-success text-white text-xs font-bold px-2 py-0.5 rounded-full">
            ใหม่
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="text-[11px] text-text-secondary uppercase tracking-wide">{product.category}</p>

        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base font-bold text-gray-900">{formatPrice(finalPrice)}</span>
          {product.discount > 0 && (
            <span className="text-xs text-text-secondary line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-primary text-sm">{'★'.repeat(Math.floor(product.rating))}{'½'.includes(String(product.rating % 1)) ? '½' : ''}</span>
          <span className="text-[11px] text-text-secondary">({product.reviewCount})</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1.5 rounded-md transition-colors"
        >
          + เพิ่มในตะกร้า
        </button>
      </div>
    </article>
  );
}
