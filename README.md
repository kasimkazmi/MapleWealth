# MapleWealth, Production-Ready SaaS Blueprint


Project: MapleWealth, Personal Finance Dashboard for Canadians
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


This package is a build-ready blueprint for an AI coding agent. It defines product scope, architecture, database, APIs, UI, security, testing, deployment, and phased execution.

## Build Target
A SaaS-quality personal finance operating system focused on Canadian users, starting as a private single-user app and designed to evolve into multi-tenant SaaS later.

## Recommended Stack
- Frontend: Next.js 15, TypeScript, App Router, Tailwind CSS, shadcn/ui
- Backend: NestJS or Next.js route handlers for MVP, NestJS preferred for SaaS scale
- Database: PostgreSQL + Prisma
- Auth: Better Auth
- Jobs: Trigger.dev or BullMQ
- Cache: Redis
- Charts: Recharts
- Storage: MinIO/S3-compatible storage
- Deployment: Docker + Coolify/HomeCloud
- Monitoring: Grafana, Prometheus, Sentry/OpenTelemetry

## Read Order
1. docs/01-product-vision.md
2. docs/02-prd.md
3. docs/03-architecture.md
4. db/01-database-schema.md
5. api/01-api-spec.md
6. prompts/ai-coding-agent-master-prompt.md

## MVP Definition
MVP must include account tracking, TFSA/XEQT tracker, emergency fund tracker, vacation fund tracker, net worth dashboard, projections, CSV import, recurring deposit tracking, DRIP/dividend tracking, and monthly review report.
