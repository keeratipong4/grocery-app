import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { products } from '@/data/products';

export function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get('q') ?? '';
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit') ?? '10'));

  if (q.length < 2) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'คำค้นหาต้องมีอย่างน้อย 2 ตัวอักษร' },
      { status: 400 }
    );
  }

  const lower = q.toLowerCase();
  const data  = products
    .filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower))
    .slice(0, limit);

  return NextResponse.json({ data, meta: { total: data.length, page: 1, limit, totalPages: 1 } });
}
