import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { calcDiscountedPrice } from '@/lib/utils';
import type { Product } from '@/types';

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category    = searchParams.get('category');
  const q           = searchParams.get('q');
  const sort        = searchParams.get('sort') ?? 'newest';
  const page        = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit       = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const isNewOnly   = searchParams.get('isNew') === 'true';
  const hasDiscount = searchParams.get('hasDiscount') === 'true';

  let result = [...products];

  if (category) {
    const cat = categories.find(c => c.slug === category);
    if (cat) result = result.filter(p => p.category === cat.name);
  }
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)
    );
  }
  if (isNewOnly)   result = result.filter(p => p.isNew);
  if (hasDiscount) result = result.filter(p => p.discount > 0);

  const sortFns: Record<string, (a: Product, b: Product) => number> = {
    price_asc:     (a, b) => calcDiscountedPrice(a.price, a.discount) - calcDiscountedPrice(b.price, b.discount),
    price_desc:    (a, b) => calcDiscountedPrice(b.price, b.discount) - calcDiscountedPrice(a.price, a.discount),
    rating_desc:   (a, b) => b.rating - a.rating,
    discount_desc: (a, b) => b.discount - a.discount,
    newest:        (a, b) => Number(b.isNew) - Number(a.isNew),
  };
  if (sortFns[sort]) result.sort(sortFns[sort]);

  const total      = result.length;
  const totalPages = Math.ceil(total / limit);
  const data       = result.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ data, meta: { total, page, limit, totalPages } });
}
