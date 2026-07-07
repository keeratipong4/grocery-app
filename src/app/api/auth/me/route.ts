import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบผู้ใช้' }, { status: 404 });
  return NextResponse.json({ data: { email: user.email, joinedAt: user.joinedAt.toISOString() } });
}
