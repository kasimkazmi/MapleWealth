import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RulesService } from '../rules/rules.service';
import { ContributionsService } from '../contributions/contributions.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private rulesService: RulesService,
    private contributionsService: ContributionsService
  ) {}

  async getMonthlyReport(userId: string, monthStr: string) {
    // Check if report already exists in audit logs or generate fresh
    return this.generateReportData(userId, monthStr);
  }

  async generateReportData(userId: string, monthStr: string) {
    const profile = await this.prisma.financialProfile.findUnique({ where: { userId } });
    const accounts = await this.prisma.account.findMany({ where: { userId, isActive: true } });
    const goals = await this.prisma.goal.findMany({ where: { userId } });
    
    // Calculate net worth
    const assets = accounts.filter(a => a.type !== 'credit_card' && a.type !== 'loan').reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const debts = accounts.filter(a => a.type === 'credit_card' || a.type === 'loan').reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const netWorth = assets - debts;

    // Filter transactions for this month
    const startOfMonth = new Date(`${monthStr}-01T00:00:00`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const income = transactions.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Evaluate rules warnings
    const warnings = await this.rulesService.evaluateRules(userId);
    const room = await this.contributionsService.getContributionRoom(userId);

    // Compile dynamic AI Advice
    const reportText = this.compileAiSummary({
      monthStr,
      income,
      expenses,
      savings,
      savingsRate,
      netWorth,
      warnings,
      room,
      profile
    });

    return {
      month: monthStr,
      generatedAt: new Date().toISOString(),
      financials: {
        totalIncome: income,
        totalExpenses: expenses,
        savings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        netWorth
      },
      warnings: warnings.filter(w => w.status !== 'pass'),
      registeredAccountLimits: room,
      aiInsights: reportText
    };
  }

  private compileAiSummary(data: {
    monthStr: string;
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    netWorth: number;
    warnings: any[];
    room: any;
    profile: any;
  }) {
    const hasCriticalWarning = data.warnings.some(w => w.severity === 'high');
    const overcontributed = data.room.tfsa.overLimit || data.room.fhsa.overLimit || data.room.rrsp.overLimit;

    let review = `### Monthly Financial Review for ${data.monthStr}\n\n`;

    review += `Hello Master, here is your personalized financial health summary based on your MapleWealth rules engine.\n\n`;

    review += `#### 📊 Financial Highlights\n`;
    review += `- **Net Worth:** $${data.netWorth.toLocaleString('en-CA', { minimumFractionDigits: 2 })}\n`;
    review += `- **Monthly Savings:** $${data.savings.toLocaleString('en-CA', { minimumFractionDigits: 2 })} (Savings Rate: ${Math.round(data.savingsRate)}%)\n`;
    review += `- **Take Home Target:** The monthly capacity of $${data.profile ? Number(data.profile.savingsCapacity).toLocaleString('en-CA') : '0'} was ${data.savings >= (data.profile ? Number(data.profile.savingsCapacity) : 0) ? 'exceeded! Excellent job.' : 'not fully met this month.'}\n\n`;

    review += `#### 🛡 Risk & Warnings\n`;
    if (hasCriticalWarning) {
      const crit = data.warnings.find(w => w.severity === 'high');
      review += `⚠️ **CRITICAL ACTION REQUIRED:** ${crit.message}\n> *Action:* ${crit.recommended_action}\n\n`;
    } else if (data.warnings.length > 0) {
      review += `🔔 **Alerts:**\n`;
      data.warnings.forEach(w => {
        if (w.status !== 'pass') {
          review += `- [${w.severity.toUpperCase()}] **${w.source_rule}:** ${w.message} *Recommended Action:* ${w.recommended_action}\n`;
        }
      });
      review += `\n`;
    } else {
      review += `✅ Your finances are fully aligned with your Canadian Financial Master Plan! No warnings triggered.\n\n`;
    }

    review += `#### 🍁 Registered Account Contributions\n`;
    review += `- **TFSA:** You have **$${data.room.tfsa.roomRemaining.toLocaleString('en-CA')}** contribution room remaining this year. ${data.room.tfsa.overLimit ? '⚠️ Warning: Overcontribution penalty active!' : 'Ensure your $50/month auto-deposit is on track.'}\n`;
    review += `- **FHSA:** **$${data.room.fhsa.roomRemaining.toLocaleString('en-CA')}** remaining. (Keep HISA-based until home buying is active).\n`;
    review += `- **RRSP:** Room remaining: **$${data.room.rrsp.roomRemaining.toLocaleString('en-CA')}**. ${data.profile && Number(data.profile.annualSalary) < 70000 ? 'ℹ️ Priority is low since salary is below $70k.' : 'Utilize for optimal tax deductions.'}\n\n`;

    review += `#### 🤖 AI Advisor Next Action Recommendation\n`;
    if (hasCriticalWarning) {
      review += `1. **Priority 1:** Focus entirely on your cash safety net. Build emergency savings to $5,000 before proceeding with investments.\n`;
    } else if (overcontributed) {
      review += `1. **Priority 1:** Correct registered account overcontributions immediately to stop 1%/month penalties.\n`;
    } else {
      review += `1. **Priority 1:** Continue the Wealthsimple TFSA recurring $50/month contribution into **XEQT**.\n`;
      review += `2. **Priority 2:** Direct remaining monthly savings capacity of $1,300 to increase your emergency fund HISA balance toward the $8,000 ideal target.\n`;
    }

    return review;
  }
}
