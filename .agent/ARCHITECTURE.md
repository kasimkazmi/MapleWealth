# Architecture

## Monorepo layout

npm workspaces (root `package.json`, no Turborepo/Nx yet — see [DECISIONS.md](DECISIONS.md)).

```
apps/
  web/    Next.js 16 full-stack app — App Router frontend + API route handlers (formerly apps/api, now merged in)
packages/
  db/     Prisma schema, client, migrations, seed — shared by apps/web
blueprint/  Original product spec (docs/db/api/prompts) — long-form, not always current. See AI_CONTEXT.md for how to treat it.
docker-compose.yml   Local Postgres only
```

`apps/api` (NestJS) has been merged into `apps/web` and deleted. All 14 former Nest modules (accounts, auth, transactions, investments, contributions, dividends, goals, imports, investment-policy, profile, projections, reports, rules, users) now live as framework-agnostic functions under `apps/web/src/server/services/*.ts`, called from thin `apps/web/src/app/api/**/route.ts` handlers. Business logic, Prisma queries, and constants were ported verbatim — no behavior changes.

## apps/web (Next.js, full-stack)

- `src/app/api/**/route.ts` — API route handlers, one file per URL path, mirroring the old NestJS controller routes exactly (same paths/methods/status codes).
- `src/server/services/*.ts` — ported business logic (`(prisma, userId, ...) => data` functions), one file per former Nest module.
- `src/server/auth.ts` — Better Auth config (Prisma adapter mapped onto the existing `User`/`Session`/`AuthAccount`/`Verification` models).
- `src/server/request-context.ts` — `requireUser()` (replaces `UserInterceptor`/`@CurrentUser()`) + correlation-id/structured logging (replaces `LoggingInterceptor`).
- `src/lib/prisma.ts` — singleton `PrismaClient` (dev-hot-reload-safe).
- `src/lib/auth-client.ts` — Better Auth React client (`signIn`/`signUp`/`signOut`/`useSession`).
- `middleware.ts` (repo root of `apps/web`) — in-memory 60 req/60s rate limiter per IP, mirrors the old `ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])`.

Pattern for new resources: add a service function in `src/server/services/`, then a thin `route.ts` under `src/app/api/` that calls `requireUser(req)` and the service function.

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

## Data flow boundary

`apps/web`'s client components call same-origin relative `/api/...` paths (via `src/lib/api.ts`'s `apiFetch`), which are handled by `src/app/api/**/route.ts` in the same process, which call `src/server/services/*.ts`, which use Prisma (`@maplewealth/db`) directly against Postgres. There is no separate backend process anymore. Auth is Better Auth (cookie-based session, `src/server/auth.ts`). Caching, job queue, and storage layers (Redis, BullMQ/Trigger.dev, MinIO/S3) named in `blueprint/`'s recommended stack are still not implemented — treat those as future/planned, not present.

## Third-party integrations

None implemented yet. Local Postgres only, via `docker-compose.yml` (port `5435` on host → `5432` in container).
