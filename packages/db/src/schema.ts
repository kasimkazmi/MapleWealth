import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  date,
  index,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const accountTypeEnum = pgEnum("AccountType", [
  "chequing",
  "savings",
  "tfsa",
  "fhsa",
  "rrsp",
  "non_registered",
  "credit_card",
  "loan",
  "cash",
]);

export const accountPurposeEnum = pgEnum("AccountPurpose", [
  "emergency",
  "vacation",
  "investment",
  "bills",
  "general",
  "home_down_payment",
]);

export const transactionSourceEnum = pgEnum("TransactionSource", [
  "manual",
  "csv",
  "api",
]);

export const assetTypeEnum = pgEnum("AssetType", [
  "etf",
  "stock",
  "bond",
  "cash",
  "fund",
]);

export const goalTypeEnum = pgEnum("GoalType", [
  "emergency_fund",
  "vacation",
  "net_worth",
  "home",
  "investment",
  "custom",
]);

export const recurringRuleTypeEnum = pgEnum("RecurringRuleType", [
  "deposit",
  "investment_buy",
  "bill",
  "transfer",
]);

export const frequencyEnum = pgEnum("Frequency", [
  "weekly",
  "biweekly",
  "monthly",
]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  country: text("country").default("Canada").notNull(),
  baseCurrency: text("baseCurrency").default("CAD").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const authAccounts = pgTable("auth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  idToken: text("id_token"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  planId: text("plan_id").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const financialProfiles = pgTable("financial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age"),
  annualSalary: numeric("annual_salary", { precision: 12, scale: 2 }).notNull(),
  monthlyTakeHome: numeric("monthly_take_home", { precision: 12, scale: 2 }).notNull(),
  monthlyExpenses: numeric("monthly_expenses", { precision: 12, scale: 2 }).notNull(),
  savingsCapacity: numeric("savings_capacity", { precision: 12, scale: 2 }).notNull(),
  targetNetWorth: numeric("target_net_worth", { precision: 12, scale: 2 }).default("100000.00").notNull(),
  tfsaCarryForwardBase: numeric("tfsa_carry_forward_base", { precision: 12, scale: 2 }).default("0.00").notNull(),
  fhsaCarryForwardBase: numeric("fhsa_carry_forward_base", { precision: 12, scale: 2 }).default("0.00").notNull(),
  rrspKnownRoom: numeric("rrsp_known_room", { precision: 12, scale: 2 }).default("0.00").notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  purpose: accountPurposeEnum("purpose").notNull(),
  currency: text("currency").default("CAD").notNull(),
  currentBalance: numeric("current_balance", { precision: 14, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  index("accounts_user_id_idx").on(table.userId),
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  category: text("category").notNull(),
  merchant: text("merchant"),
  description: text("description"),
  source: transactionSourceEnum("source").default("manual").notNull(),
}, (table) => [
  index("transactions_user_id_idx").on(table.userId),
  index("transactions_account_id_idx").on(table.accountId),
  index("transactions_date_idx").on(table.date),
]);

export const holdings = pgTable("holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  averageCost: numeric("average_cost", { precision: 14, scale: 4 }).notNull(),
  currentPrice: numeric("current_price", { precision: 14, scale: 4 }).notNull(),
}, (table) => [
  index("holdings_user_id_idx").on(table.userId),
  index("holdings_account_id_idx").on(table.accountId),
  index("holdings_symbol_idx").on(table.symbol),
]);

export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  registeredAccountType: accountTypeEnum("registered_account_type").notNull(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  contributionYear: integer("contribution_year").notNull(),
}, (table) => [
  index("contributions_user_id_idx").on(table.userId),
  index("contributions_account_id_idx").on(table.accountId),
]);

export const dividends = pgTable("dividends", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  holdingId: uuid("holding_id").notNull().references(() => holdings.id, { onDelete: "cascade" }),
  payDate: date("pay_date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  reinvested: boolean("reinvested").default(false).notNull(),
  dripQuantity: numeric("drip_quantity", { precision: 20, scale: 8 }),
}, (table) => [
  index("dividends_user_id_idx").on(table.userId),
  index("dividends_account_id_idx").on(table.accountId),
  index("dividends_holding_id_idx").on(table.holdingId),
]);

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: goalTypeEnum("type").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  priority: integer("priority").default(1).notNull(),
}, (table) => [
  index("goals_user_id_idx").on(table.userId),
]);

export const approvedHoldings = pgTable("approved_holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("approved_holdings_user_id_idx").on(table.userId),
  unique("approved_holdings_user_id_symbol_unique").on(table.userId, table.symbol),
]);

export const recurringRules = pgTable("recurring_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  type: recurringRuleTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  nextRunDate: date("next_run_date").notNull(),
  active: boolean("active").default(true).notNull(),
}, (table) => [
  index("recurring_rules_user_id_idx").on(table.userId),
  index("recurring_rules_account_id_idx").on(table.accountId),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  beforeJson: text("before_json"), // Store JSON as string or text
  afterJson: text("after_json"),   // Store JSON as string or text
  correlationId: text("correlation_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_user_id_idx").on(table.userId),
  index("audit_logs_correlation_id_idx").on(table.correlationId),
]);
