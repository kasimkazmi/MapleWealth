import type { PrismaClient } from "@maplewealth/db";
import { HttpError } from "../request-context";

// Export full user dataset for GDPR/PIPEDA compliance
export async function exportUserData(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      financialProfile: true,
      accounts: {
        include: { transactions: true, holdings: true, contributions: true, dividends: true },
      },
      goals: true,
      recurringRules: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User profile not found");
  }

  return {
    exportedAt: new Date().toISOString(),
    formatVersion: "1.0",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      baseCurrency: user.baseCurrency,
      createdAt: user.createdAt,
    },
    financialProfile: user.financialProfile,
    accounts: user.accounts.map((acc) => ({
      id: acc.id,
      institution: acc.institution,
      name: acc.name,
      type: acc.type,
      purpose: acc.purpose,
      currency: acc.currency,
      currentBalance: acc.currentBalance,
      isActive: acc.isActive,
      transactions: acc.transactions,
      holdings: acc.holdings,
      contributions: acc.contributions,
      dividends: acc.dividends,
    })),
    goals: user.goals,
    recurringRules: user.recurringRules,
  };
}

// Permanently purge user account and all cascading data records
export async function purgeUserAccount(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User profile not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id: userId } });

    return {
      userId,
      status: "deleted",
      message: "Account and all associated financial records permanently purged.",
    };
  });
}
