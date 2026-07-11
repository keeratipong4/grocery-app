'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMemberStore } from '@/store/useMemberStore';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  createdAt: string;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const { member, join, leave, isMember } = useMemberStore();

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile edit states
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Login form states (fallback if guest)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const loggedIn = isMember();

  // Load orders and default input fields when logged in
  useEffect(() => {
    if (!mounted || !loggedIn) return;

    setNewEmail(member?.email || '');
    setOrdersLoading(true);

    fetch('/api/orders')
      .then(res => {
        if (res.status === 401) {
          leave(); // Session expired on server, clear client state
          throw new Error('Session expired');
        }
        if (res.ok) return res.json();
        throw new Error('Failed to fetch orders');
      })
      .then(json => {
        setOrders(json.data || []);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  }, [mounted, loggedIn, member?.email, leave]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-[1280px] mx-auto px-6 text-center py-20">
          <p className="text-gray-500 animate-pulse">กำลังโหลดโปรไฟล์…</p>
        </div>
      </main>
    );
  }

  // Handle Login/Register for guests
  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword || loginLoading) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!regRes.ok) {
        if (regRes.status === 409) {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
          });

          if (!loginRes.ok) {
            const loginErr = (await loginRes.json()) as { message?: string };
            setLoginError(loginErr.message ?? 'รหัสผ่านไม่ถูกต้อง หรือเข้าสู่ระบบไม่สำเร็จ');
            return;
          }
        } else {
          const regErr = (await regRes.json()) as { message?: string };
          setLoginError(regErr.message ?? 'สมัครสมาชิกไม่สำเร็จ กรุณากรอกรหัสผ่านอย่างน้อย 8 ตัว');
          return;
        }
      }

      join(loginEmail);
    } catch {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle Profile Update
  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (updateLoading) return;
    setUpdateSuccess('');
    setUpdateError('');

    if (newPassword && newPassword !== confirmPassword) {
      setUpdateError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setUpdateLoading(true);

    try {
      const payload: { email?: string; password?: string } = {};
      if (newEmail !== member?.email) {
        payload.email = newEmail;
      }
      if (newPassword) {
        payload.password = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setUpdateError('ไม่มีข้อมูลที่จะแก้ไข');
        setUpdateLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as { data?: { email: string }; message?: string };

      if (!res.ok) {
        setUpdateError(json.message ?? 'บันทึกข้อมูลไม่สำเร็จ');
        return;
      }

      if (json.data?.email) {
        // Sync local Zustand store
        join(json.data.email);
        setUpdateSuccess('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setUpdateError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setUpdateLoading(false);
    }
  }

  const paymentMethodNames: Record<string, string> = {
    PromptPay: 'พร้อมเพย์',
    CreditCard: 'บัตรเครดิต/เดบิต',
    COD: 'เก็บเงินปลายทาง',
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-md mx-auto bg-white border border-border rounded-banner p-8 shadow-card">
            <div className="text-center mb-6">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                เข้าสู่ระบบสมาชิก
              </span>
              <h2 className="text-xl font-bold text-gray-900">ระบุอีเมลและรหัสผ่านเพื่อดำเนินการต่อ</h2>
              <p className="text-xs text-text-secondary mt-1">
                กรุณาเข้าสู่ระบบเพื่อตรวจสอบประวัติคำสั่งซื้อและแก้ไขข้อมูลสมาชิก
              </p>
            </div>

            {loginError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md mb-4 font-medium">
                {loginError}
              </p>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-semibold">อีเมล</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-semibold">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors text-sm disabled:opacity-60 font-semibold"
              >
                {loginLoading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ / สมัครสมาชิก'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">โปรไฟล์ของฉัน</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">โปรไฟล์ของฉัน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Left Column: Edit Profile */}
          <section className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-border pb-3">ข้อมูลบัญชีผู้ใช้</h2>

            {updateError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md font-medium">
                {updateError}
              </p>
            )}

            {updateSuccess && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-md font-medium">
                {updateSuccess}
              </p>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-semibold">อีเมลบัญชีผู้ใช้</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-semibold">รหัสผ่านใหม่ (หากต้องการเปลี่ยน)</label>
                <input
                  type="password"
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 font-semibold">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors text-sm disabled:opacity-60 font-semibold"
              >
                {updateLoading ? 'กำลังบันทึกข้อมูล…' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </form>
          </section>

          {/* Right Column: Order History */}
          <section className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4 min-h-[400px]">
            <h2 className="text-lg font-bold text-gray-900 border-b border-border pb-3">ประวัติการสั่งซื้อ</h2>

            {ordersLoading ? (
              <div className="py-20 text-center text-gray-500 animate-pulse text-sm">
                กำลังโหลดประวัติการสั่งซื้อ…
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <span className="text-4xl block" role="img" aria-label="empty-history">📦</span>
                <p className="text-sm text-text-secondary">ยังไม่มีประวัติการสั่งซื้อในระบบ</p>
                <Link
                  href="/"
                  className="inline-block bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-md transition-colors font-semibold"
                >
                  เริ่มช็อปปิ้งเลย
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-border">
                  <thead>
                    <tr className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                      <th className="py-3 px-4">หมายเลขออเดอร์</th>
                      <th className="py-3 px-4">วันที่ทำรายการ</th>
                      <th className="py-3 px-4">ยอดรวมทั้งหมด</th>
                      <th className="py-3 px-4">การชำระเงิน</th>
                      <th className="py-3 px-4">สถานะ</th>
                      <th className="py-3 px-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-surface transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-900">
                          #{order.id}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {formatPrice(order.grandTotal)}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600">
                          {paymentMethodNames[order.paymentMethod] || order.paymentMethod}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'confirmed'
                              ? 'bg-success/10 text-success'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {order.status === 'confirmed' ? 'ยืนยันแล้ว' : order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-block bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm font-semibold"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
