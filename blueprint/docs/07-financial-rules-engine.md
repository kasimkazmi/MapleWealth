# 07. Financial Rules Engine


Project: FinanceOS Canada, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Purpose
Encode the Personal Financial Master Plan as deterministic rules.

## Rules
1. Emergency fund target minimum is $5,000.
2. Emergency fund ideal is $8,000.
3. Emergency money must stay in savings/HISA, not investments.
4. Vacation money must stay separate and uninvested.
5. TFSA investing is prioritized after emergency fund progress is stable.
6. Primary ETF is XEQT.
7. Alternative ETFs are VEQT and VGRO.
8. RRSP has low priority until annual income is approximately $70,000+.
9. FHSA starts when home buying becomes an active goal.
10. Increase investments before lifestyle spending when salary rises.

## Warning Examples
- Emergency fund below $1,000: critical cash safety warning.
- Emergency fund below $5,000 and TFSA contribution above planned amount: caution.
- User adds option/forex/meme-stock holding: violates investment philosophy.
- RRSP contribution recommended before $70k salary: explain trade-off.

## Output Format
Each rule evaluation returns:
- status: pass/warn/fail
- severity: info/low/medium/high
- message
- recommended_action
- source_rule
