import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSummary } from '@/lib/server-store';
import { getCartItems, getDiscountRateForToken, getToken } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const existingToken = getToken(req);
  const token         = existingToken ?? randomUUID();
  const items         = await getCartItems(token);
  const summary       = computeSummary(items, await getDiscountRateForToken(token));

  const res = NextResponse.json({ data: summary });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}

export async function DELETE(req: NextRequest) {
  const existingToken = getToken(req);
  const token         = existingToken ?? randomUUID();
  await prisma.cartItem.deleteMany({ where: { sessionToken: token } });

  const res = NextResponse.json({ data: { success: true } });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}
