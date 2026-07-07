import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSummary } from '@/lib/server-store';
import { getToken, ensureCartSession, getCartItems, getDiscountRateForToken } from '@/lib/api-helpers';
import { calcDiscountedPrice } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const existingToken = getToken(req);
  const token         = existingToken ?? randomUUID();

  let body: { productId?: string; qty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  if (!body.productId) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'กรุณาระบุ productId' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบสินค้า' }, { status: 404 });
  }

  const qty   = Math.max(1, body.qty ?? 1);
  const price = calcDiscountedPrice(product.price, product.discount);

  await ensureCartSession(token);
  const existing = await prisma.cartItem.findUnique({
    where: { sessionToken_productId: { sessionToken: token, productId: product.id } },
  });
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + qty } });
  } else {
    await prisma.cartItem.create({
      data: { sessionToken: token, productId: product.id, name: product.name, price, qty },
    });
  }

  const items   = await getCartItems(token);
  const summary = computeSummary(items, await getDiscountRateForToken(token));

  const res = NextResponse.json({ data: summary });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}
