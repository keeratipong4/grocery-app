import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users, sessions, carts, getCart } from '@/lib/server-store';
import { getToken, isValidEmail, hashPassword } from '@/lib/api-helpers';
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
  if (!isValidEmail(body.email)) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
      { status: 400 }
    );
  }
  if (body.password.length < 8) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
      { status: 400 }
    );
  }
  if (users.has(body.email)) {
    return NextResponse.json(
      { code: 'DUPLICATE_EMAIL', message: 'อีเมลนี้ถูกใช้งานแล้ว' },
      { status: 409 }
    );
  }

  const joinedAt = new Date().toISOString();
  users.set(body.email, { email: body.email, password: hashPassword(body.password), joinedAt, isMember: false });

  // Merge guest cart into new session
  const guestToken                = getToken(req);
  const guestCart: CartItem[]     = guestToken ? getCart(guestToken) : [];
  const newToken                  = randomUUID();
  sessions.set(newToken, { email: body.email });
  if (guestCart.length) carts.set(newToken, guestCart);
  if (guestToken) carts.delete(guestToken);

  const res = NextResponse.json({ data: { email: body.email, joinedAt } }, { status: 201 });
  res.cookies.set('farmart-session', newToken, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
