# Changelog — Project Grocery App

All notable changes to this project will be documented in this file, structured by date and session.

---

## [2026-07-10] — Cart Badge, Self-healing Cart Quantity, and Navbar Navigation Fixes

### 🔧 Fixed & Enhanced
- **Navbar Navigation**:
  - Fixed the logo link in the Navbar to correctly navigate to the homepage (`/`) and clear the URL hash (e.g., `#membership-section`) if the user is already on the homepage.
  - Updated the guest "เข้าสู่ระบบ" (Login) button in the Navbar to link directly to `/profile` (the Login/Register page) instead of pointing to `/#membership-section`, which prevents double-hash issues.
- **Hydration Mismatch Fix**:
  - Added `suppressHydrationWarning` to the `<html>` tag in the root layout (`src/app/layout.tsx`). This suppresses console hydration errors/warnings caused by browser extensions (e.g. ColorZilla adding `cz-shortcut-listen="true"`) modifying attributes of the `<body>` or `<html>` elements on the client side.
- **Cart & Navbar Badge Count**:
  - Changed the cart badge number calculation from counting the sum of product quantities to counting the number of distinct items (unique products) in the cart.
  - This affects both the header/navbar cart icon badge and the cart drawer/page item counts.
- **Cart Quantity Update Self-Healing (`PATCH`)**:
  - Modified the `/api/cart/items/[productId]` route handler to perform a database `upsert` instead of a plain `updateMany`.
  - This prevents the cart from becoming empty when clicking "+" or "-" in cases where the database session was cleared (e.g., after test runs) but the client still retained items in local storage.
- **Checkout Page Session Expiration Recovery**:
  - Handled 401 Unauthorized errors in the `/api/auth/me` call on the checkout page. If the server session is missing/expired, the client-side session is cleared gracefully using `leave()`, redirecting the user to the login/register card instead of crashing the page.
- **ESLint v9 Migration**:
  - Migrated the project's linting setup from `next lint` (which has been completely removed in Next.js 16) to the standard ESLint CLI (`eslint .`) using flat config (`eslint.config.mjs`).
  - Configured `eslint.config.mjs` to inherit from Next.js rules (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`) and disabled the overly strict `react-hooks/set-state-in-effect` rule to allow standard hydration state tracking checks (`mounted` state patterns).

---

## [2026-07-09] — Next.js 16 Upgrade & Compatibility Fixes

### 🚀 Upgraded
- **Next.js & React Upgrade**:
  - Upgraded Next.js from `14.x` to `^16.0.0` for latest features and performance.
  - Upgraded React and ReactDOM to `^19.0.0` to match Next.js 16 peer dependencies.
  - Upgraded ESLint to `^9.0.0` and `eslint-config-next` to `^16.0.0` to resolve dependency conflicts.

### 🔧 Fixed & Enhanced
- **Next.js 16 Breaking Changes (Asynchronous APIs)**:
  - Fixed `params` and `searchParams` in Page components and Route Handlers, which are now `Promise`s in Next.js 15+ and must be `await`ed before access.
  - Fixed `cookies()` from `next/headers` which is now a `Promise` and requires `await`ing.
  - Affected files included `/product/[id]`, `/search`, `/category/[slug]`, `/orders/[id]`, and multiple API endpoints (`/api/cart/items/[productId]`, `/api/orders/[id]`, `/api/products/[id]`).
- **Turbopack & Native Modules Compatibility**:
  - Added `serverExternalPackages: ['better-sqlite3', '@prisma/client']` to `next.config.mjs` to resolve build failures caused by Next.js attempting to bundle C++ native bindings.
- **Integration Tests Validation**:
  - Refactored integration tests (`cart.test.ts`, `checkout.test.ts`, `products.test.ts`) to pass `Promise.resolve({ ... })` directly to route handler testing functions, accurately simulating Next.js 16 router behavior.

---

## [2026-07-09] — User Profile, Order History & Address Pre-populate

### 🚀 Added
- **User Profile Page (`/profile`)**:
  - Created a responsive profile page where logged-in users can edit their email and change their password.
  - Integrated order history section displaying previous orders with their date, total, status, and direct link to their details.
  - Integrated a fallback login/register card for unauthenticated guest users.
- **API Routes**:
  - **`GET /api/orders`**: New endpoint returning the current user's order history sorted by creation date descending.
  - **`PUT /api/auth/me`**: New endpoint for updating user account details (email/password) with security validations.

### 🔧 Fixed & Enhanced
- **Address Pre-populate on Checkout**:
  - Updated `GET /api/auth/me` to include `lastShippingAddress` fetched from the user's most recent order.
  - Modified the checkout page to automatically retrieve and populate the shipping address forms if a prior address exists, while keeping fields editable.
- **Navbar User Dropdown**:
  - Added a "โปรไฟล์ของฉัน" (My Profile) link inside the user menu dropdown.

### ⚙️ Changed (Dev & Tooling)
- **Integration Tests**:
  - Added new tests in `auth.test.ts` to verify profile modifications and address retrieval.
  - Created `orders-list.test.ts` to test order history fetching.
  - Updated `package.json` scripts (`test`, `test:coverage`, `test:integration`) to include the new test file.

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
- **Navbar Category Dropdown**:
  - Replaced the static, non-functional "หมวดหมู่สินค้า" button with an interactive dropdown displaying all categories, complete with custom icons, hover state animations, and anchor navigation links.
  - Implemented custom click-outside hook functionality using React `useRef` and `useEffect` to auto-close the dropdown.
- **Cart Total & Discount Mismatch**:
  - Integrated `useMemberStore` discount calculation in the Navbar's cart price badge, correcting the subtotal mismatch where member discounts weren't being factored in next to the cart icon.
- **Cart Item Count Badge Sync**:
  - Standardized the cart badges across `Navbar.tsx`, `CartDrawer.tsx`, and `/cart` page to display the cumulative quantity of items (`totalItems()`) instead of the count of distinct product types (`items.length`).
- **Dynamic User Menu Dropdown**:
  - Refactored the raw plain-text login displays to a premium User Profile Pill showing user avatar initials.
  - Toggles a custom profile dropdown containing full user information and a red Logout button, along with automated click-outside closure.
  - Configured anchor scroll link `/#membership-section` to scroll directly down to the signup panel on the Homepage when guests click "เข้าสู่ระบบ".
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
