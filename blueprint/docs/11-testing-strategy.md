# 11. Testing Strategy


Project: FinanceOS Canada, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Test Types
- Unit tests for calculators
- Unit tests for rules engine
- API integration tests
- Database migration tests
- E2E tests for critical flows
- CSV import parser tests
- Security tests for access control

## Must-Test Calculations
- Net worth = assets - liabilities
- Emergency fund progress
- TFSA contribution totals by year
- Dividend reinvestment values
- Compound projections
- Monthly savings rate

## Critical E2E Flows
1. Create profile
2. Add accounts
3. Add TFSA contribution
4. Add XEQT holding
5. Add dividend/DRIP
6. Generate monthly report
7. Import CSV
8. Edit transaction category
9. Check $100,000 goal progress
