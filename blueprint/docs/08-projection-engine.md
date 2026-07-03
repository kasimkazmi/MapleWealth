# 08. Projection Engine


Project: FinanceOS Canada, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Required Calculators
- Compound growth
- Net worth projection
- Emergency fund completion date
- Salary milestone projection
- TFSA contribution projection
- FIRE and Coast FIRE later

## Default Inputs
- Current TFSA: $10
- Monthly TFSA contribution: $50
- Conservative return: 5%
- Baseline return: 7%
- Aggressive return: 8%
- Target net worth: $100,000

## Formula
Use monthly compounding:
FV = PV*(1+r/12)^n + PMT*(((1+r/12)^n - 1)/(r/12))

## Important
Returns are estimates, not guarantees. UI must label projections clearly.

## Current $50/month Projection, Approximate
- 1 year: about $630-$650
- 5 years: about $3,500-$3,800
- 10 years: about $8,700-$9,300
- 20 years: about $26,000-$30,000
- 30 years: about $60,000-$80,000 depending on return

## Developer Warning
Do not hardcode a single return assumption. Always allow scenarios.
