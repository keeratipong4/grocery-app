---
version: alpha
name: Farmart-design-system
description: A light-first fresh-market e-commerce design language built for a Thai online grocery store. Warm amber primary on a clean white canvas signals freshness and trustworthiness. A persistent green CTA system — amber for navigation, green-600 for every purchase action — trains users to spot buying moments instantly. Two-row sticky navigation, horizontal-scroll product rows, and a slide-in cart drawer keep the shopping loop fast. Mobile-first with generous whitespace; product photography and category emoji icons do the visual heavy lifting.

colors:
  primary: "#F4B223"
  primary-hover: "#D89A0D"
  cta-green: "#16a34a"
  cta-green-hover: "#15803d"
  success: "#3BAE5A"
  danger: "#E64C3C"
  border: "#E8E8E8"
  surface: "#F8F8F8"
  muted: "#FAFAFA"
  text-secondary: "#666666"
  ink: "#222222"
  canvas: "#ffffff"
  canvas-dark: "#111827"

typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: 0
  heading-xl:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  heading-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  price-current:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  price-original:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.05em
  nav-link:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0

rounded:
  sm: 6px
  card: 10px
  banner: 12px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 64px
  container-x: 24px

components:
  button-add-to-cart:
    backgroundColor: "{colors.cta-green}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 6px 16px
  button-add-to-cart-hover:
    backgroundColor: "{colors.cta-green-hover}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 6px 16px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-checkout:
    backgroundColor: "{colors.cta-green}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 12px 24px
  button-membership-submit:
    backgroundColor: "{colors.cta-green}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 24px
  search-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 0px 16px
  membership-input:
    backgroundColor: "rgba(255,255,255,0.10)"
    textColor: "{colors.canvas}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 0px 16px
  product-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.card}"
    padding: 12px
  category-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.banner}"
    padding: 16px
  brand-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.card}"
    padding: 16px
  hero-banner-main:
    backgroundColor: "linear-gradient(to bottom-right, #dcfce7, #bbf7d0, #86efac)"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.banner}"
    padding: 48px 40px
  hero-banner-promo:
    backgroundColor: "linear-gradient(to bottom-right, #fef9c3, #fde68a)"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.banner}"
    padding: 24px
  discount-badge:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  new-badge:
    backgroundColor: "{colors.success}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  cart-count-badge:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 0px
  eyebrow-tag:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  membership-panel:
    backgroundColor: "linear-gradient(to bottom, #14532d, #166534)"
    textColor: "{colors.canvas}"
    typography: "{typography.body-md}"
    rounded: "{rounded.banner}"
    padding: 28px
  nav-topbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: 0px
    padding: 0px 24px
  nav-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: 0px
    padding: 0px 24px
  cart-drawer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: 0px
    padding: 20px
  footer:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "#d1d5db"
    typography: "{typography.body-sm}"
    rounded: 0px
    padding: 64px 24px
---

## Overview

Farmart is a light-first grocery e-commerce UI. The canvas is pure white with `{colors.muted}` section alternation — no dark surfaces except the footer. The dominant accent is `{colors.primary}` amber-gold, used for navigation, the search CTA, the logo mark, and the category browse button. A completely separate green system — `{colors.cta-green}` (`#16a34a` / Tailwind `green-600`) — handles every purchase action: Add to Cart, Checkout, hero shop CTA, and membership submit. This color split means users can instantly distinguish browse interactions (amber) from buying interactions (green).

Product photography is the primary visual content. Emoji icons give the category and hero sections personality without requiring illustration assets. Cards have subtle lift shadows and a `−1px` Y translate on hover to signal interactivity without animation overhead.

**Key Characteristics:**
- Single light canvas (`{colors.canvas}` white) with `{colors.muted}` alternation — never grey sections outside the footer.
- Two distinct action colors: `{colors.primary}` amber for navigation/browse, `{colors.cta-green}` green for all purchase CTAs. Never swap them.
- `{rounded.card}` (10px) on product cards, `{rounded.banner}` (12px) on hero panels and the membership sidebar — no other shape variants for cards.
- `{rounded.full}` (pill) exclusively for badges: discount, new, cart count, eyebrow tags.
- Two-row sticky header: topbar 80px (logo + search + cart) over nav row 52px (category button + links).
- Cart drawer slides in from the right at 380px wide; backdrop is `bg-black/40`.
- Horizontal-scroll `.scroll-row` for Best Seller and Just Landing sections — no pagination.
- Membership sidebar is always dark green gradient regardless of surrounding section background.
- All prices in Thai Baht: always render through `formatPrice()` — never raw numbers.

