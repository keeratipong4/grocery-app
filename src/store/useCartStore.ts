import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter(i => i.productId !== productId) }));
      },

      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map(i => i.productId === productId ? { ...i, qty } : i),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'farmart-cart' }
  )
);
