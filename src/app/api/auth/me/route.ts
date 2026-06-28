import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { users } from '@/lib/server-store';

export function GET(req: NextRequest) {
  const { session, error } = requireAuth(req);
  if (error) return error;
  const user = users.get(session.email);
  if (!user) return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบผู้ใช้' }, { status: 404 });
  return NextResponse.json({ data: { email: user.email, joinedAt: user.joinedAt } });
}
