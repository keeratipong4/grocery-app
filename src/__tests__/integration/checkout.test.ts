import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as addItem } from '@/app/api/cart/items/route';
import { POST as checkout } from '@/app/api/checkout/route';
import { POST as joinMembership } from '@/app/api/membership/join/route';
import { GET as getOrder } from '@/app/api/orders/[id]/route';
import { NextRequest } from 'next/server';
import { makeReq, getSetCookie, sessionCookie } from '../helpers/request';
import { clearStore } from '../helpers/store';

beforeEach(clearStore);

const USER_A = { email: 'usera@test.com', password: 'password123' };
const USER_B = { email: 'userb@test.com', password: 'password123' };

const SHIPPING = {
  name: 'สมชาย ใจดี',
  phone: '0812345678',
  addressLine: '123 ถนนสุขุมวิท',
  district: 'คลองเตย',
  province: 'กรุงเทพมหานคร',
  postalCode: '10110',
};

async function loginUser(user: { email: string; password: string }): Promise<string> {
  await register(makeReq('POST', '/api/auth/register', { body: user }));
  const res = await login(makeReq('POST', '/api/auth/login', { body: user }));
  return getSetCookie(res, 'farmart-session')!;
}

async function addProductToCart(token: string, productId: string, qty = 1) {
  await addItem(
    makeReq('POST', '/api/cart/items', { body: { productId, qty }, cookies: sessionCookie(token) })
  );
}

describe('POST /api/checkout', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await checkout(makeReq('POST', '/api/checkout', { body: { shippingAddress: SHIPPING, paymentMethod: 'cod' } }));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  it('returns 400 when cart is empty', async () => {
    const token = await loginUser(USER_A);
    const res = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'EMPTY_CART');
  });

  it('returns 400 when shippingAddress is missing', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3');
    const res = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('returns 400 when paymentMethod is missing', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3');
    const res = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(res.status, 400);
  });

  it('creates order and returns 201 with order details', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3', 2); // milk x2

    const res = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(res.status, 201);
    const body = await res.json();
    const order = body.data;
    assert.ok(order.id.startsWith('ord_'));
    assert.equal(order.email, USER_A.email);
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].productId, '3');
    assert.equal(order.items[0].qty, 2);
    assert.equal(order.subtotal, 118); // 59 * 2
    assert.equal(order.discountRate, 0);
    assert.equal(order.grandTotal, 118);
    assert.equal(order.status, 'confirmed');
    assert.ok(order.estimatedDelivery);
    assert.deepEqual(order.shippingAddress, SHIPPING);
  });

  it('clears cart after successful checkout', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3');
    await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'transfer' },
        cookies: sessionCookie(token),
      })
    );
    const { GET: getCart } = await import('@/app/api/cart/route');
    const cartRes = await getCart(makeReq('GET', '/api/cart', { cookies: sessionCookie(token) }));
    const cartBody = await cartRes.json();
    assert.equal(cartBody.data.items.length, 0);
  });

  it('applies member 15% discount at checkout', async () => {
    const token = await loginUser(USER_A);
    await joinMembership(makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) }));
    await addProductToCart(token, '3', 1); // milk 59 baht

    const res = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    const body = await res.json();
    assert.equal(body.data.discountRate, 15);
    assert.ok(body.data.discount > 0);
    assert.ok(body.data.grandTotal < body.data.subtotal);
  });

  it('returns 400 for malformed JSON body', async () => {
    const token = await loginUser(USER_A);
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: `farmart-session=${token}` },
      body: 'not json',
    });
    const res = await checkout(req);
    assert.equal(res.status, 400);
  });

  it('order id is unique across multiple checkouts', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3');
    const res1 = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    const order1 = (await res1.json()).data;

    await addProductToCart(token, '3');
    const res2 = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    const order2 = (await res2.json()).data;

    assert.notEqual(order1.id, order2.id);
  });
});

describe('GET /api/orders/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await getOrder(makeReq('GET', '/api/orders/ord_123'), { params: Promise.resolve({ id: 'ord_123' }) });
    assert.equal(res.status, 401);
  });

  it('returns 404 for non-existent order id', async () => {
    const token = await loginUser(USER_A);
    const res = await getOrder(
      makeReq('GET', '/api/orders/ord_nonexistent', { cookies: sessionCookie(token) }),
      { params: Promise.resolve({ id: 'ord_nonexistent' }) }
    );
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
  });

  it('returns order for the owner', async () => {
    const token = await loginUser(USER_A);
    await addProductToCart(token, '3');
    const checkoutRes = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    const orderId = (await checkoutRes.json()).data.id;

    const res = await getOrder(
      makeReq('GET', `/api/orders/${orderId}`, { cookies: sessionCookie(token) }),
      { params: Promise.resolve({ id: orderId }) }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.id, orderId);
    assert.equal(body.data.email, USER_A.email);
  });

  it("returns 403 when user tries to access another user's order", async () => {
    const tokenA = await loginUser(USER_A);
    await addProductToCart(tokenA, '3');
    const checkoutRes = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(tokenA),
      })
    );
    const orderId = (await checkoutRes.json()).data.id;

    const tokenB = await loginUser(USER_B);
    const res = await getOrder(
      makeReq('GET', `/api/orders/${orderId}`, { cookies: sessionCookie(tokenB) }),
      { params: Promise.resolve({ id: orderId }) }
    );
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });
});
