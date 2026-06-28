import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessions } from '@/lib/server-store';
import { getToken } from '@/lib/api-helpers';

export function POST(req: NextRequest) {
  const token = getToken(req);
  if (token) sessions.delete(token);
  const res = NextResponse.json({ data: { success: true } });
  res.cookies.delete('farmart-session');
  return res;
}
