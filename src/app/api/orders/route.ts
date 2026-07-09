import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, shippingAddress: true, user: true },
  });

  const data = orders.map(order => ({
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
  }));

  return NextResponse.json({ data });
}
