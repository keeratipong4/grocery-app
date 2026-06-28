import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { sessions } from './server-store';

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

export function getToken(req: NextRequest): string | null {
  return req.cookies.get('farmart-session')?.value ?? null;
}

export function getAuthSession(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  return { token, ...session };
}

export function requireAuth(req: NextRequest):
  | { session: null; error: NextResponse }
  | { session: { token: string; email: string }; error: null } {
  const session = getAuthSession(req);
  if (!session) return { session: null, error: err('UNAUTHORIZED', 'กรุณาเข้าสู่ระบบก่อน', 401) };
  return { session, error: null };
}
