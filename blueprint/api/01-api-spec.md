# 05. API Specification


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## API Style
REST for MVP. Add GraphQL only if the UI becomes highly query-complex.

## Authentication
- POST /auth/sign-up
- POST /auth/sign-in
- POST /auth/sign-out
- GET /auth/session

## Profile
- GET /profile
- PATCH /profile

## Accounts
- GET /accounts
- POST /accounts
- GET /accounts/:id
- PATCH /accounts/:id
- DELETE /accounts/:id

## Transactions
- GET /transactions?accountId=&from=&to=&category=
- POST /transactions
- PATCH /transactions/:id
- DELETE /transactions/:id

## Investments
- GET /investments/holdings
- POST /investments/holdings
- PATCH /investments/holdings/:id
- GET /investments/performance
- POST /investments/trades

## Contributions
- GET /registered-accounts/contributions?type=tfsa&year=2026
- POST /registered-accounts/contributions
- GET /registered-accounts/room

## Dividends
- GET /dividends
- POST /dividends
- PATCH /dividends/:id

## Goals
- GET /goals
- POST /goals
- PATCH /goals/:id

## Projections
- POST /projections/compound-growth
- POST /projections/net-worth
- POST /projections/emergency-fund-completion

## Reports
- GET /reports/monthly?month=YYYY-MM
- POST /reports/generate-monthly

## Imports
- POST /imports/csv
- GET /imports/:id/status
- POST /imports/:id/commit

## Response Standards
All mutation endpoints must return updated entity, audit id, and validation warnings when relevant.
