# 03. Technical Architecture


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Architecture Style
Modular monolith first. Do not over-engineer microservices. Use clear domain modules so it can split later if needed.

## Frontend
- Next.js 15 App Router
- Server Components by default
- Client Components only for charts, forms, filters, drag interactions
- shadcn/ui for components
- Tailwind CSS for styling
- Zod + React Hook Form for validation

## Backend
Preferred: NestJS API server.
Alternative MVP: Next.js route handlers.

Modules:
- AuthModule
- UsersModule
- AccountsModule
- TransactionsModule
- InvestmentsModule
- GoalsModule
- ContributionsModule
- ProjectionsModule
- ReportsModule
- ImportsModule
- RulesEngineModule
- AiInsightsModule

## Data Layer
- PostgreSQL
- Prisma ORM
- Decimal values stored using Decimal/NUMERIC, never float
- Money values include currency
- Audit log for financial data changes

## External Services
- Market price provider: Yahoo Finance/Stooq/Alpha Vantage later
- CSV import first for Wealthsimple/CIBC/Neo
- Redis for cache and background job locks
- MinIO/S3 for file uploads

## Security Boundary
Financial data is sensitive. Encrypt secrets, protect PII, isolate tenants, keep audit logs, and avoid logging raw financial payloads.
