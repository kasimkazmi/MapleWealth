# AI Coding Agent Master Prompt

You are building FinanceOS Canada, a production-quality personal finance dashboard.


Project: FinanceOS Canada, Personal Finance Dashboard
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

## MVP Build Order
1. Initialize monorepo.
2. Create Next.js 15 app.
3. Create NestJS API.
4. Add Prisma/PostgreSQL.
5. Add Better Auth.
6. Implement accounts.
7. Implement transactions.
8. Implement goals.
9. Implement net worth dashboard.
10. Implement TFSA tracker.
11. Implement dividends/DRIP tracker.
12. Implement projection engine.
13. Implement rules engine.
14. Implement monthly report.
15. Add CSV import.
16. Add tests.
17. Dockerize.

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
