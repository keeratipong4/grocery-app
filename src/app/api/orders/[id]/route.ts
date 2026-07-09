import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

interface Props { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true, user: true },
  });
  if (!order) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบออเดอร์' }, { status: 404 });
  }
  if (order.userId !== session.userId) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์เข้าถึงออเดอร์นี้' },
      { status: 403 }
    );
  }

  const data = {
    id: order.id,
    email: order.user.email,
    items: order.items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })),
    subtotal: order.subtotal,
    discountRate: order.discountRate,
    discount: order.discount,
    grandTotal: order.grandTotal,
    shippingAddress: order.shippingAddress
      ? {
          name: order.shippingAddress.name,
          phone: order.shippingAddress.phone,
          addressLine: order.shippingAddress.addressLine,
          district: order.shippingAddress.district,
          province: order.shippingAddress.province,
          postalCode: order.shippingAddress.postalCode,
        }
      : null,
    paymentMethod: order.paymentMethod,
    status: order.status,
    estimatedDelivery: order.estimatedDelivery?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
  };

  return NextResponse.json({ data });
}
