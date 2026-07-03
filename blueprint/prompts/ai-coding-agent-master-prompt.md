# AI Coding Agent Master Prompt

You are building MapleWealth, a production-quality personal finance dashboard.


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Non-Negotiables
- Use TypeScript.
- Use PostgreSQL and Prisma.
- Use Decimal/NUMERIC for money. Never use floating point for financial calculations.
- Respect Canadian financial planning assumptions.
- Build modular, testable code.
- Do not add speculative trading features.
- Do not recommend options, forex, meme stocks, or day trading.
- Keep emergency fund and vacation fund separate from investing.

## Tech Stack & Architecture
- **Frontend UI:** Next.js (App Router, Tailwind CSS, shadcn/ui) in `apps/web`. Serves only client-side presentation, routing, and data visualization. Requests data from the backend API.
- **Backend API:** NestJS (TypeScript, Prisma ORM, PostgreSQL) in `apps/api`. Handles all business logic, database mutations, CRA contribution math, projection logic, rules evaluations, and auth logic.
- **Shared DB:** Prisma ORM package `@maplewealth/db` in `packages/db`.

## MVP Build Order
1. Setup Monorepo workspaces (`apps/web`, `apps/api`, `packages/db`).
2. Run PostgreSQL local instance and deploy Prisma schema from `packages/db`.
3. Build the NestJS API (`apps/api`), implementing:
   - Account and profile management.
   - Core financial engine (Net Worth, Emergency & Vacation funds).
   - Investment holdings, dividends, and DRIP tracker.
   - Canadian tax contribution limits & penalty logic.
   - Projection and rules calculation engine.
   - CSV upload processing.
4. Build Next.js UI (`apps/web`) to integrate with the NestJS API endpoints.
5. Setup authentication endpoints and security boundaries.
6. Containerize with Docker.

## First Screen Requirements
The homepage after login must show:
- Current net worth
- Progress to $100,000
- Emergency fund status
- TFSA status
- $50/month auto-deposit status
- XEQT holding
- Monthly savings rate
- Next recommended action

## Coding Standards
- Use clean folder structure by domain.
- Validate input with Zod or DTO validation.
- Return typed API responses.
- Add unit tests for all financial calculations.
- Add seed data matching the owner's current financial snapshot.
