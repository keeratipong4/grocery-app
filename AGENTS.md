# AGENTS.md — Repo Context for AI Agents

This file gives every agent working in this repo the context needed to operate correctly.
Read this before making any changes.

---

## Project Overview

An online grocery store where customers can search and buy groceries (vegetables, fruits, meat, dairy, beverages, etc.) without visiting a physical store.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Prisma + SQLite (via `better-sqlite3` driver adapter)

**Business Goals:** Increase sales · Retain members (repeat purchases) · Reduce in-store workload

> **Note:** this project started as a frontend-only build with mock data (see `plan.md`), then grew a real Prisma/SQLite backend for auth, cart, checkout, orders, and the product/category catalog. The sections below describe the *current* state, including where the migration is incomplete.

---

## Current Architecture

- **Database**: SQLite (`prisma/dev.db`) via Prisma, models: `User`, `Session`, `CartItem`, `Category`, `Product`, `Brand`, `Order`, `OrderItem`, `ShippingAddress`, plus a throwaway `Item` smoke-test model. See `prisma/schema.prisma` for the source of truth.
- **API routes** (`src/app/api/**/route.ts`) are all Prisma-backed: `auth/{register,login,logout,me}`, `cart`, `cart/items`, `cart/items/[productId]`, `checkout`, `orders/[id]`, `membership`, `membership/join`, `products`, `products/[id]`, `search`, `categories`, plus `items` (smoke test) and `hello`. None of them read `src/data/*.ts` or write to `src/lib/server-store.ts`'s in-memory Maps.
- **`src/lib/server-store.ts` is legacy** — its Maps (`users`/`sessions`/`carts`/`orderStore`) are no longer used by any live route. It's kept only because `src/__tests__/unit/server-store.test.ts` exercises its pure functions directly, and the live cart/checkout routes reuse its storage-agnostic `computeSummary()` helper (and the `ShippingAddress` type). Don't add new Map-based logic here.
- **Known incomplete migration**: `src/app/page.tsx` (home) and `src/app/category/[slug]/page.tsx` still read `src/data/products.ts` / `src/data/categories.ts` directly via static import — they have **not** been switched to call `/api/products` / `/api/categories`, even though those Prisma-backed endpoints exist and work. Treat `src/data/*.ts` as still-live for these two pages, not dead code.
- **Completed pages**: all transactional page routes (`src/app/product/[id]`, `src/app/cart`, `src/app/search`, and `src/app/checkout`) have been built and wired to the matching Prisma-backed API routes.
- **Cart/member client state is duplicated by design**: `useCartStore`/`useMemberStore` (Zustand, `persist`) hold an optimistic local copy for snappy UI, but the source of truth is the server (`CartItem`/`User.isMember` in Prisma, keyed by the `farmart-session` cookie). Store mutations do a local update immediately, then fire the matching API call and reconcile. Don't assume Zustand state alone reflects reality — the server can differ (e.g. after login-time cart merge).
- **Seeding**: use the `/seed-data` skill (`.claude/skills/seed-data/SKILL.md`) to seed/reseed the database. Running `npm test` wipes `User`/`Session`/`CartItem`/`Order`/`OrderItem`/`ShippingAddress` (not `Category`/`Product`/`Brand`) as part of test isolation — reseed afterward if you need demo data for manual browsing.

---

## What to Build (see plan.md for full checklist)

| Step | What to Build | Path |
|---|---|---|
| 1 | Types | `src/types/index.ts` |
| 2 | Mock data (still live for home/category pages — see Current Architecture) | `src/data/products.ts`, `src/data/categories.ts` |
| 3 | Stores | `src/store/useCartStore.ts`, `src/store/useMemberStore.ts` |
| 4 | Utilities | `src/lib/utils.ts` |
| 5 | Layout | `src/app/layout.tsx`, `src/components/layout/Navbar.tsx` |
| 6 | Components | `ProductCard`, `CartDrawer`, `MembershipPanel`, `NewBadge` |
| 7 | Pages | `/` ✅, `/category/[slug]` ✅, `/product/[id]` ✅, `/cart` ✅, `/search` ✅, `/checkout` ✅ |

