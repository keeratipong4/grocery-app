'use client'; // form submission updates useMemberStore

import { useState } from 'react';
import { useMemberStore } from '@/store/useMemberStore';

export default function MembershipModal() {
  const { isMember, join, member } = useMemberStore();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [success, setSuccess]     = useState(false);

  if (isMember()) {
    return (
      <aside className="bg-gradient-to-b from-green-900 to-green-800 rounded-banner p-7 text-white">
        <p className="text-2xl mb-2">🎉</p>
        <h3 className="text-xl font-bold mb-1">คุณเป็นสมาชิกแล้ว!</h3>
        <p className="text-sm text-green-200 mb-1">{member?.email}</p>
        <p className="text-sm text-green-200">รับส่วนลด <strong className="text-white">15%</strong> ทุกออเดอร์</p>
      </aside>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    join(email);
    setSuccess(true);
  }

  return (
    <aside className="bg-gradient-to-b from-green-900 to-green-800 rounded-banner p-7 text-white">
      <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
        🎉 สมาชิกเท่านั้น
      </span>
      <h3 className="text-xl font-bold leading-snug mb-2">รับส่วนลด 15%<br />สำหรับออเดอร์แรก</h3>
      <p className="text-sm text-green-200 mb-6 leading-relaxed">
        เข้าร่วมกับลูกค้าหลายพันคน ดีลสินค้าสดใหม่ทุกสัปดาห์
      </p>

      {success ? (
        <p className="text-green-300 font-semibold">✓ สมัครสำเร็จ! โค้ดส่วนลดอยู่ในอีเมลของคุณ</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="อีเมล"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-[42px] px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-[42px] px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-md transition-colors"
          >
            สมัครสมาชิก
          </button>
        </form>
      )}

      <p className="text-[11px] text-green-300/60 mt-4 text-center">
        การสมัครถือว่ายอมรับ{' '}
        <a href="#" className="underline text-green-300/80">เงื่อนไข</a> และ{' '}
        <a href="#" className="underline text-green-300/80">นโยบายความเป็นส่วนตัว</a>
      </p>
    </aside>
  );
}
