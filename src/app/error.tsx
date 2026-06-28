'use client'; // error boundaries must be Client Components

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
      <p className="text-4xl">😕</p>
      <h2 className="text-xl font-bold text-ink">เกิดข้อผิดพลาด</h2>
      <p className="text-sm text-text-secondary text-center max-w-sm">
        ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2 rounded-sm transition-colors"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
