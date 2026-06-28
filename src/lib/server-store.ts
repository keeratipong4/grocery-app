import type { CartItem } from '@/types';

export interface UserRecord {
  email: string;
  password: string; // plain text — demo only, use bcrypt in production
  joinedAt: string;
  isMember: boolean;
}

export interface SessionRecord {
  email: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface OrderRecord {
  id: string;
  email: string | null;
  items: CartItem[];
  subtotal: number;
  discountRate: number;
  discount: number;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDelivery: string | null;
  createdAt: string;
}

// Attach to globalThis so Maps survive Next.js dev-mode HMR module re-evaluation
// In production (single process, no HMR) this is equivalent to module-level singletons
type GlobalStore = {
  _fmUsers?:      Map<string, UserRecord>;
  _fmSessions?:   Map<string, SessionRecord>;
  _fmCarts?:      Map<string, CartItem[]>;
  _fmOrders?:     Map<string, OrderRecord>;
  _fmCartLocks?:  Map<string, Promise<void>>;
};
const g = globalThis as typeof globalThis & GlobalStore;

export const users      = (g._fmUsers      ??= new Map<string, UserRecord>());
export const sessions   = (g._fmSessions   ??= new Map<string, SessionRecord>());
export const carts      = (g._fmCarts      ??= new Map<string, CartItem[]>());
export const orderStore = (g._fmOrders     ??= new Map<string, OrderRecord>());
const cartLocks         = (g._fmCartLocks  ??= new Map<string, Promise<void>>());

/** Serialize cart mutations per token to prevent read-modify-write races. */
export async function withCartLock<T>(token: string, fn: () => T): Promise<T> {
  const prev = cartLocks.get(token) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>(r => { release = r; });
  cartLocks.set(token, current);
  await prev;
  try {
    return fn();
  } finally {
    release();
    if (cartLocks.get(token) === current) cartLocks.delete(token);
  }
}

export function getCart(token: string): CartItem[] {
  return carts.get(token) ?? [];
}

export function getDiscountRate(token: string): number {
  const session = sessions.get(token);
  if (!session) return 0;
  const user = users.get(session.email);
  return user?.isMember ? 15 : 0;
}

export function computeSummary(items: CartItem[], discountRate: number) {
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount   = Math.round(subtotal * discountRate / 100);
  const grandTotal = subtotal - discount;
  return { items, subtotal, discountRate, discount, grandTotal };
}
