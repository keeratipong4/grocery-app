import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSummary,
  getDiscountRate,
  getCart,
  withCartLock,
  users,
  sessions,
  carts,
} from '@/lib/server-store';
import type { CartItem } from '@/types';

beforeEach(() => {
  users.clear();
  sessions.clear();
  carts.clear();
});

describe('computeSummary', () => {
  it('returns zeros for empty cart', () => {
    const result = computeSummary([], 0);
    assert.equal(result.subtotal, 0);
    assert.equal(result.discount, 0);
    assert.equal(result.grandTotal, 0);
    assert.deepEqual(result.items, []);
  });

  it('computes subtotal correctly with multiple items', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'Apple', price: 100, qty: 2 },
      { productId: 'p2', name: 'Milk', price: 59, qty: 1 },
    ];
    const result = computeSummary(items, 0);
    assert.equal(result.subtotal, 259); // 2*100 + 1*59
    assert.equal(result.discount, 0);
    assert.equal(result.grandTotal, 259);
  });

  it('applies member 15% discount correctly', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'Item', price: 200, qty: 1 },
    ];
    const result = computeSummary(items, 15);
    assert.equal(result.subtotal, 200);
    assert.equal(result.discountRate, 15);
    assert.equal(result.discount, 30); // Math.round(200 * 15 / 100)
    assert.equal(result.grandTotal, 170);
  });

  it('rounds discount with Math.round', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'Item', price: 99, qty: 1 },
    ];
    const result = computeSummary(items, 15);
    // 99 * 15 / 100 = 14.85 → Math.round = 15
    assert.equal(result.discount, 15);
    assert.equal(result.grandTotal, 84);
  });

  it('passes items through unchanged', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'A', price: 50, qty: 3 },
    ];
    const result = computeSummary(items, 0);
    assert.deepEqual(result.items, items);
  });
});

describe('getDiscountRate', () => {
  it('returns 0 for unknown session token', () => {
    assert.equal(getDiscountRate('nonexistent-token'), 0);
  });

  it('returns 0 for logged-in non-member', () => {
    users.set('test@example.com', {
      email: 'test@example.com',
      password: 'hash',
      joinedAt: new Date().toISOString(),
      isMember: false,
    });
    sessions.set('tok-123', { email: 'test@example.com' });
    assert.equal(getDiscountRate('tok-123'), 0);
  });

  it('returns 15 for member user', () => {
    users.set('member@example.com', {
      email: 'member@example.com',
      password: 'hash',
      joinedAt: new Date().toISOString(),
      isMember: true,
    });
    sessions.set('tok-member', { email: 'member@example.com' });
    assert.equal(getDiscountRate('tok-member'), 15);
  });
});

describe('getCart', () => {
  it('returns empty array for unknown token', () => {
    assert.deepEqual(getCart('unknown'), []);
  });

  it('returns stored items for known token', () => {
    const items: CartItem[] = [{ productId: 'p1', name: 'A', price: 10, qty: 1 }];
    carts.set('tok', items);
    assert.deepEqual(getCart('tok'), items);
  });
});

describe('withCartLock', () => {
  it('executes the function and returns its result', async () => {
    const result = await withCartLock('tok-lock', () => 42);
    assert.equal(result, 42);
  });

  it('serializes concurrent mutations — no lost updates', async () => {
    const token = 'tok-concurrent';
    carts.set(token, []);

    // Fire 5 concurrent +1 increments
    const increments = Array.from({ length: 5 }, () =>
      withCartLock(token, () => {
        const current = carts.get(token) ?? [];
        const [first] = current;
        const newQty = (first?.qty ?? 0) + 1;
        carts.set(token, [{ productId: 'p1', name: 'X', price: 10, qty: newQty }]);
      })
    );
    await Promise.all(increments);

    const final = carts.get(token)?.[0]?.qty ?? 0;
    assert.equal(final, 5);
  });
});
