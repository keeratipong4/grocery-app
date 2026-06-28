import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCart, carts, computeSummary, getDiscountRate, withCartLock } from '@/lib/server-store';
import { getToken } from '@/lib/api-helpers';
import { products } from '@/data/products';
import { calcDiscountedPrice } from '@/lib/utils';
import { randomUUID } from 'crypto';
import type { CartItem } from '@/types';

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

  const product = products.find(p => p.id === body.productId);
  if (!product) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบสินค้า' }, { status: 404 });
  }

  const qty   = Math.max(1, body.qty ?? 1);
  const price = calcDiscountedPrice(product.price, product.discount);

  const summary = await withCartLock(token, () => {
    const items    = getCart(token);
    const existing = items.find((i: CartItem) => i.productId === body.productId);
    const updated: CartItem[] = existing
      ? items.map((i: CartItem) =>
          i.productId === body.productId ? { ...i, qty: i.qty + qty } : i
        )
      : [...items, { productId: product.id, name: product.name, price, qty }];
    carts.set(token, updated);
    return computeSummary(updated, getDiscountRate(token));
  });

  const res = NextResponse.json({ data: summary });
  if (!existingToken) {
    res.cookies.set('farmart-session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}
