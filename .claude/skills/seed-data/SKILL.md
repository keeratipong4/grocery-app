---
name: seed-data
description: Seed and maintain the grocery-app's Prisma/SQLite database (Category, Brand, Product, User, Order) and keep the API routes wired to Prisma instead of static in-memory data. Use when asked to seed the DB, add demo data, reset the dev database, or verify seeded data flows through the app/API/tests.
---

# seed-data

Maintains the dev database for this repo. This is a repeatable maintenance operation, not a one-time migration — running it again just re-seeds idempotently.

## What's already in place (first run is done)

- Prisma models: `Category`, `Product`, `Brand` (catalog) plus the pre-existing `User`, `Session`, `CartItem`, `Order`, `OrderItem`, `ShippingAddress` (auth/cart/orders).
- All of `/api/products`, `/api/products/[id]`, `/api/categories`, `/api/search`, `/api/cart/*`, `/api/auth/*`, `/api/checkout`, `/api/orders/[id]`, `/api/membership/*` read/write through Prisma — none of them use `src/data/*.ts` or `src/lib/server-store.ts` anymore.
- `src/lib/server-store.ts` is kept only because `src/__tests__/unit/server-store.test.ts` exercises its pure functions (`computeSummary`, `getDiscountRate`, `getCart`, `withCartLock`) directly. `computeSummary` is also reused by the live cart/checkout routes. Don't delete the file.
- `prisma/seed.ts` is idempotent (`upsert` by fixed id/email) — safe to re-run any time.

## Running the skill

1. **Detect state**: check whether `Category`/`Product`/`Brand` exist in `prisma/schema.prisma`. If they're missing (schema reverted, fresh clone, etc.), re-apply them (see `prisma/schema.prisma` for the exact models) and run `npx prisma migrate dev --name add_product_category_brand` (or a new migration name if that one already exists), then `npx prisma generate`.
2. **Seed**: run `npm run db:seed`. This upserts:
   - 8 `Category` rows (matching `src/data/categories.ts`, ids `'1'..'8'`, including แช่แข็ง/frozen)
   - 4 `Brand` rows
   - 22 `Product` rows (the original 20 from `src/data/products.ts` with unchanged ids/prices/discounts — cart/checkout tests hardcode product `'1'` and `'3'`'s prices, don't change them — plus 2 new frozen-category products, ids `'21'`/`'22'`)
   - 5 demo `User`s (mix of `isMember` true/false), all with the same demo password, printed at the end of the run
   - 6 `Order`s (one per status: pending/confirmed/preparing/out_for_delivery/delivered/cancelled) with `OrderItem`s and a `ShippingAddress`, spread across 2 of the demo users
   - `Session`/`CartItem` are intentionally **not** seeded — they're transient, created naturally by login/cart-add flows.
3. **`--reset`**: if asked for a clean-slate reseed, first print current row counts for `Order`/`User` (in case real data from manual testing exists — this DB is shared with `npm test`, see note below), get confirmation, then `deleteMany` on `Order`, `OrderItem`, `ShippingAddress`, `Session`, `CartItem`, `User`, `Product`, `Category`, `Brand` before re-running `npm run db:seed`. Never do this without the user's go-ahead.
4. **Verify**: run `npm test` (uses `--test-concurrency=1` deliberately — integration tests share the real `prisma/dev.db` across files, so serial execution avoids FK/unique-constraint races between files touching `User`/`Session`/`Order`). All tests should pass.
5. **Reseed after testing**: `npm test`'s `beforeEach(clearStore)` wipes `User`/`Session`/`CartItem`/`Order`/`OrderItem`/`ShippingAddress` (not `Category`/`Product`/`Brand`) to isolate test runs. Since tests run against the same `prisma/dev.db` as the app (no separate test DB is configured), running `npm test` after seeding will remove the seeded demo users/orders. Re-run `npm run db:seed` after `npm test` if you want the demo data back for manual browsing.
6. **Summary**: `npm run db:seed` prints row counts per model and the shared demo password — use those to log in and browse the seeded catalog/orders in the UI (`npm run dev`).

## Notes for future maintainers

- `AGENTS.md` in the repo root still says "no backend" / "mock data only" — that's now stale as of this migration. Flag it to the user; don't edit `AGENTS.md` yourself without being asked.
- If you add new API routes that touch products/categories/users/orders, wire them to Prisma directly — don't reintroduce reads from `src/data/*.ts` or writes to `server-store.ts` Maps.
- Keep `Product`/`Category`/`Brand` ids stable (don't switch to `cuid()`) — the seed's idempotency and the cart/checkout tests' hardcoded product ids both depend on it.
