import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (token) await prisma.session.deleteMany({ where: { token } });
  const res = NextResponse.json({ data: { success: true } });
  res.cookies.delete('farmart-session');
  return res;
}
