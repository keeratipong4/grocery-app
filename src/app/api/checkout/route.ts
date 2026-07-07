import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getCartItems } from '@/lib/api-helpers';
import { computeSummary } from '@/lib/server-store';
import type { ShippingAddress } from '@/lib/server-store';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req);
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

  const items = await getCartItems(session.token);
  if (!items.length) {
    return NextResponse.json({ code: 'EMPTY_CART', message: 'ตะกร้าสินค้าว่างเปล่า' }, { status: 400 });
  }

  const user         = await prisma.user.findUnique({ where: { id: session.userId } });
  const discountRate = user?.isMember ? 15 : 0;
  const summary       = computeSummary(items, discountRate);
  const id            = `ord_${randomUUID().slice(0, 8)}`;
  const createdAt     = new Date();
  const estimatedDelivery = new Date(Date.now() + 4 * 60 * 60 * 1000);

  await prisma.order.create({
    data: {
      id,
      userId: session.userId,
      subtotal: summary.subtotal,
      discountRate: summary.discountRate,
      discount: summary.discount,
      grandTotal: summary.grandTotal,
      paymentMethod: body.paymentMethod,
      status: 'confirmed',
      estimatedDelivery,
      createdAt,
      items: { create: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })) },
      shippingAddress: { create: body.shippingAddress },
    },
  });
  await prisma.cartItem.deleteMany({ where: { sessionToken: session.token } });

  const order = {
    id,
    email: user!.email,
    ...summary,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod,
    status: 'confirmed' as const,
    estimatedDelivery: estimatedDelivery.toISOString(),
    createdAt: createdAt.toISOString(),
  };

  return NextResponse.json({ data: order }, { status: 201 });
}
