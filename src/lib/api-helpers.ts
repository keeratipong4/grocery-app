import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from './prisma';
import type { CartItem } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (s: string) => EMAIL_RE.test(s);

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, 'hex'), derived);
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function err(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

export const SESSION_COOKIE_NAME = 'farmart-session';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

export function getToken(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getAuthSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || !session.userId) return null;
  return { token, userId: session.userId };
}

export async function requireAuth(req: NextRequest): Promise<
  | { session: null; error: NextResponse }
  | { session: { token: string; userId: string }; error: null }
> {
  const session = await getAuthSession(req);
  if (!session) return { session: null, error: err('UNAUTHORIZED', 'กรุณาเข้าสู่ระบบก่อน', 401) };
  return { session, error: null };
}

/** Ensure a Session row exists for a cart token (required by CartItem's FK), without touching an existing user link. */
export async function ensureCartSession(token: string) {
  await prisma.session.upsert({ where: { token }, update: {}, create: { token, userId: null } });
}

export async function getCartItems(token: string): Promise<CartItem[]> {
  const rows = await prisma.cartItem.findMany({ where: { sessionToken: token } });
  return rows.map(r => ({ productId: r.productId, name: r.name, price: r.price, qty: r.qty }));
}

export async function getDiscountRateForToken(token: string): Promise<number> {
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  return session?.user?.isMember ? 15 : 0;
}
