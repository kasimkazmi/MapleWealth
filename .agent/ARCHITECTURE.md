# Architecture

## Monorepo layout

npm workspaces (root `package.json`, no Turborepo/Nx yet — see [DECISIONS.md](DECISIONS.md)).

```
apps/
  api/    NestJS backend — REST API, business logic, workers (planned)
  web/    Next.js 16 frontend — App Router
packages/
  db/     Prisma schema, client, migrations, seed — shared by apps/api
blueprint/  Original product spec (docs/db/api/prompts) — long-form, not always current. See AI_CONTEXT.md for how to treat it.
docker-compose.yml   Local Postgres only
```

There is no shared `packages/ui`, `packages/types`, or `packages/config` yet — `apps/web` and `apps/api` do not currently share code beyond `@maplewealth/db`.

## apps/api (NestJS)

Entry: `apps/api/src/main.ts`, boots on `process.env.PORT ?? 3000`.

Feature modules under `apps/api/src/`, one directory per domain resource, each with `*.controller.ts` / `*.service.ts` / `*.module.ts`:
- `accounts/` — bank/investment account CRUD
- `transactions/` — transaction CRUD
- `profile/` — user financial profile (salary, expenses, targets)
- `prisma/` — `PrismaService`/`PrismaModule`, wraps `@maplewealth/db`'s Prisma client for DI into other modules
- `common/decorators`, `common/interceptors` — cross-cutting Nest primitives

Pattern for new resources: mirror `accounts/` (controller → service → module, module imported into `app.module.ts`).

## packages/db (Prisma)

`packages/db/prisma/schema.prisma` is the single source of truth for the data model. Postgres, UUID primary keys, snake_case columns via `@map`/`@@map`, money as `Decimal`, timestamps as `Timestamptz`.

Schema groups:
- **Identity**: `User`, `FinancialProfile` (1:1 — salary, take-home, expenses, savings capacity, target net worth)
- **Accounts & money movement**: `Account` (typed by `AccountType` enum: chequing/savings/tfsa/fhsa/rrsp/non_registered/credit_card/loan/cash, and `AccountPurpose`: emergency/vacation/investment/bills/general/home_down_payment), `Transaction`, `RecurringRule` (scheduled deposits/investments/bills/transfers)
- **Investing**: `Holding` (symbol/quantity/average cost/current price), `Contribution` (tracks TFSA/FHSA/RRSP room usage by `contributionYear`), `Dividend` (supports DRIP via `dripQuantity`)
- **Goals**: `Goal` (emergency_fund/vacation/net_worth/home/investment/custom, with target/current amount and priority)
- **Audit**: `AuditLog` (before/after JSON snapshots per entity — not yet wired into services)

All user-owned tables index `userId` and cascade-delete from `User`. Every model relation to `User` follows the same `userId` + `@relation(onDelete: Cascade)` shape — copy this when adding a model.

Build/scripts live in `packages/db/package.json`: `db:generate` (prisma generate), `db:migrate` (prisma migrate dev). Seed script is `packages/db/prisma/seed.ts`, wired via the `prisma.seed` field in `package.json`.

## apps/web (Next.js)

Next.js 16.2, React 19.2, App Router (`src/app/`). Currently scaffold-stage — only `layout.tsx` / `page.tsx` / `globals.css`, no data fetching or component structure established yet. No shared design-system package; Tailwind v4 via `@tailwindcss/postcss`.

## Data flow boundary

`apps/web` → HTTP → `apps/api` → Prisma (`@maplewealth/db`) → Postgres. `apps/web` does not talk to the database directly and does not depend on `@maplewealth/db`. No auth, caching, job queue, or storage layer is implemented yet, despite being named in `blueprint/`'s recommended stack (Better Auth, Redis, BullMQ/Trigger.dev, MinIO/S3) — treat those as future/planned, not present.

## Third-party integrations

None implemented yet. Local Postgres only, via `docker-compose.yml` (port `5435` on host → `5432` in container).
