import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return NextResponse.json({
    data: {
      isMember:     user?.isMember ?? false,
      discountRate: user?.isMember ? 15 : 0,
      joinedAt:     user?.joinedAt.toISOString() ?? null,
    },
  });
}
