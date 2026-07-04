import { users, sessions, carts, orderStore } from '@/lib/server-store';

export function clearStore() {
  users.clear();
  sessions.clear();
  carts.clear();
  orderStore.clear();
}