## Colors

> **Source files:** `tailwind.config.ts`, `src/app/globals.css`, component Tailwind classes.

### Primary & CTA
- **Primary** (`{colors.primary}` — `#F4B223`): Amber-gold. Logo circle, search submit button, "Category" browse button, all non-purchase primary buttons, hover link color, section "View all" link.
- **Primary Hover** (`{colors.primary-hover}` — `#D89A0D`): Darker amber. Hover state for all primary buttons.
- **CTA Green** (`{colors.cta-green}` — `#16a34a`): The purchase color. All "Add to Cart" buttons, Checkout button, hero "Shop Now" CTA, membership form submit. This is Tailwind `green-600`.
- **CTA Green Hover** (`{colors.cta-green-hover}` — `#15803d`): Tailwind `green-700`. Hover state for all purchase CTAs.

### Status
- **Success** (`{colors.success}` — `#3BAE5A`): Member discount line text in CartDrawer, "New" badge background, hero sale text accent. Do not use for buttons — that role belongs to `{colors.cta-green}`.
- **Danger** (`{colors.danger}` — `#E64C3C`): Cart count badge, DiscountBadge, "Hot Deal" nav link, "Hot Deal" promo badge.

### Surface & Structure
- **Canvas** (`{colors.canvas}` — `#ffffff`): Page background, all card backgrounds.
- **Surface** (`{colors.surface}` — `#F8F8F8`): Image placeholder fills, hover state of interactive buttons/links, HeroBanner section wrapper.
- **Muted** (`{colors.muted}` — `#FAFAFA`): Alternating section background — Featured Brands, Best Seller.
- **Border** (`{colors.border}` — `#E8E8E8`): All card borders, input borders, nav dividers.
- **Canvas Dark** (`{colors.canvas-dark}` — `#111827`): Footer background only.

### Text
- **Ink** (`{colors.ink}` — `#222222`): Primary body text.
- **Text Secondary** (`{colors.text-secondary}` — `#666666`): Category labels on ProductCard, review counts, price-per-unit in CartDrawer, subtitle text.

## Typography

### Font Family

**Inter** (loaded via `next/font/google`, CSS variable `--font-inter`). Fallback: `system-ui, sans-serif`. A single-family system — Inter covers every role from 11px labels to 36px display. No separate display face.

The font loads as a variable font subset for Latin; for Thai characters the browser falls back to system-ui, which is intentional.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display}` | 36px (md: 48px) | 700 | 1.15 | 0 | HeroBanner h1 |
| `{typography.heading-xl}` | 20px | 700 | 1.3 | 0 | SectionHeader h2 |
| `{typography.heading-md}` | 16px | 700 | 1.3 | 0 | BrandCard h3, PromoCard h3 |
| `{typography.price-current}` | 16px | 700 | 1.2 | 0 | Current price in ProductCard / CartDrawer total |
| `{typography.body-md}` | 14px | 500 | 1.5 | 0 | Product names, nav links, cart item names |
| `{typography.nav-link}` | 14px | 500 | 1.0 | 0 | Navbar navigation links |
| `{typography.button}` | 14px | 600 | 1.0 | 0 | All button labels |
| `{typography.body-sm}` | 12px | 400 | 1.4 | 0 | BrandCard subtitle, badge labels, fine print |
| `{typography.price-original}` | 12px | 400 | 1.2 | 0 | Strikethrough original price — only when `discount > 0` |
| `{typography.label}` | 11px | 400 | 1.3 | 0.05em | Category labels (uppercase), review counts |

### Principles
- **Uppercase only for category labels.** Only `{typography.label}` text (11px) gets `uppercase tracking-wide`. No other tier uses uppercase.
- **Original price only when there is a discount.** The strikethrough `{typography.price-original}` renders only when `product.discount > 0`. Never render it for zero-discount products.
- **Display scales at breakpoints.** Hero h1 is `text-3xl` (30px) at mobile, `md:text-4xl` (36px) and up. Use responsive prefixes rather than fixed sizes for display text.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.section}` 64px · `{spacing.container-x}` 24px.
- **Section vertical rhythm:** `py-16` (64px) on all homepage sections — consistent without exception.
- **Card inner padding:** `p-3` (12px) for ProductCard body; `p-4` (16px) for BrandCard, CategoryCard; `p-7` (28px) for MembershipPanel.

