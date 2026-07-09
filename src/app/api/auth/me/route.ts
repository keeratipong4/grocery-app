import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;
  
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ code: 'NOT_FOUND', message: 'ไม่พบผู้ใช้' }, { status: 404 });

  // Get user's last shipping address from their most recent order
  const lastOrder = await prisma.order.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { shippingAddress: true },
  });

  const lastShippingAddress = lastOrder?.shippingAddress
    ? {
        name: lastOrder.shippingAddress.name,
        phone: lastOrder.shippingAddress.phone,
        addressLine: lastOrder.shippingAddress.addressLine,
        district: lastOrder.shippingAddress.district,
        province: lastOrder.shippingAddress.province,
        postalCode: lastOrder.shippingAddress.postalCode,
      }
    : null;

  return NextResponse.json({
    data: {
      email: user.email,
      joinedAt: user.joinedAt.toISOString(),
      lastShippingAddress,
    },
  });
}

export async function PUT(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  const updateData: { email?: string; password?: string } = {};

  if (body.email !== undefined) {
    if (!body.email) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'กรุณากรอกอีเมล' },
        { status: 400 }
      );
    }
    const { isValidEmail } = await import('@/lib/api-helpers');
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing && existing.id !== session.userId) {
      return NextResponse.json(
        { code: 'DUPLICATE_EMAIL', message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 }
      );
    }
    updateData.email = body.email;
  }

  if (body.password !== undefined) {
    if (!body.password) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'กรุณากรอกรหัสผ่าน' },
        { status: 400 }
      );
    }
    if (body.password.length < 8) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
        { status: 400 }
      );
    }
    const { hashPassword } = await import('@/lib/api-helpers');
    updateData.password = hashPassword(body.password);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'ไม่มีข้อมูลที่จะแก้ไข' },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
  });

  return NextResponse.json({
    data: {
      email: updatedUser.email,
      joinedAt: updatedUser.joinedAt.toISOString(),
    },
  });
}

