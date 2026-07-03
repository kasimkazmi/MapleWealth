# AI Context — Start Here

This is the persistent memory of MapleWealth for AI coding agents. Read this file first. It tells you which other file to open for the task in front of you — you should rarely need to read the full repo or the full `blueprint/` spec to make a safe change.

`blueprint/` is the original product spec (docs, db, api, prompts) written before implementation started. It is long-form and aspirational — some of it is already built, some isn't. The `.agent/` files here are the distilled, kept-current summary of what actually exists. When `.agent/` and `blueprint/` disagree, trust `.agent/` for "what's built" and `blueprint/` for "what was originally intended" — then update `.agent/` to close the gap.

## File map — read based on your task

| File | Read when you're... |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Adding a package/module, touching the DB schema, wiring a new integration, or need to know where something lives |
| [CONVENTIONS.md](CONVENTIONS.md) | Writing code — stack versions, styling rules, API contract shape, testing expectations |
| [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) | Touching anything financial — account types, contribution room math, goals, AI assistant behavior, terminology |
| [DECISIONS.md](DECISIONS.md) | Wondering "why is it built this way" or about to make a decision that reverses a prior one |

## Quick reference

| Thing | Value |
|---|---|
| API port | `3000` (NestJS, `apps/api`, override with `PORT` env var) |
| Web port | `3000` default Next.js dev port (`apps/web`, run separately from API — do not run both on 3000 simultaneously without changing one) |
| Postgres | `localhost:5435` → container `5432`, db `maplewealth`, via `docker-compose.yml` |
| Install | `npm install` at repo root (npm workspaces monorepo) |
| Run all dev | `npm run dev` (root) — runs `dev` in every workspace that has it |
| Run API only | `npm run start:dev --workspace=apps/api` |
| Run web only | `npm run dev --workspace=apps/web` |
| Build all | `npm run build` (root) |
| Test all | `npm run test` (root) — currently only `apps/api` has tests (Jest) |
| DB migrate | `npm run db:migrate --workspace=packages/db` (Prisma) |
| DB seed | `ts-node packages/db/prisma/seed.ts` (registered as the `prisma.seed` script in `packages/db/package.json`) |
| DB generate client | `npm run db:generate --workspace=packages/db` |

## Memory protocol

This system is best-effort, not enforced — but treat it as part of the job, not optional cleanup:

- If you add/remove a package, app, or top-level module boundary → update **ARCHITECTURE.md**.
- If you add/change a Prisma model, enum, or migration → update **ARCHITECTURE.md** (schema groups section).
- If you introduce a new stack dependency, styling pattern, or API contract convention → update **CONVENTIONS.md**.
- If you implement or change financial rules, pricing/monetization, or a background worker → update **BUSINESS_LOGIC.md**.
- If you make a structural or reversible-but-non-obvious decision (e.g. picking NestJS over Next route handlers, choosing npm workspaces over pnpm/turborepo) → add a row to **DECISIONS.md**.
- Keep entries short. This is a map, not documentation — link to real files (`src/...`, `blueprint/...`) rather than restating their contents.
