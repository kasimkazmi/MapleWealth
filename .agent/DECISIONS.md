# Decisions

Light ADR log. Add a row when you make a structural or non-obvious call — enough for a future agent to know *why*, not a full ADR document.

| Date | Decision | Why | Status |
|---|---|---|---|
| 2026-07-03 | Created `.agent/` in-repo AI context system, consolidating agent-facing docs | `blueprint/` is a large pre-implementation spec; agents need a small, current, distilled map of what's actually built vs. planned so they don't have to read the whole repo or the whole spec | Active |
| — | npm workspaces monorepo (no Turborepo/Nx) | Simplicity for current 2-app + 1-package size; `blueprint/03-architecture.md` did not mandate a specific monorepo tool | Active — revisit if build times or task orchestration become a problem |
| — | NestJS chosen for `apps/api` over Next.js route handlers | `blueprint/README` names NestJS as preferred for SaaS scale, Next.js route handlers as MVP-only fallback | Active |
| — | Prisma models use `Decimal` for all money fields, never `Float` | Non-registered account ACB/capital-gains math (see [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)) requires exact decimal arithmetic; float rounding would corrupt tax calculations | Active |
| — | Auth, caching, job queue, and object storage are all unimplemented | `blueprint/` names Better Auth, Redis, BullMQ/Trigger.dev, and MinIO/S3, but nothing beyond DB + REST scaffolding exists yet — sequencing not yet decided | Pending

## Change history

- 2026-07-03 — Initial `.agent/` system created (AI_CONTEXT.md, ARCHITECTURE.md, CONVENTIONS.md, BUSINESS_LOGIC.md, DECISIONS.md). Root `CLAUDE.md` created and `README.md` prepended with AI entry-point pointer. `apps/web/CLAUDE.md` deleted (was a one-line pointer to `AGENTS.md`, now redundant with root pointer); `apps/web/AGENTS.md` kept as-is (Next.js 16 breaking-changes warning, also duplicated into `.agent/CONVENTIONS.md`).
