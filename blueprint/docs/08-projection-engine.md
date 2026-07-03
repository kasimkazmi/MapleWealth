# 08. Projection Engine


Project: MapleWealth, Personal Finance Dashboard
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

### Nominal Compound Growth
Use monthly compounding:
`FV_nominal = PV * (1 + r/12)^n + PMT * (((1 + r/12)^n - 1) / (r/12))`
Where:
- `r` = Nominal annual rate of return (e.g., 5%, 7%, 8%)
- `n` = Total months (`years * 12`)
- `PMT` = Monthly contribution

### Inflation-Adjusted (Real) Compound Growth
To represent today's purchasing power, we must discount by the annual inflation rate:
`FV_real = FV_nominal / (1 + i)^years`
Where:
- `i` = Annual inflation rate (Default baseline: 2.5%, range: 1.5% - 4%)
- `years` = `n / 12`

Alternatively, evaluate using the Fisher Equation to get the real rate:
`r_real = (1 + r) / (1 + i) - 1`
And compound using `r_real` directly.

## Important
- Projections **MUST** display both "Nominal Value" (future currency) and "Real Value" (today's purchasing power) to avoid misleading the user on long-term wealth limits.
- Returns are estimates, not guarantees. UI must label projections clearly and note the inflation adjustment details.

## Current $50/month Projection, Approximate
- 1 year: about $630-$650
- 5 years: about $3,500-$3,800
- 10 years: about $8,700-$9,300
- 20 years: about $26,000-$30,000
- 30 years: about $60,000-$80,000 depending on return

## Developer Warning
Do not hardcode a single return assumption. Always allow scenarios.
