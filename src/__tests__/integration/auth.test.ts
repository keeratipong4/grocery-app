import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as me } from '@/app/api/auth/me/route';
import { makeReq, getSetCookie, sessionCookie } from '../helpers/request';
import { clearStore } from '../helpers/store';

beforeEach(clearStore);

const VALID_USER = { email: 'user@test.com', password: 'password123' };

async function registerAndLogin(email = VALID_USER.email, password = VALID_USER.password) {
  await register(makeReq('POST', '/api/auth/register', { body: { email, password } }));
  const res = await login(makeReq('POST', '/api/auth/login', { body: { email, password } }));
  const token = getSetCookie(res, 'farmart-session');
  return token!;
}

describe('POST /api/auth/register', () => {
  it('creates user and returns 201 with email', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: VALID_USER })
    );
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.email, VALID_USER.email);
    assert.ok(body.data.joinedAt);
  });

  it('sets farmart-session cookie on success', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: VALID_USER })
    );
    const token = getSetCookie(res, 'farmart-session');
    assert.ok(token, 'Should set session cookie');
  });

  it('returns 400 when email is missing', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: { password: 'pass1234' } })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('returns 400 when password is missing', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: { email: 'a@b.com' } })
    );
    assert.equal(res.status, 400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: { email: 'notanemail', password: 'password123' } })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for password shorter than 8 chars', async () => {
    const res = await register(
      makeReq('POST', '/api/auth/register', { body: { email: 'a@b.com', password: 'short' } })
    );
    assert.equal(res.status, 400);
  });

  it('returns 409 for duplicate email', async () => {
    const req = () => makeReq('POST', '/api/auth/register', { body: VALID_USER });
    await register(req());
    const res = await register(req());
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.code, 'DUPLICATE_EMAIL');
  });

  it('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await register(req as never);
    assert.equal(res.status, 400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with user data on valid credentials', async () => {
    await register(makeReq('POST', '/api/auth/register', { body: VALID_USER }));
    const res = await login(makeReq('POST', '/api/auth/login', { body: VALID_USER }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.email, VALID_USER.email);
  });

  it('sets new session cookie on login', async () => {
    await register(makeReq('POST', '/api/auth/register', { body: VALID_USER }));
    const res = await login(makeReq('POST', '/api/auth/login', { body: VALID_USER }));
    const token = getSetCookie(res, 'farmart-session');
    assert.ok(token, 'Should set new session cookie');
  });

  it('returns 401 for wrong password', async () => {
    await register(makeReq('POST', '/api/auth/register', { body: VALID_USER }));
    const res = await login(
      makeReq('POST', '/api/auth/login', { body: { email: VALID_USER.email, password: 'wrongpass' } })
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent user', async () => {
    const res = await login(makeReq('POST', '/api/auth/login', { body: VALID_USER }));
    assert.equal(res.status, 401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await login(makeReq('POST', '/api/auth/login', { body: {} }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('merges guest cart on login', async () => {
    const { POST: addItem } = await import('@/app/api/cart/items/route');
    await register(makeReq('POST', '/api/auth/register', { body: VALID_USER }));

    // Add item as guest with guest token
    const guestToken = 'guest-token-abc';
    await addItem(
      makeReq('POST', '/api/cart/items', {
        body: { productId: '1', qty: 2 },
        cookies: { 'farmart-session': guestToken },
      })
    );

    // Login with guest cookie → cart should merge
    const loginRes = await login(
      makeReq('POST', '/api/auth/login', {
        body: VALID_USER,
        cookies: { 'farmart-session': guestToken },
      })
    );
    assert.equal(loginRes.status, 200);
    const newToken = getSetCookie(loginRes, 'farmart-session')!;

    const { GET: getCart } = await import('@/app/api/cart/route');
    const cartRes = await getCart(makeReq('GET', '/api/cart', { cookies: sessionCookie(newToken) }));
    const cartBody = await cartRes.json();
    assert.ok(cartBody.data.items.length > 0, 'Merged cart should have items');
  });
});

describe('GET /api/auth/me', () => {
  it('returns user info for authenticated request', async () => {
    const token = await registerAndLogin();
    const res = await me(makeReq('GET', '/api/auth/me', { cookies: sessionCookie(token) }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.email, VALID_USER.email);
  });

  it('returns 401 when no session cookie', async () => {
    const res = await me(makeReq('GET', '/api/auth/me'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  it('returns 401 for invalid session token', async () => {
    const res = await me(
      makeReq('GET', '/api/auth/me', { cookies: sessionCookie('fake-token') })
    );
    assert.equal(res.status, 401);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns success and clears cookie', async () => {
    const token = await registerAndLogin();
    const res = await logout(makeReq('POST', '/api/auth/logout', { cookies: sessionCookie(token) }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.success, true);
  });

  it('session is invalidated after logout', async () => {
    const token = await registerAndLogin();
    await logout(makeReq('POST', '/api/auth/logout', { cookies: sessionCookie(token) }));
    const res = await me(makeReq('GET', '/api/auth/me', { cookies: sessionCookie(token) }));
    assert.equal(res.status, 401);
  });

  it('succeeds even without a session cookie', async () => {
    const res = await logout(makeReq('POST', '/api/auth/logout'));
    assert.equal(res.status, 200);
  });
});
