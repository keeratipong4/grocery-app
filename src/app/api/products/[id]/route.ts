import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Props { params: { id: string } }

export async function GET(_req: Request, { params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!product) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบสินค้า' }, { status: 404 });
  }
  return NextResponse.json({
    data: {
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: product.price,
      discount: product.discount,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isNew: product.isNew,
    },
  });
}
