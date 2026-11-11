---
name: nextjs-fullstack-product-architect
description: "Architect, design, and build production-ready Next.js 15+ applications. Unifies atomic design systems, WCAG 2.2 AAA accessibility, App Router, Server Components, TypeScript strict typing, and Tailwind CSS v4."
category: fullstack-design-engineering
risk: safe
source: personal
date_added: "2026-11-09"
tags:
  - nextjs
  - react
  - typescript
  - tailwindcss
  - ui-ux
  - accessibility
  - antigravity
---

# Next.js Fullstack Product Architect

## Purpose & Scope
Specialized workflow uniting enterprise-grade UI/UX engineering with modern full-stack Next.js production standards. Eliminates the boundary between interface design and server/client execution, producing accessible, high-performance dashboards and SaaS products ready for immediate deployment.

---

## Operating Protocol for Antigravity

Before generating any artifact, code, or visual mock:
1. **Define Architecture First:** Establish whether each module is a Server Component (RSC) for data fetching or a Client Component (`'use client'`) for user interactivity.
2. **Enforce Design Tokens via Tailwind:** Translate typography, spacing, and brand identity directly into strict Tailwind CSS utility patterns and variables.
3. **Mandate Accessibility (WCAG 2.2 AAA):** Include screen-reader labels (`aria-*`), semantic HTML, high-contrast states, and strict keyboard navigation patterns.
4. **Enforce Strict Typing:** Generate full TypeScript models and Zod schemas before wiring API routes or Server Actions.

---

## Workflow Phases

### Phase 1: UX/UI Blueprint & Design Tokenization
- Map user journeys and layout hierarchy using atomic design (Atoms -> Molecules -> Organisms).
- Define responsive grid systems (mobile, tablet, desktop, ultra-wide) with density controls.
- Establish semantic color tokens with a minimum contrast ratio of 7:1 for critical text (AAA standard).
- Architect micro-interactions, skeleton loaders, and zero-data empty states.

### Phase 2: Next.js App Router Architecture
- Scaffold using modern Next.js folder conventions:
  - `app/(dashboard)/layout.tsx` for shared layouts and shell persistence.
  - `app/(dashboard)/page.tsx` for core dashboard feeds (RSC by default).
  - Parallel (`@modal`, `@analytics`) and intercepting routes for contextual panels.
  - Dynamic data handling with `React.Suspense` boundaries around slow I/O.

### Phase 3: Component Engineering & State Management
- Build reusable UI atoms using Tailwind CSS and Radix/Headless primitives:
  - Data tables with sorting, filtering, and pagination.
  - Interactive KPI cards with sparklines and delta indicators.
  - Multi-series performance charts optimized for responsive containers.
- State partitioning:
  - Server state via Server Components and TanStack Query/SWR.
  - Global client UI state via Zustand (modals, active filters, sidebar collapsed state).
  - Form state via React Hook Form integrated with Zod validation.

### Phase 4: Data Fetching, Mutations & Security
- Implement Next.js Server Actions with Zod input validation and rate limiting.
- Secure API routes with strict role-based access control (RBAC).
- Implement optimistic UI updates for instant feedback during network calls.

### Phase 5: Verification & Quality Gates
- Verify strict TypeScript compilation (`tsc --noEmit`).
- Validate accessibility via automated axe-core/Playwright audits.
- Core Web Vitals checks: LCP < 1.2s, CLS = 0, INP < 100ms.
- Bundle analysis to prevent client-side bloat (eliminate heavy libraries from client chunks).

---

## Production Stack Standards

| Layer | Standard |
| :--- | :--- |
| **Framework** | Next.js (App Router, Server Components, Server Actions) |
| **Language** | TypeScript (Strict mode enabled, zero `any`) |
| **Styling** | Tailwind CSS (Design tokens, CSS variables, dark mode native) |
| **Primitives** | Radix UI / Headless UI (ARIA-compliant logic) |
| **Data & Forms** | Zod schemas, React Hook Form |
| **Client State** | Zustand |
| **Icons** | Lucide React |

---

## Execution Directives for Antigravity Prompts

When invoked in Google Antigravity:
1. **Never write throwaway dummy mockups:** Code must be modular, strongly typed, and structured inside proper files (`components/ui/*`, `lib/validations/*`, `app/*`).
2. **Never skip edge states:** Every view must define loading states (`loading.tsx` / skeletons), error boundaries (`error.tsx`), and zero-record fallbacks.
3. **Explicit Component Tagging:** Annotate whether code runs on the server or client, and specify design token alignment in comments.