---

## Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000, or next free port)
```

### Build
```bash
npm run build        # Production build — must pass before any commit (includes lint + type check)
```

> A standalone type check script is available via `npm run type-check` (runs `tsc --noEmit` to verify type safety without writing dev server build files).

### Lint
```bash
npm run lint         # ESLint (Next.js ruleset)
```

### Tests
```bash
npm test               # Full suite: unit + integration (real SQLite db, --test-concurrency=1)
npm run test:unit      # Unit tests only (utils, api-helpers, server-store pure functions)
npm run test:integration  # Integration tests only (auth, cart, products, membership, checkout, items)
npm run test:coverage  # Full suite with coverage report (--experimental-test-coverage)
```

> **New feature rule:** every new feature must ship with its own unit tests. Run `npm run test:coverage` and confirm the suite passes with overall coverage above 80% before considering the feature done.

### Database
```bash
npm run db:seed       # Seed/reseed prisma/dev.db (idempotent) — prefer the /seed-data skill for anything beyond a plain reseed
npx prisma migrate dev --name <name>   # After changing prisma/schema.prisma
npx prisma generate   # After pulling schema changes without a migration (e.g. fresh clone)
```

> Always run `npm run build`, `npm run lint`, and `npm test` before reporting a task complete. All must pass with zero errors. `npm test` shares the real dev database (`prisma/dev.db`) with the app and will clear `User`/`Session`/`CartItem`/`Order` rows — reseed with `npm run db:seed` afterward if you need demo data.

---

## Project Entry Points

| What | Where |
|---|---|
| Root layout (Navbar lives here) | `src/app/layout.tsx` |
| Homepage | `src/app/page.tsx` |
| Category page | `src/app/category/[slug]/page.tsx` |
| Shared types | `src/types/index.ts` |
| Cart state (client-side optimistic cache) | `src/store/useCartStore.ts` |
| Member/discount state (client-side optimistic cache) | `src/store/useMemberStore.ts` |
| Price & discount helpers | `src/lib/utils.ts` |
| Mock product/category data (still live for home/category pages) | `src/data/products.ts`, `src/data/categories.ts` |
| Prisma schema (source of truth for the DB) | `prisma/schema.prisma` |
| Prisma client singleton | `src/lib/prisma.ts` |
| Seed script | `prisma/seed.ts` |
| Auth/session/cart helpers used by API routes | `src/lib/api-helpers.ts` |
| Legacy in-memory store (pure functions only, see Current Architecture) | `src/lib/server-store.ts` |
| API routes | `src/app/api/**/route.ts` |

---

## Conventions & Rules

### Language & Code Style
- TypeScript only — no `any`. Define all types in `src/types/index.ts` and import from there.
- Default to React Server Components. Add `"use client"` only when interactivity is required, with a short comment explaining why (this convention is consistently followed — check existing components for the pattern).
- No comments that describe *what* the code does — only comment *why* when it's non-obvious from the code itself.

### File Structure
- New components go in the paths defined in the table above. Do not create folders outside `src/`.
- One file = one component. Do not export multiple components from a single file (except tiny sub-components used only within that file).
- Component filenames use PascalCase. Other files (utils, store, data) use camelCase.
- API route handlers live under `src/app/api/**/route.ts` (Next.js App Router convention) and should call Prisma directly (or via `src/lib/api-helpers.ts`), never `src/data/*.ts` or `src/lib/server-store.ts`'s Maps.

### State Management
- Cart and member **client-side** state must go through the Zustand stores only — do not use `useState` to hold cart items.
- All stores must use the `persist` middleware to auto-save to localStorage.
- Do not fetch or mutate stores directly from Server Components — do it through Client Components.
- Cart/member Zustand state is a local optimistic cache, not the source of truth — the server (Prisma `CartItem`/`User`, via the `farmart-session` cookie) is authoritative. New store mutations should follow the existing pattern in `useCartStore.ts`: update locally, then fire the matching API call and reconcile with the response.

### UI / Tailwind
- Tailwind classes only — no inline styles or separate CSS files (except `globals.css`).
- Mobile-first responsive: default → `sm:` → `md:` → `lg:`.
- The "Add to Cart" button must be `bg-green-600` across every component.
- `DiscountBadge` renders only when `discount > 0`.

### Data
- `src/data/products.ts` / `src/data/categories.ts` are still directly imported by `src/app/page.tsx` and `src/app/category/[slug]/page.tsx` — keep these in sync with `prisma/seed.ts`'s `products`/`categories` arrays if you change one (ids, prices, discounts should match, since cart/checkout integration tests hardcode a couple of product ids/prices).
- New pages/components that need product/category data should prefer fetching from the Prisma-backed API routes (`/api/products`, `/api/categories`, `/api/search`) rather than importing `src/data/*.ts` directly — that's the direction the app is migrating, even though the two existing pages haven't been switched over yet.
- Prices are stored as `number` (THB). Always format with `formatPrice()` from `src/lib/utils.ts` before rendering.
- Discounts are stored as a percentage (0–100). Always compute the final price with `calcDiscountedPrice()`.
- Product/Category/Brand Prisma ids are stable, human-assigned strings (`'1'`, `'2'`, …), not `cuid()` — don't change this, the seed script's idempotency and the cart/checkout tests both depend on it.

---

## Do Not Touch

- **`CLAUDE.md`** — points to this file. Do not modify unless explicitly asked.
- **`AGENTS.md`** — this file. Do not modify unless explicitly asked.
- **`.claude/settings.json`** — permission config. Never edit.
- **`public/`** — static assets. Do not delete or rename existing files.
- **`tailwind.config.ts` / `next.config.ts`** — config files. Only edit if the task explicitly requires a config change; explain the change in the commit message.
- **`src/types/index.ts`** — shared types. Additive changes only; never remove or rename an existing type without checking all usages first.
- **`prisma/migrations/`** — never hand-edit an existing migration folder. Add new migrations via `npx prisma migrate dev`.

---

## Key Constraints

- **No external UI libraries.** Tailwind CSS only — do not install shadcn/ui, MUI, Chakra, or similar.
- **Real backend, Prisma + SQLite.** API routes persist to `prisma/dev.db` via Prisma. Don't reintroduce in-memory-only storage for new features — use Prisma models (add a migration if a new model is needed).
- **No `any`.** TypeScript strict mode is on. Fix the type; do not cast to `any`.
- **No direct DOM manipulation.** Use React state and refs only.
- **Two data sources currently coexist**: `src/data/*.ts` (still read directly by the home/category pages) and Prisma (everything else — all API routes, and the eventual source of truth). Don't assume one is authoritative everywhere; check which a given file actually uses before changing data shape.
- **Zustand stores hold client-side cart/member state**, but it's an optimistic cache synced to the server — don't lift it into React context or component state, and don't assume it alone reflects the authoritative state.

---

## Before Every Commit

1. `npm run build` — zero errors
2. `npm run lint` — zero warnings
3. `npm test` — all tests passing; reseed with `npm run db:seed` afterward if you need demo data restored
4. If a new feature was added, write unit tests for it and run `npm run test:coverage` — must pass with overall coverage above 80%
5. Open the changed page in browser and verify visually (`npm run dev` — check the terminal for the actual port, 3000 may be in use)
6. Test at 375px viewport (mobile) if any UI was changed
7. Confirm `DiscountBadge` only appears when `discount > 0`
8. Confirm cart badge in Navbar reflects the correct item count
9. Test every new component at 375px viewport width (mobile).
