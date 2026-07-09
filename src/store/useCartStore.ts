'use client'; // reads/writes cart state, fires API calls on mutations

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items:          CartItem[];
  isOpen:         boolean;
  addItem:        (item: Omit<CartItem, 'qty'>) => void;
  removeItem:     (productId: string) => void;
  updateQty:      (productId: string, qty: number) => void;
  clearCart:      () => void;
  openCart:       () => void;
  closeCart:      () => void;
  hydrateFromApi: () => Promise<void>;
  totalItems:     () => number;
  totalPrice:     () => number;
}

type SetFn = (partial: Partial<CartStore>) => void;

// Monotonically increasing counter — any hydration response older than the
// latest mutation is discarded to prevent stale data overwriting optimistic UI.
let mutationGen = 0;

function syncCart(promise: Promise<Response>, set: SetFn) {
  const gen = ++mutationGen;
  promise
    .then(r => (r.ok ? r.json() : null))
    .then((json: { data?: { items?: CartItem[] } } | null) => {
      if (json?.data?.items && gen >= mutationGen) set({ items: json.data.items });
    })
    .catch(() => {});
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (item) => {
        // Optimistic update
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
        syncCart(
          fetch('/api/cart/items', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ productId: item.productId, qty: 1 }),
          }),
          set,
        );
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter(i => i.productId !== productId) }));
        syncCart(fetch(`/api/cart/items/${productId}`, { method: 'DELETE' }), set);
      },

      updateQty: (productId, qty) => {
        if (qty < 1) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map(i => i.productId === productId ? { ...i, qty } : i),
        }));
        syncCart(
          fetch(`/api/cart/items/${productId}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ qty }),
          }),
          set,
        );
      },

      clearCart: () => {
        set({ items: [] });
        fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
      },

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      hydrateFromApi: async () => {
        const gen = mutationGen;
        try {
          const res = await fetch('/api/cart');
          if (!res.ok) return;
          const json = await res.json() as { data?: { items?: CartItem[] } };
          // Discard if any mutation happened while we were waiting
          if (json.data?.items && gen === mutationGen) set({ items: json.data.items });
        } catch { /* silent */ }
      },

      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    {
      name: 'farmart-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
