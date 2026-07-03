# Conventions

## Stack versions (as installed — check `package.json` before assuming otherwise)

| Package | Version |
|---|---|
| Next.js (`apps/web`) | 16.2.10 |
| React / React DOM | 19.2.4 |
| Tailwind CSS | v4 (via `@tailwindcss/postcss`, no `tailwind.config.js` — CSS-first config) |
| NestJS (`apps/api`) | 11.x |
| Prisma / `@prisma/client` | 6.x |
| TypeScript | 5.x across all workspaces |
| Node package manager | npm (workspaces), not pnpm/yarn |

**Next.js 16 + React 19 warning**: these are newer than most model training data and have breaking changes vs. older Next.js conventions (routing, caching, Server Actions, etc.). Before writing App Router code, check `apps/web/node_modules/next/dist/docs/` for current APIs rather than assuming Next.js 13/14 patterns. (This warning previously lived in `apps/web/AGENTS.md` — kept in place there for tools that specifically look for `AGENTS.md`; duplicated here so it isn't missed.)

## Styling

Tailwind v4, utility-first. No component library (shadcn/ui) installed yet despite being named in `blueprint/03-architecture.md` — if you add shadcn/ui, update this file and [ARCHITECTURE.md](ARCHITECTURE.md). No animation library chosen yet. Full design-system intent (colors, typography, spacing scale) is documented in `blueprint/docs/06-ui-ux-design-system.md` but not yet implemented in code — treat that doc as a target, not current state.

## API contract structure (apps/api)

NestJS REST controllers, one module per domain resource (see [ARCHITECTURE.md](ARCHITECTURE.md)). No DTOs/validation pipes or global exception filter observed yet in `accounts`/`transactions`/`profile` — if you add input validation, use `class-validator`/`class-transformer` DTOs (the NestJS-idiomatic choice) and note the pattern here once established. No OpenAPI/Swagger setup yet. `blueprint/api/01-api-spec.md` describes the intended full API surface — check it before designing new endpoints so naming stays consistent with the rest of the planned API.

## Testing

`apps/api` uses Jest (`*.spec.ts` colocated with source, e.g. `app.controller.spec.ts`), plus a separate e2e Jest config (`apps/api/test/jest-e2e.json`). Run via `npm run test` / `npm run test:e2e` in that workspace. `apps/web` and `packages/db` have no test setup yet. `blueprint/docs/11-testing-strategy.md` describes the intended broader strategy (currently aspirational, not implemented).

## General

- Prisma schema uses snake_case DB columns (`@map`) with camelCase Prisma fields — keep this mapping consistent for new fields/models.
- Money fields are always `Decimal`, never `Float` — see [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) for why this matters (ACB/tax math must not lose precision).
