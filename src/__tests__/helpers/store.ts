import { prisma } from '@/lib/prisma';

export async function clearStore() {
  await prisma.cartItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
}
