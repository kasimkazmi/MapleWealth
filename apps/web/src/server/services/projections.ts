import type { PrismaClient } from "@maplewealth/db";

export interface CompoundGrowthInput {
  principal: number;
  monthlyContribution: number;
  annualReturnRate: number;
  inflationRate?: number;
  years: number;
}

export interface NetWorthProjectionInput {
  annualReturnRate: number;
  inflationRate?: number;
  years: number;
}

export interface EfCompletionInput {
  targetAmount: number;
  monthlyAllocation: number;
}

export function calculateCompoundGrowth(data: CompoundGrowthInput) {
  const principal = data.principal;
  const monthlyContribution = data.monthlyContribution;
  const r = data.annualReturnRate;
  const i = data.inflationRate !== undefined ? data.inflationRate : 0.025;
  const totalMonths = data.years * 12;

  const series = [];
  let currentNominal = principal;

  for (let month = 0; month <= totalMonths; month++) {
    const yearFraction = month / 12;

    if (month > 0) {
      currentNominal = currentNominal * (1 + r / 12) + monthlyContribution;
    }

    const currentReal = currentNominal / Math.pow(1 + i, yearFraction);

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
      purchasingPowerLost:
        Math.round(
          (series[series.length - 1].nominalValue - series[series.length - 1].realValue) * 100,
        ) / 100,
    },
    series,
  };
}

export async function projectNetWorth(
  prisma: PrismaClient,
  userId: string,
  data: NetWorthProjectionInput,
) {
  const profile = await prisma.financialProfile.findUnique({ where: { userId } });
  const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });

  const assets = accounts
    .filter((a) => a.type !== "credit_card" && a.type !== "loan")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const debts = accounts
    .filter((a) => a.type === "credit_card" || a.type === "loan")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const currentNetWorth = assets - debts;
  const monthlyContribution = profile ? Number(profile.savingsCapacity) : 0;

  return calculateCompoundGrowth({
    principal: currentNetWorth,
    monthlyContribution,
    annualReturnRate: data.annualReturnRate,
    inflationRate: data.inflationRate,
    years: data.years,
  });
}

export async function calculateEfCompletion(
  prisma: PrismaClient,
  userId: string,
  data: EfCompletionInput,
) {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true, purpose: "emergency" },
  });
  const currentEfBalance = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const target = data.targetAmount;
  const monthlyAllocation = data.monthlyAllocation;

  if (currentEfBalance >= target) {
    return {
      currentBalance: currentEfBalance,
      targetAmount: target,
      monthsToTarget: 0,
      alreadyReached: true,
      completionDate: new Date().toISOString().split("T")[0],
    };
  }

  if (monthlyAllocation <= 0) {
    return {
      currentBalance: currentEfBalance,
      targetAmount: target,
      monthsToTarget: null,
      alreadyReached: false,
      message: "No savings allocated to the Emergency Fund; target cannot be reached.",
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
    completionDate: completionDate.toISOString().split("T")[0],
  };
}
