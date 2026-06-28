import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCart, carts, computeSummary, getDiscountRate } from '@/lib/server-store';
import { getToken } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';

export function GET(req: NextRequest) {
  const existingToken = getToken(req);
  const token         = existingToken ?? randomUUID();
  const items         = getCart(token);
  const summary       = computeSummary(items, getDiscountRate(token));

  const res = NextResponse.json({ data: summary });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}

export function DELETE(req: NextRequest) {
  const existingToken = getToken(req);
  const token         = existingToken ?? randomUUID();
  carts.set(token, []);

  const res = NextResponse.json({ data: { success: true } });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}
