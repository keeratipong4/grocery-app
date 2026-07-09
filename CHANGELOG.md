# Changelog — Project Grocery App

All notable changes to this project will be documented in this file, structured by date and session.

---

## [2026-07-09] — Transaction Flow, Link Fixes & Hydration Fixes

### 🚀 Added (New Pages & Features)
- **Product Detail Page (`/product/[id]`)**:
  - React Server Component fetching product data and related products in the same category from SQLite via Prisma.
  - Custom client `AddToCartButton` syncing immediately to Zustand store.
- **Search & Filter Page (`/search`)**:
  - Implemented query string-based filtering (`q`, `category`, `isNew`, `hasDiscount`).
  - Supports sorting (price asc/desc, rating, discount) and database pagination.
  - Created client `SearchControlsClient` for interactive sidebar filtering.
- **Cart Page (`/cart`)**:
  - Full-screen cart layout for desktop and mobile viewports.
  - Interactive item quantities, remove controls, member discount (15%) application, and order checkout transition.
- **Checkout Page (`/checkout`)**:
  - Inline register/login security panel ensuring sessions are authenticated prior to placing orders.
  - Integrated shipping address form, payment method selector (PromptPay, Credit Card, Cash on Delivery), and dynamic price summary.
  - Success handler calling `POST /api/checkout` to create a Prisma order, clear local cart cache, and redirect.
- **Order Detail Page (`/orders/[id]`)**:
  - Invoice summary displaying order metadata, estimate delivery, and shipping/billing specifications.
  - Implemented strict server-side cookie ownership check to prevent cross-account order leaking.

### 🔧 Fixed (Link Integrations & Bugs)
- **Link Fixes**:
  - Connected `#` placeholders on Homepage (HeroBanner, Category Grid, Brand Cards, Footer, Section Headers) to actual matching routes.
  - Connected Navbar search bar to route directly to `/search?q=...`.
- **Hydration Mismatches**:
  - Fixed HTML entity syntax mismatch (`นม &amp; ไข่` -> `นม & ไข่`) in `Navbar.tsx`.
  - Implemented client-side `mounted` checks in `Navbar.tsx`, `CartDrawer.tsx`, and `MembershipPanel.tsx` to prevent hydration differences caused by Zustand persisted localStorage state.
- **Cart Drawer Navigation**:
  - Excluded `isOpen` state from Zustand `localStorage` persistence via `partialize` configuration in `useCartStore.ts`.
  - Converted the Checkout button in `CartDrawer.tsx` to Next.js `<Link>` with `onClick={closeCart}` to ensure the drawer is closed upon landing on the checkout page.

### ⚙️ Changed (Dev & Tooling)
- **TypeScript & Build Check script**:
  - Added `"type-check": "tsc --noEmit"` in `package.json` to enable quick, non-destructive type verification that doesn't overwrite `.next` assets and corrupt the running `npm run dev` server.
  - Fixed a TypeScript error in `products.test.ts` where `getCategories` was called with request arguments when the route expects zero parameters.
