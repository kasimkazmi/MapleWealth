# 07. Financial Rules Engine


Project: MapleWealth, Personal Finance Dashboard
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

## CRA Registered Account Math & Contribution Room

### 1. TFSA (Tax-Free Savings Account)
* **Calculation:** `Current Room = Unused Room Carried Forward + Annual Limit + Prior Year Withdrawals - Current Year Contributions`
* **Annual Limits:** $7,000 (2024, 2025, 2026).
* **Penalty:** 1% per month on the highest excess contribution amount.
* **Warning Trigger:** If `Current Year Contributions > Current Room`.

### 2. FHSA (First Home Savings Account)
* **Calculation:** `Current Room = Unused Room Carried Forward (max $8,000) + Annual Limit ($8,000) - Current Year Contributions`
* **Limits:** Lifetime limit $40,000. Max room in any single year is $16,000.
* **Penalty:** 1% per month on excess contributions.
* **Warning Trigger:** If `Current Year Contributions > Current Room` or `Lifetime Contributions > $40,000`.

### 3. RRSP (Registered Retirement Savings Plan)
* **Calculation:** `Current Room = Prior Year Unused Room + Min(18% of prior year earned income, Max CRA Limit) - Pension Adjustment - Current Year Contributions`
* **Max Limits:** $31,560 (2024), $32,490 (2025), $33,830 (2026).
* **Penalty:** 1% per month on contributions exceeding room by more than $2,000.
* **Warning Trigger:** If `Current Year Contributions > Current Room + $2,000`.

---

## Adjusted Cost Base (ACB) Tracking (Taxable/Non-Registered)

For taxable accounts, tracking ACB is mandatory for capital gains tax reporting.
* **ACB Formula (Buy Event):** `New ACB = (Previous Total Cost + Purchase Value + Buy Fees) / New Total Shares`
* **ACB Formula (Sell Event):** `Total Cost stays same, Shares decrease. Capital Gain/Loss = Proceeds - (ACB * Shares Sold) - Sell Fees`
* **Reinvested Dividends (DRIP):** Reinvested dividends act as a Buy event and increase the ACB by the total dividend reinvested.
* **Return of Capital (ROC):** Reduces the ACB (Previous Total Cost decreases, shares count remains same).

---

## Warning Examples
- Emergency fund below $1,000: critical cash safety warning.
- Emergency fund below $5,000 and TFSA contribution above planned amount: caution.
- User adds option/forex/meme-stock holding: violates investment philosophy.
- RRSP contribution recommended before $70k salary: explain trade-off.
- TFSA, FHSA, or RRSP overcontribution: Critical CRA tax warning with estimated 1% penalty.

## Output Format
Each rule evaluation returns:
- status: pass/warn/fail
- severity: info/low/medium/high
- message
- recommended_action
- source_rule
