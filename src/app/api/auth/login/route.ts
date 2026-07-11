import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken, verifyPassword, COOKIE_OPTIONS, SESSION_COOKIE_NAME } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';

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

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !verifyPassword(body.password, user.password)) {
    return NextResponse.json(
      { code: 'INVALID_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  }

  // Merge guest cart then issue new token (prevent session fixation)
  const guestToken     = getToken(req);
  const guestCartItems = guestToken
    ? await prisma.cartItem.findMany({ where: { sessionToken: guestToken } })
    : [];
  const newToken = randomUUID();
  await prisma.session.create({ data: { token: newToken, userId: user.id } });
  if (guestCartItems.length) {
    await prisma.cartItem.createMany({
      data: guestCartItems.map(ci => ({ sessionToken: newToken, productId: ci.productId, name: ci.name, price: ci.price, qty: ci.qty })),
    });
  }
  if (guestToken) await prisma.session.deleteMany({ where: { token: guestToken } });

  const res = NextResponse.json({ data: { email: user.email, joinedAt: user.joinedAt.toISOString() } });
  res.cookies.set(SESSION_COOKIE_NAME, newToken, COOKIE_OPTIONS);
  return res;
}
