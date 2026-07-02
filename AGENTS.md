# AGENTS.md — Repo Context for AI Agents

This file gives every agent working in this repo the context needed to operate correctly.
Read this before making any changes.

---

## Project Overview

An online grocery store where customers can search and buy groceries (vegetables, fruits, meat, dairy, beverages, etc.) without visiting a physical store.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand

**Business Goals:** Increase sales · Retain members (repeat purchases) · Reduce in-store workload

---

## What to Build (see plan.md for full checklist)

| Step | What to Build | Path |
|---|---|---|
| 1 | Types | `src/types/index.ts` |
| 2 | Mock data | `src/data/products.ts`, `src/data/categories.ts` |
| 3 | Stores | `src/store/useCartStore.ts`, `src/store/useMemberStore.ts` |
| 4 | Utilities | `src/lib/utils.ts` |
| 5 | Layout | `src/app/layout.tsx`, `src/components/layout/Navbar.tsx` |
| 6 | Components | `ProductCard`, `CartDrawer`, `MembershipPanel`, `NewBadge` |
| 7 | Pages | `/`, `/category/[slug]`, `/product/[id]`, `/cart`, `/search`, `/checkout` |

---

## Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:3000
```

### Build & Type Check
```bash
npm run build        # Production build — must pass before any commit
npm run type-check   # Run tsc --noEmit without building
```

### Lint & Format
```bash
npm run lint         # ESLint (Next.js ruleset)
npm run lint:fix     # Auto-fix lint errors
```

### Tests (once added)
```bash
npm test             # Run all unit tests
npm run test:watch   # Watch mode during development
```

> Always run `npm run build` and `npm run lint` before reporting a task complete. Both must pass with zero errors.

---

## Project Entry Points

| What | Where |
|---|---|
| Root layout (Navbar lives here) | `src/app/layout.tsx` |
| Homepage | `src/app/page.tsx` |
| Shared types | `src/types/index.ts` |
| Cart state | `src/store/useCartStore.ts` |
| Member/discount state | `src/store/useMemberStore.ts` |
| Price & discount helpers | `src/lib/utils.ts` |
| All mock product data | `src/data/products.ts` |

---

## Conventions & Rules

### Language & Code Style
- TypeScript only — no `any`. Define all types in `src/types/index.ts` and import from there.
- Default to React Server Components. Add `"use client"` only when interactivity is required, with a short comment explaining why.
- No comments that describe *what* the code does — only comment *why* when it's non-obvious from the code itself.

### File Structure
- New components go in the paths defined in the table above. Do not create folders outside `src/`.
- One file = one component. Do not export multiple components from a single file (except tiny sub-components used only within that file).
- Component filenames use PascalCase. Other files (utils, store, data) use camelCase.

### State Management
- Cart and member state must go through Zustand stores only — do not use `useState` to hold cart items.
- All stores must use the `persist` middleware to auto-save to localStorage.
- Do not fetch or mutate stores directly from Server Components — do it through Client Components.

### UI / Tailwind
- Tailwind classes only — no inline styles or separate CSS files (except `globals.css`).
- Mobile-first responsive: default → `sm:` → `md:` → `lg:`.
- The "Add to Cart" button must be `bg-green-600` across every component.
- `DiscountBadge` renders only when `discount > 0`.

### Data
- All mock data lives in `src/data/` only — never hardcode product data inside components.
- Prices are stored as `number` (THB). Always format with `formatPrice()` from `src/lib/utils.ts` before rendering.
- Discounts are stored as a percentage (0–100). Always compute the final price with `calcDiscountedPrice()`.

---

## Do Not Touch

- **`plan.md`** — requirement checklist owned by the human. Agents must not edit it.
- **`CLAUDE.md`** — points to this file. Do not modify unless explicitly asked.
- **`AGENTS.md`** — this file. Do not modify unless explicitly asked.
- **`.claude/settings.json`** — permission config. Never edit.
- **`public/`** — static assets. Do not delete or rename existing files.
- **`tailwind.config.ts` / `next.config.ts`** — config files. Only edit if the task explicitly requires a config change; explain the change in the commit message.
- **`src/types/index.ts`** — shared types. Additive changes only; never remove or rename an existing type without checking all usages first.

---

## Key Constraints

- **No external UI libraries.** Tailwind CSS only — do not install shadcn/ui, MUI, Chakra, or similar.
- **No backend.** This is a frontend-only project. Do not add API routes, database connections, or server actions that persist data.
- **No `any`.** TypeScript strict mode is on. Fix the type; do not cast to `any`.
- **No direct DOM manipulation.** Use React state and refs only.
- **Mock data is the source of truth.** Do not fetch from external APIs — all product/category data comes from `src/data/`.
- **Zustand stores only for cart and member state.** Do not lift cart state into React context or component state.

---

## Before Every Commit

1. `npm run build` — zero errors
2. `npm run lint` — zero warnings
3. Open the changed page in browser at localhost:3000 and verify visually
4. Test at 375px viewport (mobile) if any UI was changed
5. Confirm `DiscountBadge` only appears when `discount > 0`
6. Confirm cart badge in Navbar reflects the correct item count
7. Run `npm run dev` and open the new page in a real browser before reporting a task complete.
8. Test every new component at 375px viewport width (mobile).