### Grid & Container
- **Max container width:** `max-w-[1280px] mx-auto px-6` — every section including footer uses this wrapper.
- **Category grid:** `grid-cols-4 md:grid-cols-8 gap-4` — collapses to 4-col on mobile.
- **Brand grid:** `grid-cols-2 md:grid-cols-4 gap-6`.
- **Top Saver grid:** `grid-cols-1 lg:grid-cols-[1fr_300px] gap-8` — product grid left, MembershipPanel (300px fixed) right.
- **Product grid inside Top Saver:** `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5`.
- **Hero layout:** `grid-cols-1 lg:grid-cols-[70fr_30fr] gap-6` — main banner 70%, two stacked promo banners 30%.

### Whitespace Philosophy
Every section breathes with `py-16` vertical padding. Cards inside grids are separated by `gap-4` to `gap-6`. White space is the separator — no decorative dividers between sections, only background color alternation. HeroBanner uses `bg-surface` (#F8F8F8) as its outer wrapper, giving it a subtle lift from the white page without a border.

## Elevation & Depth

| Level | Value | Use |
|---|---|---|
| 0 | No shadow | Default flat state — nav rows, footer |
| 1 | `0 2px 8px rgba(0,0,0,.08)` (`shadow-card`) | ProductCard, BrandCard resting state; Navbar `shadow-card` |
| 2 | `0 8px 24px rgba(0,0,0,.12)` (`shadow-md`) | ProductCard and BrandCard hover state |
| Overlay | `bg-black/40` | CartDrawer backdrop |

Cards transition from Level 1 to Level 2 on hover alongside `hover:-translate-y-1` — a combined shadow lift and Y offset that signals the card is interactive. No other animation occurs (no transitions on color, opacity, or scale except product image which does `group-hover:scale-105` inside the image container).

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 6px | All buttons, form inputs, search bar, qty stepper borders |
| `{rounded.card}` | 10px | ProductCard, BrandCard |
| `{rounded.banner}` | 12px | HeroBanner panels, CategoryCard, MembershipPanel, CartDrawer images |
| `{rounded.full}` | 9999px | Logo circle, DiscountBadge, New badge, Cart count badge, eyebrow tags |

### Image Geometry
Product images use `aspect-[4/3]` with `object-cover` and `next/image` fill. The image container is `relative overflow-hidden` with `bg-surface` as placeholder fill. On hover, the image scales to `group-hover:scale-105` with `transition-transform duration-300`. Category icons in HeroBanner use `text-[160px] opacity-20` decorative emoji positioned `absolute right-10 bottom-0` — large, faded, aria-hidden.

## Components

### Buttons

**`button-primary`** — amber navigation button.
- Background `{colors.primary}`, text `{colors.canvas}`, `{typography.button}`, padding 8px 16px, `{rounded.sm}`.
- Used for: search submit, "Category" nav button, cart button (pre-items).
- Hover: `{colors.primary-hover}`.

**`button-add-to-cart`** — the purchase CTA on ProductCard.
- Background `{colors.cta-green}` (`green-600`), text `{colors.canvas}`, `{typography.button}`, padding 6px full-width, `{rounded.sm}`.
- Label: `+ Add to Cart`. Must be `bg-green-600 hover:bg-green-700` — the class is hardcoded, not the custom token, because `green-600` is Tailwind's built-in shade.
- Hover: `{colors.cta-green-hover}`.

**`button-checkout`** — full-width CTA at the bottom of CartDrawer.
- Background `{colors.cta-green}`, text `{colors.canvas}`, `{typography.button}`, padding 12px 24px, `{rounded.sm}`, `block w-full text-center`.

**`button-membership-submit`** — inside MembershipPanel on a dark background.
- Background `{colors.cta-green}`, text `{colors.canvas}`, same geometry as `button-add-to-cart`.

### Badges

**`discount-badge`** — rendered by `DiscountBadge` (`src/components/DiscountBadge.tsx`), only when `discount > 0`.
- Background `{colors.danger}`, text `{colors.canvas}`, `{typography.body-sm}` font-bold, `{rounded.full}`, padding 2px 8px.
- Position: `absolute top-2 left-2` inside the product image container.
- Label: `-{discount}%`.

**`new-badge`** — rendered by `NewBadge` (`src/components/NewBadge.tsx`) when `isNew === true && discount === 0`.
- Background `{colors.success}`, text `{colors.canvas}`, `{typography.body-sm}` font-bold, `{rounded.full}`.
- Position: `absolute top-2 left-2`. Mutually exclusive with `discount-badge` — discount takes priority.

**`cart-count-badge`** — on the Navbar cart button.
- Background `{colors.danger}`, text `{colors.canvas}`, `{typography.label}` font-bold, `{rounded.full}`, `w-4 h-4`.
- Position: `absolute -top-1.5 -right-1.5` on the cart button.
- Renders only when `totalItems() > 0`.

**`eyebrow-tag`** — small pill label above headlines.
- Background `{colors.primary}`, text `{colors.canvas}`, `{typography.body-sm}` font-bold, `{rounded.full}`, padding 4px 12px.
- Used in: HeroBanner hero band, MembershipPanel header.

### Cards

**`product-card`** — `w-[220px] flex-shrink-0`.
- Background `{colors.canvas}`, border `1px {colors.border}`, `{rounded.card}`, `shadow-card`.
- Inner structure (top → bottom): `aspect-[4/3]` image · DiscountBadge / New badge · category label (`{typography.label}` uppercase) · product name (`{typography.body-md} line-clamp-2`) · price row · star rating · `button-add-to-cart`.
- Hover: `shadow-md -translate-y-1`.

**`category-card`** — `flex flex-col items-center gap-2 p-4 min-h-[120px]`.
- Background `{colors.canvas}`, border `1px {colors.border}`, `{rounded.banner}`.
- Contains: `w-14 h-14 rounded-full` icon circle (inline `style={{ background: category.color }}`), category name `{typography.body-md} font-medium`.
- Hover: `border-primary shadow-card -translate-y-0.5`.
- The pastel circle background color is data-driven from `category.color` (inline style, not a Tailwind class).

**`brand-card`** — standard card with gradient image top.
- Background `{colors.canvas}`, border `1px {colors.border}`, `{rounded.card}`, overflow-hidden.
- Top: `aspect-[4/3] bg-gradient-to-br {brand.gradient}` with centered emoji logo + brand name.
- Body `p-4`: brand name `{typography.heading-md} font-semibold` + subtitle `{typography.body-sm} text-text-secondary`.
- Hover: `shadow-md -translate-y-1`.

### Navigation

**`nav-topbar`** — `sticky top-0 z-30 bg-canvas h-20 border-b border-border shadow-card`.
Left → right: logo mark → search bar (flex-1, max-w-600px) → hotline (hidden below `lg:`) → login icon → cart button.

**`nav-row`** — `bg-canvas h-[52px] border-b border-border`.
Left → right: "Category" button (`button-primary`) → nav links → mobile hamburger toggle.
- "Hot Deal" link uses `text-danger` to stand out from standard `text-gray-800` links.

### Panels & Overlays

**`membership-panel`** — `MembershipPanel` (`src/components/MembershipPanel.tsx`). Dark green gradient sidebar.
- `bg-gradient-to-b from-green-900 to-green-800`, `{rounded.banner}`, padding `p-7`, text white.
- Logged-out: eyebrow tag + headline + body copy + form (email + password) + submit + TOS fine print.
- Logged-in: switches to confirmation state showing email and 15% discount confirmation.
- Inputs use `bg-white/10 border border-white/20 h-[42px] rounded-sm focus:border-primary`.

**`cart-drawer`** — slide-in panel.
- `fixed top-0 right-0 bottom-0 w-[380px] max-w-full bg-canvas z-50 flex flex-col`.
- Opens/closes via `translate-x-0` / `translate-x-full` CSS transition.
- Backdrop: `fixed inset-0 bg-black/40 z-40` — click dismisses.
- Member discount row (`text-success`) renders only when `discountRate() > 0`.
- Grand total: `text-xl font-bold`.

### Footer

**`footer`** — `bg-canvas-dark text-gray-300`.
4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`): brand column · Company links · Help links · Shopping links.
Bottom bar: copyright left · payment badges right (VISA · MC · PayPal · PromptPay as `bg-white/10 text-gray-300 text-xs font-bold px-2 py-1 rounded` chips).

## Do's and Don'ts

### Do
- Use `{colors.cta-green}` (`bg-green-600`) for every purchase action: Add to Cart, Checkout, hero shop CTA, membership submit. Never use `{colors.primary}` amber for these.
- Use `{colors.primary}` for every navigation / browse action: search submit, category button, cart button, "View all" links. Never use green for these.
- Render `DiscountBadge` only when `product.discount > 0`. Guard all discount-conditional UI with this check.
- Render the "New" badge only when `isNew === true && discount === 0`. Discount takes visual priority.
- Always format prices with `formatPrice()` from `src/lib/utils.ts`. Never use `.toFixed()`, `.toLocaleString()`, or manual THB formatting inline.
- Always apply `calcDiscountedPrice()` before passing a price to `CartItem` or rendering the final price.
- Keep sections alternating `bg-white` / `bg-muted` in order. Never use grey or colored section backgrounds except the footer.
- Use `{rounded.card}` on ProductCard and BrandCard; use `{rounded.banner}` on HeroBanner panels, CategoryCard, and MembershipPanel. Do not mix them.
- Test every new component at 375px viewport width before marking a task complete.

### Don't
- Don't install UI libraries (shadcn, MUI, Chakra, etc.) — Tailwind only.
- Don't add inline styles except for `category.color` on CategoryCard icon circles (data-driven, no static alternative).
- Don't hardcode product or category data inside components — always import from `src/data/`.
- Don't use `any` in TypeScript — strict mode is on. Fix the type.
- Don't hold cart items in React `useState` — Zustand only via `useCartStore`.
- Don't read from Zustand stores in Server Components — only in `"use client"` components.
- Don't remove focus outlines without a replacement — inputs use `focus:outline-none focus:border-primary`.
- Don't render the strikethrough original price when `product.discount === 0`.
- Don't use `bg-success` (`#3BAE5A`) for purchase buttons — that token is for status text and the New badge only.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile (default) | < 640px | Single-column everything; CategoryCard 4-col; hero stacked; cart text hidden; login text hidden |
| `sm:` | 640px | Cart button shows price; login text shows; product grid 3-col; promo banners go side-by-side |
| `md:` | 768px | Desktop nav links visible; hamburger hidden; brand grid 4-col; CategoryCard 8-col |
| `lg:` | 1024px | Hotline visible; hero splits 70/30; Top Saver adds 300px sidebar |
| `xl:` | 1280px | Product grid inside Top Saver expands to 4-col |

### Touch Targets
- All buttons have a minimum height of 36px (`h-9`) to `44px` via padding. Cart button (`py-2`) + icon hits ~40px.
- Qty steppers in CartDrawer are `w-6 h-6` (24px) — smaller than ideal; do not reduce further.
- Category cards have `min-h-[120px]` — comfortably tappable.

### Collapsing Strategy
- The two-row Navbar stays sticky at all viewports. The category links row hides on mobile and is replaced by a full-width dropdown triggered by the hamburger icon.
- HeroBanner main panel and promo panels stack `grid-cols-1` on mobile; promo panels go `flex-row` on mobile (side by side), then `flex-col` inside the 30% column at `lg:`.
- MembershipPanel disappears from the Top Saver layout on mobile (`lg:grid-cols-[1fr_300px]` collapses to single column).
- ProductRow horizontal scroll persists at all viewports — cards are `w-[220px] flex-shrink-0`, scroll is touch-friendly.
- Footer goes from 1-col on mobile to 4-col at `lg:`.

## Iteration Guide

1. For any new purchase-action button: use `bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md`. Never amber.
2. For any new navigation or browse-action button: use `bg-primary hover:bg-primary-hover text-white font-semibold rounded-md`.
3. New cards follow `{rounded.card}` 10px for product/content cards and `{rounded.banner}` 12px for banner/panel cards.
4. Reference component tokens directly: `{colors.primary}`, `{rounded.banner}`, `{typography.body-md}`.
5. All new sections go inside `<section className="py-16 bg-white">` or `bg-muted` alternating, wrapped in `<div className="max-w-[1280px] mx-auto px-6">`.
6. New badges are always `{rounded.full}` pills — never `{rounded.sm}` or `{rounded.card}`.
7. After any UI change: `npm run build && npm run lint` must both pass with zero errors before marking the task done.
8. Open the changed page in a real browser at localhost:3000 and verify at 375px viewport.
