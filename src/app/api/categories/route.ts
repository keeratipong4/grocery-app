import { NextResponse } from 'next/server';
import { categories } from '@/data/categories';

export function GET() {
  return NextResponse.json({ data: categories });
}
