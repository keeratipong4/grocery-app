import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken, isValidEmail, hashPassword, COOKIE_OPTIONS, SESSION_COOKIE_NAME } from '@/lib/api-helpers';
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
  if (await prisma.user.findUnique({ where: { email: body.email } })) {
    return NextResponse.json(
      { code: 'DUPLICATE_EMAIL', message: 'อีเมลนี้ถูกใช้งานแล้ว' },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: { email: body.email, password: hashPassword(body.password), isMember: false },
  });

  // Merge guest cart into new session
  const guestToken   = getToken(req);
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

  const res = NextResponse.json({ data: { email: user.email, joinedAt: user.joinedAt.toISOString() } }, { status: 201 });
  res.cookies.set(SESSION_COOKIE_NAME, newToken, COOKIE_OPTIONS);
  return res;
}
