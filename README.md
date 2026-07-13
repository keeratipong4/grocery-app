# 🛒 Farmart — Premium Online Grocery Store

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/SQLite%20%2F%20PostgreSQL-Dual--DB-blue?style=flat-square&logo=sqlite)](https://neon.tech/)
[![Testing](https://img.shields.io/badge/Node.js%20Test-140%2B%20Tests-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

**Farmart** is a high-performance, modern online grocery and supermarket e-commerce platform built to demonstrate advanced full-stack capabilities, strict type safety, robust test coverage, and a pioneering **Human-AI Agentic Co-Development** workflow.

The application allows users to search, filter, and buy groceries (vegetables, fruits, meat, dairy, beverages, etc.) seamlessly, using a persistent optimistic cart sync and membership discount rules.

---

## 🚀 Live Demo & Deployment
- **Live Application:** [Farmart on Vercel](https://grocery-app-seven-phi.vercel.app/)
- **Database:** Serverless cloud PostgreSQL hosted on Neon DB.

---

## 🌟 Key Features & User Workflows

### 1. Catalog & Interactive Search
* **Dynamic Homepage:** Features premium interactive hero banners, popular product recommendations, and trending category highlights.
* **Category Pages (`/category/[slug]`):** Organizes items (e.g., vegetables, fruits, meat) with sorting options (by price, rating, or discounts).
* **Advanced Search Page (`/search`):** Query-based instant search coupled with a sidebar filtering system for new arrivals, discounted items, and category filters.

### 2. Session-Aware Shopping Cart
* **Optimistic Local Cache:** Zustand-backed cart updates instantly on the client side for zero-latency user experience.
* **Seamless Guest-to-Member Cart Merging:** Unauthenticated guests can add items to their cart. Upon login/registration, their guest session cart automatically merges into their database-backed member cart.
* **Cart Badge Logic:** The Navbar cart badge dynamically tracks the count of distinct products (unique items) in the cart.

### 3. Authentication & Membership Benefits
* **Secure Session Cookie Authentication:** A lightweight, cookie-based session token (`farmart-session`) secure backend routes.
* **Membership Discount Engine:** Logged-in users can opt-in to a premium membership to receive an automatic 15% discount on all purchases, calculating totals in real-time.
* **Order History & Profiles:** Users can update their profile information (email/password) and view details of all previous orders.

### 4. Secure Checkout & Order Management
* **Address Pre-Population:** Saves and pre-fills the shipping address form using the user's most recent order to optimize the checkout funnel.
* **Strict Ownership Check:** Order detail routes (`/orders/[id]`) enforce severe security checks so users can only view invoices that belong to their account.
* **Multiple Payment Support:** Integrated logic for Cash on Delivery (COD), PromptPay, and Credit Cards.

---

## 🏗️ Architectural & Technical Highlights

### ⚡ Next.js 16 App Router & React 19
The codebase uses Next.js 16 and React 19, taking advantage of the latest web standards:
* **Async Page & Route parameters:** Adheres to Next.js 16 breaking changes where `params`, `searchParams`, and `cookies()` must be dynamically `await`-ed.
* **React Server Components (RSC):** Defaulting to server components for faster page load, better SEO, and direct database queries via Prisma, while using client components only for stateful interactions (Zustand stores, toggles).

### 🔄 Dual-Database Design (SQLite + PostgreSQL)
To maintain velocity and ease of local development while deploying to serverless environments:
* **Local Development & Testing:** Runs on **SQLite** (`better-sqlite3` native C++ driver) for lightweight, zero-dependency local runs and ultra-fast integration testing.
* **Production Deployment:** Automatically switches to **PostgreSQL (Neon DB)** on Vercel.
* **How it works:** 
  1. A custom build-time script ([prepare-prod-db.js](scripts/prepare-prod-db.js)) automatically transforms database providers in `prisma/schema.prisma` from SQLite to PostgreSQL before compiling on Vercel.
  2. The database singleton client ([prisma.ts](src/lib/prisma.ts)) dynamically checks the environment variables: if a Postgres protocol is present, it uses `@prisma/adapter-pg` to avoid native compilation issues on Serverless nodes.

### 🧪 Robust Unit & Integration Test Suite
Quality is ensured via a test-driven development approach using the native Node.js test runner:
* **Coverage:** Maintains high coverage across both unit and integration tests.
* **Database Isolation:** Integration tests run on an isolated SQLite database (`prisma/test.db`), preventing development pollution.
* **Test Suites:**
  * **Unit Tests:** Utilities (price formatting, discounts), API helpers, and server-store helpers.
  * **Integration Tests:** Authentication endpoints, cart actions, checkout transaction pipelines, product retrieval, and order query permissions.

---

## 🤖 Co-Development with AI Coding Agents (Agentic Coding)
A standout aspect of this project is that it was co-developed using **Agentic Coding** principles. Instead of using AI as a simple autocomplete tool, the repository was built in continuous collaboration with **autonomous AI Coding Agents** (such as Google DeepMind's Antigravity).

### How the Human-Agent Collaboration Works:
* **Context Anchoring (`AGENTS.md`):** This repository includes a central instructions file ([AGENTS.md](AGENTS.md)) that AI agents read at startup. It specifies architecture schemas, coding guidelines (e.g. strict TypeScript, no `any`, React 19 conventions), and repository rules.
* **Automated Guardrails & Branch Strategy:**
  * AI agents are strictly prohibited from writing code directly to `main` or `develop`.
  * The agent programmatically checks the current branch, creates a dedicated `feature/<name>` branch from `develop`, writes code, writes matching unit tests, runs full builds, and executes type-checks (`npm run type-check`) and linting (`npm run lint`).
  * Changes are only merged into the integration branch once all checks pass.
* **Architecture Decision Records (`DECISIONS.md`):** Major technical decisions (e.g., migrating Next.js versions, switching databases compile-time, or restructuring the lint configuration) are logged in [DECISIONS.md](DECISIONS.md) to keep both human and agent developers aligned.
* **Progress Tracking (`CHANGELOG.md`):** Each completed task is documented in a detailed, date-based changelog to ensure historical tracebility.

This workflow guarantees clean commit histories, prevents codebase deterioration, and showcases the developer's capability in **orchestrating and directing agentic workflows in software engineering teams**.

---

## 🛠️ Getting Started & Commands

### Prerequisites
* Node.js v20+
* npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/grocery-app.git
   cd grocery-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Database Initialization (SQLite)
Run migrations to set up your local database (`prisma/dev.db`) and seed it with categories, brands, and products:
```bash
# Apply Prisma migrations
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### Running Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running Tests
Execute the test runner suite:
```bash
# Run all tests (unit + integration)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests and generate coverage report
npm run test:coverage
```

### Linting & Type-Checking
Verify code style and type safety before committing:
```bash
# TypeScript type checking
npm run type-check

# ESLint checking (v9 Flat Config)
npm run lint
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
