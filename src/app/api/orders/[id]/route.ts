import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { orderStore } from '@/lib/server-store';

interface Props { params: { id: string } }

export function GET(req: NextRequest, { params }: Props) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  const order = orderStore.get(params.id);
  if (!order) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบออเดอร์' }, { status: 404 });
  }
  if (order.email !== session.email) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์เข้าถึงออเดอร์นี้' },
      { status: 403 }
    );
  }

  return NextResponse.json({ data: order });
}
