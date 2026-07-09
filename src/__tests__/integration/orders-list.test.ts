import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as addItem } from '@/app/api/cart/items/route';
import { POST as checkout } from '@/app/api/checkout/route';
import { GET as getOrders } from '@/app/api/orders/route';
import { makeReq, getSetCookie, sessionCookie } from '../helpers/request';
import { clearStore } from '../helpers/store';

beforeEach(clearStore);

const USER = { email: 'orders_list@test.com', password: 'password123' };

const SHIPPING = {
  name: 'สมชาย ใจดี',
  phone: '0812345678',
  addressLine: '123 ถนนสุขุมวิท',
  district: 'คลองเตย',
  province: 'กรุงเทพมหานคร',
  postalCode: '10110',
};

async function loginUser(): Promise<string> {
  await register(makeReq('POST', '/api/auth/register', { body: USER }));
  const res = await login(makeReq('POST', '/api/auth/login', { body: USER }));
  return getSetCookie(res, 'farmart-session')!;
}

describe('GET /api/orders', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await getOrders(makeReq('GET', '/api/orders'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  it('returns empty list for user with no orders', async () => {
    const token = await loginUser();
    const res = await getOrders(makeReq('GET', '/api/orders', { cookies: sessionCookie(token) }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body.data, []);
  });

  it('returns orders list in reverse chronological order', async () => {
    const token = await loginUser();

    // Place Order 1
    await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3', qty: 1 }, cookies: sessionCookie(token) })
    );
    const coRes1 = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'cod' },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(coRes1.status, 201);
    const order1 = (await coRes1.json()).data;

    // Place Order 2 (after short delay or just in sequence)
    await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '4', qty: 2 }, cookies: sessionCookie(token) })
    );
    const coRes2 = await checkout(
      makeReq('POST', '/api/checkout', {
        body: { shippingAddress: SHIPPING, paymentMethod: 'PromptPay' },
        cookies: sessionCookie(token),
      })
    );
    assert.equal(coRes2.status, 201);
    const order2 = (await coRes2.json()).data;

    // Fetch all orders
    const res = await getOrders(makeReq('GET', '/api/orders', { cookies: sessionCookie(token) }));
    assert.equal(res.status, 200);
    const body = await res.json();
    const list = body.data;

    assert.equal(list.length, 2);
    // Order 2 should be first in the list because it was created last
    assert.equal(list[0].id, order2.id);
    assert.equal(list[0].grandTotal, order2.grandTotal);
    assert.equal(list[0].paymentMethod, 'PromptPay');
    assert.equal(list[0].items.length, 1);
    assert.equal(list[0].items[0].productId, '4');
    assert.equal(list[0].items[0].qty, 2);

    // Order 1 should be second
    assert.equal(list[1].id, order1.id);
    assert.equal(list[1].grandTotal, order1.grandTotal);
    assert.equal(list[1].paymentMethod, 'cod');
    assert.equal(list[1].items.length, 1);
    assert.equal(list[1].items[0].productId, '3');
    assert.equal(list[1].items[0].qty, 1);
  });
});
