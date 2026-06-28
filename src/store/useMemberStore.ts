import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from '@/types';

interface MemberStore {
  member: Member | null;
  join: (email: string) => void;
  leave: () => void;
  isMember: () => boolean;
  discountRate: () => number;
}

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      member: null,

      join: (email) => {
        set({ member: { email, joinedAt: new Date().toISOString() } });
      },

      leave: () => set({ member: null }),

      isMember: () => get().member !== null,

      discountRate: () => (get().member ? 15 : 0),
    }),
    { name: 'farmart-member' }
  )
);
