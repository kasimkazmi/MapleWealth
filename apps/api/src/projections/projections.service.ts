import { Injectable } from '@nestjs/common';

export class CompoundGrowthDto {
  principal!: number;
  monthlyContribution!: number;
  annualReturnRate!: number; // e.g. 0.07 for 7%
  inflationRate?: number; // e.g. 0.025 for 2.5%
  years!: number;
}

export class NetWorthProjectionDto {
  annualReturnRate!: number;
  inflationRate?: number;
  years!: number;
}

export class EfCompletionDto {
  targetAmount!: number; // e.g. 5000 or 8000
  monthlyAllocation!: number; // how much of savings capacity goes to EF
}

@Injectable()
export class ProjectionsService {
  
  // Calculate nominal vs inflation-adjusted real compound growth
  calculateCompoundGrowth(data: CompoundGrowthDto) {
    const principal = data.principal;
    const monthlyContribution = data.monthlyContribution;
    const r = data.annualReturnRate;
    const i = data.inflationRate !== undefined ? data.inflationRate : 0.025; // Default 2.5% inflation
    const totalMonths = data.years * 12;

    const series = [];
    let currentNominal = principal;

    // Compounding month-by-month
    for (let month = 0; month <= totalMonths; month++) {
      const yearFraction = month / 12;
      
      if (month > 0) {
        // Add interest and contribution monthly
        currentNominal = currentNominal * (1 + r / 12) + monthlyContribution;
      }

      // Discount nominal future value by annual inflation rate to find real value
      const currentReal = currentNominal / Math.pow(1 + i, yearFraction);

      // Only add to plot data every year or final month to keep payload clean
      if (month % 12 === 0 || month === totalMonths) {
        series.push({
          month,
          year: Math.floor(yearFraction),
          nominalValue: Math.round(currentNominal * 100) / 100,
          realValue: Math.round(currentReal * 100) / 100,
        });
      }
    }

    return {
      parameters: {
        principal,
        monthlyContribution,
        nominalRate: r,
        inflationRate: i,
        years: data.years,
      },
      summary: {
        finalNominalValue: series[series.length - 1].nominalValue,
        finalRealValue: series[series.length - 1].realValue,
        purchasingPowerLost: Math.round((series[series.length - 1].nominalValue - series[series.length - 1].realValue) * 100) / 100,
      },
      series,
    };
  }

  // Project net worth into the future based on user's current profile and active assets
  async projectNetWorth(userId: string, prisma: any, data: NetWorthProjectionDto) {
    const profile = await prisma.financialProfile.findUnique({
      where: { userId }
    });
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true }
    });

    const assets = accounts
      .filter((a: any) => a.type !== 'credit_card' && a.type !== 'loan')
      .reduce((sum: number, a: any) => sum + Number(a.currentBalance), 0);

    const debts = accounts
      .filter((a: any) => a.type === 'credit_card' || a.type === 'loan')
      .reduce((sum: number, a: any) => sum + Number(a.currentBalance), 0);

    const currentNetWorth = assets - debts;
    const monthlyContribution = profile ? Number(profile.savingsCapacity) : 0;

    return this.calculateCompoundGrowth({
      principal: currentNetWorth,
      monthlyContribution,
      annualReturnRate: data.annualReturnRate,
      inflationRate: data.inflationRate,
      years: data.years,
    });
  }

  // Calculate emergency fund completion date
  async calculateEfCompletion(userId: string, prisma: any, data: EfCompletionDto) {
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true, purpose: 'emergency' }
    });
    const currentEfBalance = accounts.reduce((sum: number, a: any) => sum + Number(a.currentBalance), 0);

    const target = data.targetAmount;
    const monthlyAllocation = data.monthlyAllocation;

    if (currentEfBalance >= target) {
      return {
        currentBalance: currentEfBalance,
        targetAmount: target,
        monthsToTarget: 0,
        alreadyReached: true,
        completionDate: new Date().toISOString().split('T')[0]
      };
    }

    if (monthlyAllocation <= 0) {
      return {
        currentBalance: currentEfBalance,
        targetAmount: target,
        monthsToTarget: null,
        alreadyReached: false,
        message: 'No savings allocated to the Emergency Fund; target cannot be reached.'
      };
    }

    const shortFall = target - currentEfBalance;
    const months = Math.ceil(shortFall / monthlyAllocation);
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + months);

    return {
      currentBalance: currentEfBalance,
      targetAmount: target,
      monthsToTarget: months,
      alreadyReached: false,
      completionDate: completionDate.toISOString().split('T')[0]
    };
  }
}
