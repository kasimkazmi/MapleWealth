export type AccountType = 
  | 'chequing'
  | 'savings'
  | 'tfsa'
  | 'fhsa'
  | 'rrsp'
  | 'non_registered'
  | 'credit_card'
  | 'loan'
  | 'cash';

export type AccountPurpose = 
  | 'emergency'
  | 'vacation'
  | 'investment'
  | 'bills'
  | 'general'
  | 'home_down_payment';

export type GoalType = 
  | 'emergency_fund'
  | 'vacation'
  | 'net_worth'
  | 'home'
  | 'investment'
  | 'custom';

export interface FinancialProfile {
  id: string;
  userId: string;
  age: number | null;
  annualSalary: string;
  monthlyTakeHome: string;
  monthlyExpenses: string;
  savingsCapacity: string;
  targetNetWorth: string;
}

export interface Account {
  id: string;
  userId: string;
  institution: string;
  name: string;
  type: AccountType;
  purpose: AccountPurpose;
  currency: string;
  currentBalance: string;
  isActive: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: string;
  currentAmount: number;
  targetDate: string | null;
  priority: number;
}

export interface Holding {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: string;
  averageCost: string;
  currentPrice: string;
  account: {
    name: string;
    type: AccountType;
  };
}

export interface RuleResult {
  status: 'pass' | 'warn' | 'fail';
  severity: 'info' | 'low' | 'medium' | 'high';
  message: string;
  recommended_action: string;
  source_rule: string;
}

export interface ContributionRoom {
  year: number;
  tfsa: {
    limit: number;
    contributed: number;
    roomRemaining: number;
    overLimit: boolean;
    estimatedPenalty: number;
  };
  fhsa: {
    limit: number;
    lifetimeLimit: number;
    contributedThisYear: number;
    lifetimeContributed: number;
    roomRemaining: number;
    overLimit: boolean;
    estimatedPenalty: number;
  };
  rrsp: {
    calculatedLimit: number;
    contributed: number;
    roomRemaining: number;
    overLimit: boolean;
    estimatedPenalty: number;
  };
}

export interface MonthlyReport {
  month: string;
  generatedAt: string;
  financials: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
    netWorth: number;
  };
  warnings: RuleResult[];
  registeredAccountLimits: ContributionRoom;
  aiInsights: string;
}

export interface TradeFormData {
  accountId: string;
  symbol: string;
  name: string;
  tradeType: string;
  quantity: number;
  price: number;
  fees: number;
  date: string;
}
