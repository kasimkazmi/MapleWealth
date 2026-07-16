import type { PrismaClient, Prisma, AssetType } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface CreateHoldingInput {
  accountId: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  averageCost: number;
  currentPrice: number;
}

export interface UpdateHoldingInput {
  quantity?: number;
  averageCost?: number;
  currentPrice?: number;
}

export interface RecordTradeInput {
  accountId: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  tradeType: "BUY" | "SELL";
  quantity: number;
  price: number;
  fees?: number;
  date: string;
}

export async function getHoldings(prisma: PrismaClient, userId: string) {
  return prisma.holding.findMany({
    where: { userId },
    include: { account: { select: { name: true, type: true } } },
  });
}

export async function createHolding(
  prisma: PrismaClient,
  userId: string,
  data: CreateHoldingInput,
) {
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId },
  });
  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  return prisma.holding.create({
    data: {
      userId,
      accountId: data.accountId,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      assetType: data.assetType,
      quantity: data.quantity,
      averageCost: data.averageCost,
      currentPrice: data.currentPrice,
    },
  });
}

export async function updateHolding(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateHoldingInput,
) {
  const holding = await prisma.holding.findFirst({ where: { id, userId } });
  if (!holding) {
    throw new HttpError(404, "Holding not found");
  }

  const updateData: Prisma.HoldingUpdateInput = {};
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.averageCost !== undefined) updateData.averageCost = data.averageCost;
  if (data.currentPrice !== undefined) updateData.currentPrice = data.currentPrice;

  return prisma.holding.update({ where: { id }, data: updateData });
}

export async function recordTrade(
  prisma: PrismaClient,
  userId: string,
  data: RecordTradeInput,
) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new HttpError(404, "Account not found");
    }

    const symbol = data.symbol.toUpperCase();
    const totalCost = data.quantity * data.price + (data.fees || 0);

    let holding = await tx.holding.findFirst({
      where: { accountId: data.accountId, symbol, userId },
    });

    if (data.tradeType === "BUY") {
      if (
        account.type !== "credit_card" &&
        account.type !== "loan" &&
        Number(account.currentBalance) < totalCost
      ) {
        throw new HttpError(400, "Insufficient funds in the account for this trade");
      }

      if (holding) {
        const prevTotalCost = Number(holding.quantity) * Number(holding.averageCost);
        const newQty = Number(holding.quantity) + data.quantity;
        const newACB = (prevTotalCost + totalCost) / newQty;

        holding = await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: newQty, averageCost: newACB, currentPrice: data.price },
        });
      } else {
        holding = await tx.holding.create({
          data: {
            userId,
            accountId: data.accountId,
            symbol,
            name: data.name,
            assetType: data.assetType,
            quantity: data.quantity,
            averageCost: data.price + (data.fees || 0) / data.quantity,
            currentPrice: data.price,
          },
        });
      }

      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { decrement: totalCost } },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          date: new Date(data.date),
          amount: -totalCost,
          currency: account.currency,
          category: "Investment Buy",
          merchant: symbol,
          description: `Purchased ${data.quantity} shares of ${symbol} @ $${data.price}`,
          source: "manual",
        },
      });

      if (account.type === "tfsa" || account.type === "fhsa" || account.type === "rrsp") {
        await tx.contribution.create({
          data: {
            userId,
            accountId: data.accountId,
            registeredAccountType: account.type,
            date: new Date(data.date),
            amount: totalCost,
            contributionYear: new Date(data.date).getFullYear(),
          },
        });
      }
    } else if (data.tradeType === "SELL") {
      if (!holding || Number(holding.quantity) < data.quantity) {
        throw new HttpError(400, "Insufficient shares in holding to execute this sell");
      }

      const newQty = Number(holding.quantity) - data.quantity;
      const sellValue = data.quantity * data.price - (data.fees || 0);

      const acbPerShare = Number(holding.averageCost);
      const realizedGain = sellValue - acbPerShare * data.quantity;

      if (newQty === 0) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        holding = await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: newQty, currentPrice: data.price },
        });
      }

      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { increment: sellValue } },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          date: new Date(data.date),
          amount: sellValue,
          currency: account.currency,
          category: "Investment Sell",
          merchant: symbol,
          description: `Sold ${data.quantity} shares of ${symbol} @ $${data.price}. Realized Gain: $${realizedGain.toFixed(2)}`,
          source: "manual",
        },
      });
    }

    return holding;
  });
}

export async function getPerformance(prisma: PrismaClient, userId: string) {
  const holdings = await prisma.holding.findMany({ where: { userId } });

  let totalCost = 0;
  let totalValue = 0;

  for (const h of holdings) {
    totalCost += Number(h.quantity) * Number(h.averageCost);
    totalValue += Number(h.quantity) * Number(h.currentPrice);
  }

  const totalGain = totalValue - totalCost;
  const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalCost,
    totalValue,
    totalGain,
    gainPercentage,
    holdingsCount: holdings.length,
  };
}
