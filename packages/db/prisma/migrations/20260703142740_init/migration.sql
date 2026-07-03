-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('chequing', 'savings', 'tfsa', 'fhsa', 'rrsp', 'non_registered', 'credit_card', 'loan', 'cash');

-- CreateEnum
CREATE TYPE "AccountPurpose" AS ENUM ('emergency', 'vacation', 'investment', 'bills', 'general', 'home_down_payment');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('manual', 'csv', 'api');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('etf', 'stock', 'bond', 'cash', 'fund');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('emergency_fund', 'vacation', 'net_worth', 'home', 'investment', 'custom');

-- CreateEnum
CREATE TYPE "RecurringRuleType" AS ENUM ('deposit', 'investment_buy', 'bill', 'transfer');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('weekly', 'biweekly', 'monthly');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Canada',
    "baseCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "age" INTEGER,
    "annual_salary" DECIMAL(12,2) NOT NULL,
    "monthly_take_home" DECIMAL(12,2) NOT NULL,
    "monthly_expenses" DECIMAL(12,2) NOT NULL,
    "savings_capacity" DECIMAL(12,2) NOT NULL,
    "target_net_worth" DECIMAL(12,2) NOT NULL DEFAULT 100000.00,

    CONSTRAINT "financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "purpose" "AccountPurpose" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "current_balance" DECIMAL(14,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "description" TEXT,
    "source" "TransactionSource" NOT NULL DEFAULT 'manual',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "quantity" DECIMAL(20,8) NOT NULL,
    "average_cost" DECIMAL(14,4) NOT NULL,
    "current_price" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "registered_account_type" "AccountType" NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "contribution_year" INTEGER NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dividends" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "holding_id" UUID NOT NULL,
    "pay_date" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reinvested" BOOLEAN NOT NULL DEFAULT false,
    "drip_quantity" DECIMAL(20,8),

    CONSTRAINT "dividends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "target_amount" DECIMAL(14,2) NOT NULL,
    "current_amount" DECIMAL(14,2) NOT NULL,
    "target_date" DATE,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "type" "RecurringRuleType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "next_run_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recurring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "financial_profiles_user_id_key" ON "financial_profiles"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "holdings_user_id_idx" ON "holdings"("user_id");

-- CreateIndex
CREATE INDEX "holdings_account_id_idx" ON "holdings"("account_id");

-- CreateIndex
CREATE INDEX "holdings_symbol_idx" ON "holdings"("symbol");

-- CreateIndex
CREATE INDEX "contributions_user_id_idx" ON "contributions"("user_id");

-- CreateIndex
CREATE INDEX "contributions_account_id_idx" ON "contributions"("account_id");

-- CreateIndex
CREATE INDEX "dividends_user_id_idx" ON "dividends"("user_id");

-- CreateIndex
CREATE INDEX "dividends_account_id_idx" ON "dividends"("account_id");

-- CreateIndex
CREATE INDEX "dividends_holding_id_idx" ON "dividends"("holding_id");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "recurring_rules_user_id_idx" ON "recurring_rules"("user_id");

-- CreateIndex
CREATE INDEX "recurring_rules_account_id_idx" ON "recurring_rules"("account_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
