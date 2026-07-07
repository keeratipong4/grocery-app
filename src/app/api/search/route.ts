import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get('q') ?? '';
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit') ?? '10'));

  if (q.length < 2) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'คำค้นหาต้องมีอย่างน้อย 2 ตัวอักษร' },
      { status: 400 }
    );
  }

  const rows = await prisma.product.findMany({ include: { category: true } });
  const lower = q.toLowerCase();
  const data  = rows
    .filter(p => p.name.toLowerCase().includes(lower) || p.category.name.toLowerCase().includes(lower))
    .slice(0, limit)
    .map(p => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      price: p.price,
      discount: p.discount,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isNew: p.isNew,
    }));

  return NextResponse.json({ data, meta: { total: data.length, page: 1, limit, totalPages: 1 } });
}
