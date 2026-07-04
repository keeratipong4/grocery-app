import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { GET as getCart, DELETE as clearCart } from '@/app/api/cart/route';
import { POST as addItem } from '@/app/api/cart/items/route';
import { PATCH as updateItem, DELETE as removeItem } from '@/app/api/cart/items/[productId]/route';
import { NextRequest } from 'next/server';
import { makeReq, getSetCookie, sessionCookie } from '../helpers/request';
import { clearStore } from '../helpers/store';

beforeEach(clearStore);

const TOKEN = 'test-session-token';
const cookies = sessionCookie(TOKEN);

// Products from src/data/products.ts (real data)
const BROCCOLI = { productId: '1', name: 'บร็อคโคลี่ออร์แกนิค', price: 79, qty: 1 }; // 99 * (1-20%) = 79.2 → 79
const MILK = { productId: '3', name: 'นมสดโฮลมิลค์ 1L', price: 59, qty: 1 }; // no discount

describe('GET /api/cart', () => {
  it('returns empty cart summary for new guest (no cookie)', async () => {
    const res = await getCart(makeReq('GET', '/api/cart'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data.items));
    assert.equal(body.data.subtotal, 0);
    assert.equal(body.data.grandTotal, 0);
  });

  it('sets farmart-session cookie for new guest', async () => {
    const res = await getCart(makeReq('GET', '/api/cart'));
    const token = getSetCookie(res, 'farmart-session');
    assert.ok(token, 'Should issue session cookie to new guest');
  });

  it('does not set cookie when session already exists', async () => {
    const res = await getCart(makeReq('GET', '/api/cart', { cookies }));
    const cookie = getSetCookie(res, 'farmart-session');
    // Cookie should not be set again
    assert.equal(cookie, null);
  });

  it('returns cart items for existing session', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    const res = await getCart(makeReq('GET', '/api/cart', { cookies }));
    const body = await res.json();
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, '1');
  });
});

describe('POST /api/cart/items', () => {
  it('adds a new product to cart', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '1', qty: 1 }, cookies })
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, '1');
    assert.equal(body.data.items[0].qty, 1);
  });

  it('uses discounted price when product has discount', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }) // 20% off
    );
    const body = await res.json();
    // price=99, discount=20% → 79
    assert.equal(body.data.items[0].price, 79);
  });

  it('uses full price when product has no discount', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies })
    );
    const body = await res.json();
    assert.equal(body.data.items[0].price, 59);
  });

  it('increments qty when adding same product twice', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1', qty: 2 }, cookies }));
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '1', qty: 3 }, cookies })
    );
    const body = await res.json();
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].qty, 5);
  });

  it('adds multiple different products', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies })
    );
    const body = await res.json();
    assert.equal(body.data.items.length, 2);
  });

  it('defaults qty to 1 when not provided', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies })
    );
    const body = await res.json();
    assert.equal(body.data.items[0].qty, 1);
  });

  it('returns 400 when productId is missing', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: {}, cookies })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('returns 404 for unknown productId', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: 'nonexistent' }, cookies })
    );
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
  });

  it('returns 400 for malformed JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: `farmart-session=${TOKEN}` },
      body: 'bad json',
    });
    const res = await addItem(req);
    assert.equal(res.status, 400);
  });

  it('creates a new session token if no cookie', async () => {
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3' } })
    );
    const token = getSetCookie(res, 'farmart-session');
    assert.ok(token, 'Should set session cookie for new guest');
  });

  it('computes correct subtotal for multiple items', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '3', qty: 2 }, cookies })); // 59*2 = 118
    const res = await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '9', qty: 1 }, cookies }) // 79 no discount
    );
    const body = await res.json();
    assert.equal(body.data.subtotal, 118 + 79);
  });
});

describe('PATCH /api/cart/items/:productId', () => {
  it('updates quantity of existing item', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    const res = await updateItem(
      makeReq('PATCH', '/api/cart/items/1', { body: { qty: 5 }, cookies }),
      { params: { productId: '1' } }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.items[0].qty, 5);
  });

  it('removes item when qty < 1', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    const res = await updateItem(
      makeReq('PATCH', '/api/cart/items/1', { body: { qty: 0 }, cookies }),
      { params: { productId: '1' } }
    );
    const body = await res.json();
    assert.equal(body.data.items.length, 0);
  });

  it('returns 401 when no session cookie', async () => {
    const res = await updateItem(
      makeReq('PATCH', '/api/cart/items/1', { body: { qty: 2 } }),
      { params: { productId: '1' } }
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });
});

describe('DELETE /api/cart/items/:productId', () => {
  it('removes specific item from cart', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies }));
    const res = await removeItem(
      makeReq('DELETE', '/api/cart/items/1', { cookies }),
      { params: { productId: '1' } }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, '3');
  });

  it('returns 401 when no session cookie', async () => {
    const res = await removeItem(
      makeReq('DELETE', '/api/cart/items/1'),
      { params: { productId: '1' } }
    );
    assert.equal(res.status, 401);
  });

  it('succeeds even if item does not exist in cart', async () => {
    const res = await removeItem(
      makeReq('DELETE', '/api/cart/items/999', { cookies }),
      { params: { productId: '999' } }
    );
    assert.equal(res.status, 200);
  });
});

describe('DELETE /api/cart', () => {
  it('clears all items from cart', async () => {
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '1' }, cookies }));
    await addItem(makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies }));
    const res = await clearCart(makeReq('DELETE', '/api/cart', { cookies }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.success, true);

    const cartRes = await getCart(makeReq('GET', '/api/cart', { cookies }));
    const cartBody = await cartRes.json();
    assert.equal(cartBody.data.items.length, 0);
  });
});
