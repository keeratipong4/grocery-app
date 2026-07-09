import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSummary } from '@/lib/server-store';
import { getToken, getCartItems, getDiscountRateForToken } from '@/lib/api-helpers';

interface Props { params: Promise<{ productId: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const { productId } = await params;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'ไม่พบ session' }, { status: 401 });
  }

  let body: { qty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  const qty = body.qty ?? 1;
  if (qty < 1) {
    await prisma.cartItem.deleteMany({ where: { sessionToken: token, productId } });
  } else {
    await prisma.cartItem.updateMany({ where: { sessionToken: token, productId }, data: { qty } });
  }

  const items   = await getCartItems(token);
  const summary = computeSummary(items, await getDiscountRateForToken(token));
  return NextResponse.json({ data: summary });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { productId } = await params;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'ไม่พบ session' }, { status: 401 });
  }

  await prisma.cartItem.deleteMany({ where: { sessionToken: token, productId } });

  const items   = await getCartItems(token);
  const summary = computeSummary(items, await getDiscountRateForToken(token));
  return NextResponse.json({ data: summary });
}
