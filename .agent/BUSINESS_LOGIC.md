# Business Logic

MapleWealth is a Canadian-first personal finance dashboard. Full spec lives in `blueprint/docs/`; this file is the working summary. **Core rule, applies to all product/AI behavior**: prioritize Emergency Fund → TFSA → FHSA → RRSP. Never recommend trading, market timing, options, forex, meme stocks, or speculation.

## Glossary

| Term | Meaning |
|---|---|
| TFSA | Tax-Free Savings Account (Canadian registered account, tax-free growth/withdrawal) |
| FHSA | First Home Savings Account (registered, for first home purchase) |
| RRSP | Registered Retirement Savings Plan (tax-deferred) |
| Contribution room | The amount you're still allowed to contribute to a registered account this year without penalty |
| ACB | Adjusted Cost Base — running average cost per share, used for capital gains tax in non-registered accounts |
| DRIP | Dividend Reinvestment Plan — reinvested dividends buy more shares and increase ACB |
| ROC | Return of Capital — reduces ACB without being a taxable event |
| XEQT / VEQT / VGRO | The app's recommended all-in-one equity ETFs (XEQT primary, VEQT/VGRO alternatives) |
| HISA | High-Interest Savings Account — where emergency/vacation funds must stay (never invested) |

## Account model (implemented — `packages/db/prisma/schema.prisma`)

`AccountType`: chequing, savings, tfsa, fhsa, rrsp, non_registered, credit_card, loan, cash.
`AccountPurpose`: emergency, vacation, investment, bills, general, home_down_payment.
Emergency and vacation-purpose accounts should stay uninvested (cash/HISA) per the core rule — this is a product rule, not currently enforced in code (`accounts.service.ts` has no purpose/type cross-validation yet).

## Critical financial rules (spec — `blueprint/docs/07-financial-rules-engine.md`; **not yet implemented as code**, `apps/api` has no rules-engine module)

- Emergency fund minimum $5,000, ideal $8,000; below $1,000 is a critical warning.
- TFSA annual limit: $7,000 (2024–2026). Formula: `Current Room = Carryforward + Annual Limit + Prior Year Withdrawals − Current Year Contributions`. Excess triggers 1%/month penalty.
- FHSA: $8,000/year, $40,000 lifetime cap, max $16,000 room in any single year. Same 1%/month excess penalty.
- RRSP: `Prior Year Unused Room + min(18% of prior year earned income, CRA max) − Pension Adjustment − Current Contributions`. CRA max: $31,560 (2024), $32,490 (2025), $33,830 (2026). Penalty applies once excess exceeds a $2,000 grace buffer.
- ACB (non-registered/taxable accounts): buy events average cost into ACB; DRIP dividends increase ACB like a buy; ROC decreases ACB; sells realize `Proceeds − (ACB × shares sold) − fees` as capital gain/loss. This is why `Holding`/`Dividend`/`Contribution` use `Decimal`, not `Float` — see [CONVENTIONS.md](CONVENTIONS.md).

The `Contribution` model tracks contributions per `contributionYear` to support this room math once the rules engine is built.

## AI assistant guardrails (spec — `blueprint/docs/09-ai-features.md`; **not yet implemented**, no AI integration exists in `apps/api` or `apps/web`)

Planned scope: monthly financial review, spending summary, goal progress explanation, plain-English rule warnings, CSV import categorization. Guardrails for when this is built: never claim to be a licensed financial advisor, no personalized securities speculation beyond the approved long-term ETF strategy, no market timing advice, no high-risk product encouragement, always state assumptions, ask for missing numbers before big projections.

## Pricing / monetization (spec — `blueprint/docs/14-business-plan.md`; **not implemented**, no billing/credits code exists anywhere in the repo)

Planned model: free self-hosted personal version, paid hosted SaaS later, premium AI reports, tax-season reports, advisor/export package. Explicit product principle: do not go public-SaaS until the personal single-user version is trustworthy — bad financial calculations destroy credibility instantly, so correctness of the rules engine and ACB math takes priority over monetization features.

## Background workers (planned, spec implies `RecurringRule` model drives these)

`RecurringRule` (type: deposit/investment_buy/bill/transfer, with `frequency` and `nextRunDate`) is the data model for scheduled recurring transactions, but **no worker/scheduler process exists yet** — `blueprint/docs`'s recommended stack names Trigger.dev or BullMQ + Redis for this, neither of which is installed. When a worker is built: it should read `RecurringRule.active` rows where `nextRunDate` has passed, create the corresponding `Transaction`/`Contribution`/`Dividend`, and advance `nextRunDate` by `frequency`.

## TODO for future agents

- No rules-engine module exists — when built, wire it to the `Contribution`/`Account` models above and update this file with the actual code location.
- No AI integration exists — when built, document the actual provider/SDK used and update the guardrails section with implementation notes.
- No billing/credits system exists — when built, document actual pricing tiers and entitlement checks here.
- No worker/scheduler exists — when built, document the actual queue/cron mechanism used.
