'use client'; // client-only store — do not import in Server Components

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from '@/types';

interface MemberStore {
  member:       Member | null;
  join:         (email: string) => void;
  leave:        () => void;
  isMember:     () => boolean;
  discountRate: () => number;
}

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      member: null,

      join: (email) => {
        set({ member: { email, joinedAt: new Date().toISOString() } });
        // Activate membership on server (fire-and-forget)
        fetch('/api/membership/join', { method: 'POST' }).catch(() => {});
      },

      leave: () => {
        set({ member: null });
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      },

      isMember:     () => get().member !== null,
      discountRate: () => (get().member ? 15 : 0),
    }),
    { name: 'farmart-member' }
  )
);
