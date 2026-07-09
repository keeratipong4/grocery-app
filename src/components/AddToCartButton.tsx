'use client'; // Interacts with useCartStore

import { useCartStore } from '@/store/useCartStore';
import { calcDiscountedPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const { addItem, openCart } = useCartStore();
  const finalPrice = calcDiscountedPrice(product.price, product.discount);

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, price: finalPrice });
    openCart();
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-base font-bold py-3.5 px-8 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M1 1h3l2 10h10l2-7H5"/>
        <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none"/>
      </svg>
      เพิ่มในตะกร้า
    </button>
  );
}
