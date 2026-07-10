'use client'; // Handles forms, API requests, state integration, and client redirection

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useMemberStore } from '@/store/useMemberStore';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { member, join, leave, isMember, discountRate } = useMemberStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Shipping form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('PromptPay');

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const loggedIn = isMember();

  // Pre-populate address if user is logged in
  useEffect(() => {
    if (!mounted) return;
    if (loggedIn) {
      fetch('/api/auth/me')
        .then(res => {
          if (res.status === 401) {
            leave(); // Session expired on server, clear client state
            return null;
          }
          if (!res.ok) {
            throw new Error('Failed to fetch user info');
          }
          return res.json();
        })
        .then(resJson => {
          if (!resJson) return;
          const addr = resJson.data?.lastShippingAddress;
          if (addr) {
            setFullName(addr.name || '');
            setPhone(addr.phone || '');
            setAddressLine(addr.addressLine || '');
            setDistrict(addr.district || '');
            setProvince(addr.province || '');
            setPostalCode(addr.postalCode || '');
          }
        })
        .catch(err => {
          console.error('Error fetching last shipping address:', err);
        });
    }
  }, [mounted, loggedIn, leave]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-[1280px] mx-auto px-6 text-center py-20">
          <p className="text-gray-500 animate-pulse">กำลังโหลดหน้าชำระเงิน…</p>
        </div>
      </main>
    );
  }

  // Auth Submit Handler (Register/Login inline)
  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || authLoading) return;
    setAuthLoading(true);
    setAuthError('');

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!regRes.ok) {
        if (regRes.status === 409) {
          // Email already exists, try logging in
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!loginRes.ok) {
            const loginErr = await loginRes.json() as { message?: string };
            setAuthError(loginErr.message ?? 'รหัสผ่านไม่ถูกต้อง หรือเข้าสู่ระบบไม่สำเร็จ');
            return;
          }
        } else {
          const regErr = await regRes.json() as { message?: string };
          setAuthError(regErr.message ?? 'สมัครสมาชิกไม่สำเร็จ กรุณากรอกรหัสผ่านอย่างน้อย 8 ตัว');
          return;
        }
      }

      join(email);
    } catch {
      setAuthError('เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่อีกครั้ง');
    } finally {
      setAuthLoading(false);
    }
  }

  // Order Submission Handler
  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg('');

    const shippingAddress = {
      name: fullName,
      phone,
      addressLine,
      district,
      province,
      postalCode,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress, paymentMethod }),
      });

      const json = await res.json() as { data?: { id: string }; message?: string };

      if (!res.ok) {
        setErrorMsg(json.message ?? 'ทำรายการสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        return;
      }

      if (json.data?.id) {
        clearCart();
        router.push(`/orders/${json.data.id}`);
      } else {
        setErrorMsg('ไม่ได้รับรหัสคำสั่งซื้อจากเซิร์ฟเวอร์');
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการส่งข้อมูลการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  }

  const subtotal = totalPrice();
  const currentDiscountRate = discountRate();
  const discount = Math.round((subtotal * currentDiscountRate) / 100);
  const grandTotal = subtotal - discount;

  // Empty cart guard
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-white border border-border rounded-banner p-16 text-center shadow-card">
            <span className="text-5xl block mb-4" role="img" aria-label="empty-cart">🛒</span>
            <h2 className="text-lg font-bold text-gray-800 mb-2">ไม่มีสินค้าที่จะชำระเงิน</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              กรุณาเลือกสินค้าใส่ในตะกร้าช็อปปิ้งของคุณก่อนที่จะดำเนินการต่อ
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-md transition-colors"
            >
              กลับไปหน้าแรก
            </Link>
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
          <Link href="/cart" className="hover:text-primary transition-colors">ตะกร้าสินค้า</Link>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">ชำระเงิน</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">ชำระเงิน</h1>

        {!isMember() ? (
          /* Login/Register Card */
          <div className="max-w-md mx-auto bg-white border border-border rounded-banner p-8 shadow-card">
            <div className="text-center mb-6">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                เข้าสู่ระบบสมาชิก
              </span>
              <h2 className="text-xl font-bold text-gray-900">ระบุอีเมลและรหัสผ่านเพื่อดำเนินการต่อ</h2>
              <p className="text-xs text-text-secondary mt-1">
                การเข้าสู่ระบบช่วยให้บันทึกประวัติสั่งซื้อและรับส่วนลดสมาชิก 15% ทันที
              </p>
            </div>

            {authError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md mb-4">
                {authError}
              </p>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">อีเมล</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors text-sm disabled:opacity-60"
              >
                {authLoading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ / สมัครสมาชิก'}
              </button>
            </form>
          </div>
        ) : (
          /* Checkout Forms */
          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="space-y-6">
              {/* Shipping Form */}
              <div className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-border pb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                  ข้อมูลจัดส่งสินค้า
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่อ-นามสกุล ผู้รับ</label>
                    <input
                      type="text"
                      required
                      placeholder="สมชาย ใจดี"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812345678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, ซอย)</label>
                  <input
                    type="text"
                    required
                    placeholder="123/45 หมู่ 6 อาคารพาราไดซ์ ชั้น 5"
                    value={addressLine}
                    onChange={e => setAddressLine(e.target.value)}
                    className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">แขวง / เขต / อำเภอ</label>
                    <input
                      type="text"
                      required
                      placeholder="คลองเตย"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">จังหวัด</label>
                    <input
                      type="text"
                      required
                      placeholder="กรุงเทพมหานคร"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      required
                      placeholder="10110"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full text-sm h-11 px-3 border border-border rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-border pb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                  ช่องทางการชำระเงิน
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`border rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all ${paymentMethod === 'PromptPay' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-surface'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PromptPay"
                      checked={paymentMethod === 'PromptPay'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">📱</span>
                    <span className="text-sm font-semibold">พร้อมเพย์ (PromptPay)</span>
                  </label>

                  <label className={`border rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all ${paymentMethod === 'CreditCard' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-surface'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CreditCard"
                      checked={paymentMethod === 'CreditCard'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">💳</span>
                    <span className="text-sm font-semibold">บัตรเครดิต / เดบิต</span>
                  </label>

                  <label className={`border rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-surface'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">💵</span>
                    <span className="text-sm font-semibold">เก็บเงินปลายทาง</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side: Order summary & Submit */}
            <aside className="bg-white border border-border rounded-banner p-6 shadow-card space-y-4">
              <h2 className="font-bold text-gray-900 border-b border-border pb-3">รายการสั่งซื้อ</h2>

              {/* Items List */}
              <ul className="divide-y divide-border max-h-[220px] overflow-y-auto pr-1">
                {items.map(item => (
                  <li key={item.productId} className="py-2.5 flex justify-between text-xs">
                    <div className="pr-4 truncate">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="text-text-secondary ml-1.5">x {item.qty}</span>
                    </div>
                    <span className="font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>ยอดรวมสินค้า</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {currentDiscountRate > 0 && (
                  <div className="flex justify-between text-xs text-success">
                    <span>ส่วนลดสมาชิก ({currentDiscountRate}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-success font-semibold">ฟรี</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">ยอดรวมทั้งหมด</span>
                <strong className="text-xl font-extrabold text-gray-900">{formatPrice(grandTotal)}</strong>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded mb-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-md transition-colors text-sm disabled:opacity-60 shadow-sm"
              >
                {loading ? 'กำลังยืนยันคำสั่งซื้อ…' : 'สั่งซื้อและชำระเงิน'}
              </button>

              <div className="text-[10px] text-text-secondary text-center">
                อีเมลจัดส่งจะใช้ตามบัญชีสมาชิก {member?.email}
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
