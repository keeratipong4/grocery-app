import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCart, carts, computeSummary, getDiscountRate, withCartLock } from '@/lib/server-store';
import { getToken } from '@/lib/api-helpers';
import type { CartItem } from '@/types';

interface Props { params: { productId: string } }

export async function PATCH(req: NextRequest, { params }: Props) {
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

  const qty     = body.qty ?? 1;
  const summary = await withCartLock(token, () => {
    const items = getCart(token);
    const updated: CartItem[] = qty < 1
      ? items.filter((i: CartItem) => i.productId !== params.productId)
      : items.map((i: CartItem) =>
          i.productId === params.productId ? { ...i, qty } : i
        );
    carts.set(token, updated);
    return computeSummary(updated, getDiscountRate(token));
  });
  return NextResponse.json({ data: summary });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'ไม่พบ session' }, { status: 401 });
  }

  const summary = await withCartLock(token, () => {
    const updated = getCart(token).filter((i: CartItem) => i.productId !== params.productId);
    carts.set(token, updated);
    return computeSummary(updated, getDiscountRate(token));
  });
  return NextResponse.json({ data: summary });
}
