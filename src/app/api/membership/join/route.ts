import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { users } from '@/lib/server-store';

export function POST(req: NextRequest) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  const user = users.get(session.email);
  if (!user) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }
  if (user.isMember) {
    return NextResponse.json({ code: 'ALREADY_MEMBER', message: 'คุณเป็นสมาชิกอยู่แล้ว' }, { status: 409 });
  }

  user.isMember = true;
  users.set(session.email, user);

  return NextResponse.json({ data: { isMember: true, discountRate: 15, joinedAt: user.joinedAt } });
}
