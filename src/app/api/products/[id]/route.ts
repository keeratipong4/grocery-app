import { NextResponse } from 'next/server';
import { products } from '@/data/products';

interface Props { params: { id: string } }

export function GET(_req: Request, { params }: Props) {
  const product = products.find(p => p.id === params.id);
  if (!product) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบสินค้า' }, { status: 404 });
  }
  return NextResponse.json({ data: product });
}
