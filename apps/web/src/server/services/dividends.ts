import type { PrismaClient } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface RecordDividendInput {
  accountId: string;
  holdingId: string;
  payDate: string;
  amount: number;
  reinvested: boolean;
  dripQuantity?: number;
}

export async function findAll(prisma: PrismaClient, userId: string) {
  return prisma.dividend.findMany({
    where: { userId },
    include: {
      account: { select: { name: true } },
      holding: { select: { symbol: true } },
    },
    orderBy: { payDate: "desc" },
  });
}

export async function create(prisma: PrismaClient, userId: string, data: RecordDividendInput) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new HttpError(404, "Account not found");
    }

    const holding = await tx.holding.findFirst({
      where: { id: data.holdingId, accountId: data.accountId, userId },
    });
    if (!holding) {
      throw new HttpError(404, "Holding not found in this account");
    }

    const dividend = await tx.dividend.create({
      data: {
        userId,
        accountId: data.accountId,
        holdingId: data.holdingId,
        payDate: new Date(data.payDate),
        amount: data.amount,
        reinvested: data.reinvested,
        dripQuantity: data.reinvested ? data.dripQuantity : null,
      },
    });

    if (data.reinvested) {
      if (!data.dripQuantity || data.dripQuantity <= 0) {
        throw new HttpError(
          400,
          "dripQuantity must be specified and greater than zero for reinvested dividends",
        );
      }

      const prevTotalCost = Number(holding.quantity) * Number(holding.averageCost);
      const newQty = Number(holding.quantity) + data.dripQuantity;
      const newACB = (prevTotalCost + data.amount) / newQty;

      await tx.holding.update({
        where: { id: holding.id },
        data: { quantity: newQty, averageCost: newACB },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          date: new Date(data.payDate),
          amount: 0,
          currency: account.currency,
          category: "Dividend Reinvestment",
          merchant: holding.symbol,
          description: `Reinvested $${data.amount} dividend for ${data.dripQuantity} shares of ${holding.symbol}`,
          source: "manual",
        },
      });
    } else {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { increment: data.amount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          date: new Date(data.payDate),
          amount: data.amount,
          currency: account.currency,
          category: "Dividend Payout",
          merchant: holding.symbol,
          description: `Received $${data.amount} cash dividend from ${holding.symbol}`,
          source: "manual",
        },
      });
    }

    return dividend;
  });
}
