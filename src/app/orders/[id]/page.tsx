import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `คำสั่งซื้อ #${id} | Farmart` };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('farmart-session')?.value;
  if (!token) {
    redirect('/');
  }

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || !session.userId) {
    redirect('/');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Security check: Only the owner of the order can view it
  if (order.userId !== session.userId) {
    notFound();
  }

  // Formatting helper for payment methods
  const paymentMethodNames: Record<string, string> = {
    PromptPay: 'พร้อมเพย์ (PromptPay)',
    CreditCard: 'บัตรเครดิต / เดบิต',
    COD: 'เก็บเงินปลายทาง (Cash on Delivery)',
  };

  const deliveryTime = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="max-w-[1000px] mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">สั่งซื้อสินค้าเสร็จสิ้น!</h1>
          <p className="text-sm text-text-secondary">
            ขอบคุณสำหรับการสั่งซื้อ ออเดอร์ของคุณได้รับการบันทึกในระบบเรียบร้อยแล้ว
          </p>
        </div>

        {/* Info Grid */}
        <div className="bg-white border border-border rounded-banner p-6 md:p-8 shadow-card space-y-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-border pb-6">
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">หมายเลขออเดอร์</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">#{order.id}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">วันที่ทำรายการ</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">
                {new Date(order.createdAt).toLocaleDateString('th-TH')}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">ชำระด้วย</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">
                {paymentMethodNames[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">เวลาจัดส่งโดยประมาณ</span>
              <span className="text-sm font-extrabold text-primary mt-1 block">
                {deliveryTime ? `วันนี้ เวลา ${deliveryTime} น.` : 'ภายใน 4 ชั่วโมง'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">
            {/* Left side: Address & Items */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">ที่อยู่จัดส่ง</h3>
                {order.shippingAddress ? (
                  <div className="bg-surface p-4 rounded-md border border-border text-sm space-y-1.5 text-gray-700">
                    <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                    <p>โทร: {order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.addressLine}</p>
                    <p>
                      ต. {order.shippingAddress.district} อ. {order.shippingAddress.district} จ. {order.shippingAddress.province} {order.shippingAddress.postalCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-danger">ไม่พบข้อมูลที่อยู่จัดส่ง</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">รายการสินค้า</h3>
                <ul className="divide-y divide-border">
                  {order.items.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-xs text-text-secondary ml-2">x {item.qty}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side: Payment summary */}
            <aside className="bg-surface border border-border rounded-banner p-6 space-y-3.5 self-start">
              <h3 className="font-bold text-gray-900 border-b border-border pb-2.5">สรุปยอดชำระ</h3>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>ยอดรวมสินค้า</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {order.discountRate > 0 && (
                <div className="flex justify-between text-xs text-success">
                  <span>ส่วนลดสมาชิก ({order.discountRate}%)</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-600 pb-2.5 border-b border-border">
                <span>ค่าจัดส่ง</span>
                <span className="text-success font-semibold">ฟรี</span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-bold text-gray-900">ชำระสุทธิ</span>
                <strong className="text-xl font-extrabold text-gray-900">{formatPrice(order.grandTotal)}</strong>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-hover text-white text-sm font-bold px-8 py-3 rounded-md transition-colors shadow-sm"
          >
            กลับไปหน้าหลักเพื่อช็อปต่อ
          </Link>
        </div>
      </div>
    </main>
  );
}
