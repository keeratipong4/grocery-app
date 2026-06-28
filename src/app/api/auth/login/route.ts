import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users, sessions, carts, getCart } from '@/lib/server-store';
import { getToken, verifyPassword } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';
import type { CartItem } from '@/types';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
      { status: 400 }
    );
  }

  const user = users.get(body.email);
  if (!user || !verifyPassword(body.password, user.password)) {
    return NextResponse.json(
      { code: 'INVALID_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  }

  // Merge guest cart then issue new token (prevent session fixation)
  const guestToken            = getToken(req);
  const guestCart: CartItem[] = guestToken ? getCart(guestToken) : [];
  const newToken              = randomUUID();
  sessions.set(newToken, { email: body.email });
  if (guestCart.length) carts.set(newToken, guestCart);
  if (guestToken) carts.delete(guestToken);

  const res = NextResponse.json({ data: { email: user.email, joinedAt: user.joinedAt } });
  res.cookies.set('farmart-session', newToken, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
