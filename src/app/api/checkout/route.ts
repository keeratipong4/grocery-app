import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getCart, carts, computeSummary, orderStore, users } from '@/lib/server-store';
import type { ShippingAddress } from '@/lib/server-store';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  let body: { shippingAddress?: ShippingAddress; paymentMethod?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  if (!body.shippingAddress || !body.paymentMethod) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'กรุณากรอกที่อยู่และวิธีชำระเงิน' },
      { status: 400 }
    );
  }

  const items = getCart(session.token);
  if (!items.length) {
    return NextResponse.json({ code: 'EMPTY_CART', message: 'ตะกร้าสินค้าว่างเปล่า' }, { status: 400 });
  }

  const user         = users.get(session.email);
  const discountRate = user?.isMember ? 15 : 0;
  const summary      = computeSummary(items, discountRate);
  const id           = `ord_${randomUUID().slice(0, 8)}`;
  const createdAt    = new Date().toISOString();
  const estimatedDelivery = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const order = {
    id,
    email: session.email,
    ...summary,
    shippingAddress: body.shippingAddress,
    paymentMethod:   body.paymentMethod,
    status:          'confirmed' as const,
    estimatedDelivery,
    createdAt,
  };

  orderStore.set(id, order);
  carts.set(session.token, []);

  return NextResponse.json({ data: order }, { status: 201 });
}
