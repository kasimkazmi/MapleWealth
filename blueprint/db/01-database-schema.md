# 04. Database Schema


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Core Entities

### users
- id uuid pk
- email text unique
- name text
- country text default Canada
- base_currency text default CAD
- created_at timestamptz
- updated_at timestamptz

### financial_profiles
- id uuid pk
- user_id uuid fk
- age int
- annual_salary numeric(12,2)
- monthly_take_home numeric(12,2)
- monthly_expenses numeric(12,2)
- savings_capacity numeric(12,2)
- target_net_worth numeric(12,2) default 100000

### accounts
- id uuid pk
- user_id uuid fk
- institution text
- name text
- type enum: chequing, savings, tfsa, fhsa, rrsp, non_registered, credit_card, loan, cash
- purpose enum: emergency, vacation, investment, bills, general, home_down_payment
- currency text default CAD
- current_balance numeric(14,2)
- is_active boolean

### transactions
- id uuid pk
- user_id uuid fk
- account_id uuid fk
- date date
- amount numeric(14,2)
- currency text
- category text
- merchant text
- description text
- source enum: manual, csv, api

### holdings
- id uuid pk
- user_id uuid fk
- account_id uuid fk
- symbol text
- name text
- asset_type enum: etf, stock, bond, cash, fund
- quantity numeric(20,8)
- average_cost numeric(14,4)
- current_price numeric(14,4)

### contributions
- id uuid pk
- user_id uuid fk
- account_id uuid fk
- registered_account_type enum: tfsa, fhsa, rrsp
- date date
- amount numeric(14,2)
- contribution_year int

### dividends
- id uuid pk
- user_id uuid fk
- account_id uuid fk
- holding_id uuid fk
- pay_date date
- amount numeric(14,2)
- reinvested boolean
- drip_quantity numeric(20,8)

### goals
- id uuid pk
- user_id uuid fk
- name text
- type enum: emergency_fund, vacation, net_worth, home, investment, custom
- target_amount numeric(14,2)
- current_amount numeric(14,2)
- target_date date nullable
- priority int

### recurring_rules
- id uuid pk
- user_id uuid fk
- account_id uuid fk
- type enum: deposit, investment_buy, bill, transfer
- amount numeric(14,2)
- frequency enum: weekly, biweekly, monthly
- next_run_date date
- active boolean

### audit_logs
- id uuid pk
- user_id uuid fk
- entity_type text
- entity_id uuid
- action text
- before_json jsonb
- after_json jsonb
- created_at timestamptz

## Prisma Rules
- Use Decimal for all money.
- Add indexes on user_id, date, account_id, symbol.
- Never calculate money using JS number in critical paths.
