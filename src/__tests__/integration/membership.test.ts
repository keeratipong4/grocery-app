import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { GET as getMembership } from '@/app/api/membership/route';
import { POST as joinMembership } from '@/app/api/membership/join/route';
import { makeReq, getSetCookie, sessionCookie } from '../helpers/request';
import { clearStore } from '../helpers/store';

beforeEach(clearStore);

const VALID_USER = { email: 'user@test.com', password: 'password123' };

async function getAuthToken(): Promise<string> {
  await register(makeReq('POST', '/api/auth/register', { body: VALID_USER }));
  const res = await login(makeReq('POST', '/api/auth/login', { body: VALID_USER }));
  return getSetCookie(res, 'farmart-session')!;
}

describe('GET /api/membership', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await getMembership(makeReq('GET', '/api/membership'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  it('returns 401 for invalid session token', async () => {
    const res = await getMembership(
      makeReq('GET', '/api/membership', { cookies: sessionCookie('fake-token') })
    );
    assert.equal(res.status, 401);
  });

  it('returns isMember=false for new user', async () => {
    const token = await getAuthToken();
    const res = await getMembership(
      makeReq('GET', '/api/membership', { cookies: sessionCookie(token) })
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.isMember, false);
    assert.equal(body.data.discountRate, 0);
  });

  it('returns isMember=true and 15% discount after joining', async () => {
    const token = await getAuthToken();
    await joinMembership(makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) }));
    const res = await getMembership(
      makeReq('GET', '/api/membership', { cookies: sessionCookie(token) })
    );
    const body = await res.json();
    assert.equal(body.data.isMember, true);
    assert.equal(body.data.discountRate, 15);
  });

  it('returns joinedAt date', async () => {
    const token = await getAuthToken();
    const res = await getMembership(
      makeReq('GET', '/api/membership', { cookies: sessionCookie(token) })
    );
    const body = await res.json();
    assert.ok(body.data.joinedAt !== null);
    assert.ok(typeof body.data.joinedAt === 'string');
  });
});

describe('POST /api/membership/join', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await joinMembership(makeReq('POST', '/api/membership/join'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  it('upgrades user to member and returns isMember=true', async () => {
    const token = await getAuthToken();
    const res = await joinMembership(
      makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) })
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.isMember, true);
    assert.equal(body.data.discountRate, 15);
  });

  it('returns 409 when user is already a member', async () => {
    const token = await getAuthToken();
    await joinMembership(makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) }));
    const res = await joinMembership(
      makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) })
    );
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.code, 'ALREADY_MEMBER');
  });

  it('member discount applies to cart after joining', async () => {
    const token = await getAuthToken();
    const { POST: addItem } = await import('@/app/api/cart/items/route');
    const { GET: getCart } = await import('@/app/api/cart/route');

    // Add item before becoming member
    await addItem(
      makeReq('POST', '/api/cart/items', { body: { productId: '3' }, cookies: sessionCookie(token) })
    );

    // Join membership
    await joinMembership(makeReq('POST', '/api/membership/join', { cookies: sessionCookie(token) }));

    // Check cart now has discount applied
    const cartRes = await getCart(makeReq('GET', '/api/cart', { cookies: sessionCookie(token) }));
    const cartBody = await cartRes.json();
    assert.equal(cartBody.data.discountRate, 15);
    assert.ok(cartBody.data.discount > 0);
    assert.ok(cartBody.data.grandTotal < cartBody.data.subtotal);
  });
});
