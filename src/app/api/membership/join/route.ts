import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }
  if (user.isMember) {
    return NextResponse.json({ code: 'ALREADY_MEMBER', message: 'คุณเป็นสมาชิกอยู่แล้ว' }, { status: 409 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { isMember: true } });

  return NextResponse.json({ data: { isMember: true, discountRate: 15, joinedAt: user.joinedAt.toISOString() } });
}
