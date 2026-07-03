import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RulesService, RuleResult } from '../rules/rules.service';
import { ContributionsService } from '../contributions/contributions.service';
import type { FinancialProfile } from '@maplewealth/db';

type ContributionRoom = Awaited<
  ReturnType<ContributionsService['getContributionRoom']>
>;

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private rulesService: RulesService,
    private contributionsService: ContributionsService,
  ) {}

  async getMonthlyReport(userId: string, monthStr: string) {
    // Check if report already exists in audit logs or generate fresh
    return this.generateReportData(userId, monthStr);
  }

  async generateReportData(userId: string, monthStr: string) {
    const profile = await this.prisma.financialProfile.findUnique({
      where: { userId },
    });
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
    });

    // Calculate net worth
    const assets = accounts
      .filter((a) => a.type !== 'credit_card' && a.type !== 'loan')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const debts = accounts
      .filter((a) => a.type === 'credit_card' || a.type === 'loan')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const netWorth = assets - debts;

    // Filter transactions for this month
    const startOfMonth = new Date(`${monthStr}-01T00:00:00`);
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const income = transactions
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter((t) => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Evaluate rules warnings
    const warnings = await this.rulesService.evaluateRules(userId);
    const room = await this.contributionsService.getContributionRoom(userId);

    // Compile the rules-based summary from real computed data (no LLM call — this is a
    // deterministic template filled with the user's actual numbers, not generative AI).
    const reportText = this.compileSummary({
      monthStr,
      income,
      expenses,
      savings,
      savingsRate,
      netWorth,
      warnings,
      room,
      profile,
    });

    return {
      month: monthStr,
      generatedAt: new Date().toISOString(),
      financials: {
        totalIncome: income,
        totalExpenses: expenses,
        savings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        netWorth,
      },
      warnings: warnings.filter((w) => w.status !== 'pass'),
      registeredAccountLimits: room,
      summary: reportText,
    };
  }

  private compileSummary(data: {
    monthStr: string;
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    netWorth: number;
    warnings: RuleResult[];
    room: ContributionRoom;
    profile: FinancialProfile | null;
  }) {
    const hasCriticalWarning = data.warnings.some((w) => w.severity === 'high');
    const overcontributed =
      data.room.tfsa.overLimit ||
      data.room.fhsa.overLimit ||
      data.room.rrsp.overLimit;

    let review = `### Monthly Financial Review for ${data.monthStr}\n\n`;

    review += `Here is your financial health summary, generated from your MapleWealth account data and rules engine (this is a rules-based report, not AI-generated).\n\n`;

    review += `#### 📊 Financial Highlights\n`;
    review += `- **Net Worth:** $${data.netWorth.toLocaleString('en-CA', { minimumFractionDigits: 2 })}\n`;
    review += `- **Monthly Savings:** $${data.savings.toLocaleString('en-CA', { minimumFractionDigits: 2 })} (Savings Rate: ${Math.round(data.savingsRate)}%)\n`;
    review += `- **Take Home Target:** The monthly capacity of $${data.profile ? Number(data.profile.savingsCapacity).toLocaleString('en-CA') : '0'} was ${data.savings >= (data.profile ? Number(data.profile.savingsCapacity) : 0) ? 'exceeded! Excellent job.' : 'not fully met this month.'}\n\n`;

    review += `#### 🛡 Risk & Warnings\n`;
    if (hasCriticalWarning) {
      const crit = data.warnings.find((w) => w.severity === 'high')!;
      review += `⚠️ **CRITICAL ACTION REQUIRED:** ${crit.message}\n> *Action:* ${crit.recommended_action}\n\n`;
    } else if (data.warnings.length > 0) {
      review += `🔔 **Alerts:**\n`;
      data.warnings.forEach((w) => {
        if (w.status !== 'pass') {
          review += `- [${w.severity.toUpperCase()}] **${w.source_rule}:** ${w.message} *Recommended Action:* ${w.recommended_action}\n`;
        }
      });
      review += `\n`;
    } else {
      review += `✅ Your finances are fully aligned with your Canadian Financial Master Plan! No warnings triggered.\n\n`;
    }

    review += `#### 🍁 Registered Account Contributions\n`;
    review += `- **TFSA:** You have **$${data.room.tfsa.roomRemaining.toLocaleString('en-CA')}** contribution room remaining this year. ${data.room.tfsa.overLimit ? '⚠️ Warning: Overcontribution penalty active!' : 'Room remaining based on your entered CRA carry-forward balance.'}\n`;
    review += `- **FHSA:** **$${data.room.fhsa.roomRemaining.toLocaleString('en-CA')}** remaining. (Keep HISA-based until home buying is active).\n`;
    review += `- **RRSP:** Room remaining: **$${data.room.rrsp.roomRemaining.toLocaleString('en-CA')}**${data.room.rrsp.isEstimate ? ' (estimated — enter your CRA Notice of Assessment room for an exact figure)' : ''}. ${data.profile && Number(data.profile.annualSalary) < 70000 ? 'ℹ️ Priority is low since salary is below $70k.' : 'Utilize for optimal tax deductions.'}\n\n`;

    const monthlySavingsCapacity = data.profile
      ? Number(data.profile.savingsCapacity)
      : 0;

    review += `#### 🎯 Next Action Recommendation\n`;
    if (hasCriticalWarning) {
      review += `1. **Priority 1:** Focus entirely on your cash safety net. Build emergency savings to $5,000 before proceeding with investments.\n`;
    } else if (overcontributed) {
      review += `1. **Priority 1:** Correct registered account overcontributions immediately to stop 1%/month penalties.\n`;
    } else if (data.room.tfsa.roomRemaining > 0) {
      review += `1. **Priority 1:** Direct available monthly savings capacity of $${monthlySavingsCapacity.toLocaleString('en-CA')} toward your remaining TFSA room ($${data.room.tfsa.roomRemaining.toLocaleString('en-CA')}) before FHSA or RRSP.\n`;
    } else if (data.room.fhsa.roomRemaining > 0) {
      review += `1. **Priority 1:** TFSA room is fully used — direct savings capacity of $${monthlySavingsCapacity.toLocaleString('en-CA')} toward remaining FHSA room ($${data.room.fhsa.roomRemaining.toLocaleString('en-CA')}).\n`;
    } else {
      review += `1. **Priority 1:** TFSA and FHSA room are fully used — direct savings capacity of $${monthlySavingsCapacity.toLocaleString('en-CA')} toward RRSP or non-registered investments.\n`;
    }

    return review;
  }
}
