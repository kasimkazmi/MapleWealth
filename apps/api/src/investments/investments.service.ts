import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@maplewealth/db';
import type { Prisma } from '@maplewealth/db';

export class CreateHoldingDto {
  accountId!: string;
  symbol!: string;
  name!: string;
  assetType!: AssetType;
  quantity!: number;
  averageCost!: number;
  currentPrice!: number;
}

export class UpdateHoldingDto {
  quantity?: number;
  averageCost?: number;
  currentPrice?: number;
}

export class RecordTradeDto {
  accountId!: string;
  symbol!: string;
  name!: string;
  assetType!: AssetType;
  tradeType!: 'BUY' | 'SELL';
  quantity!: number; // positive
  price!: number; // trade price per unit
  fees?: number; // trading commission, default 0
  date!: string; // YYYY-MM-DD
}

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async getHoldings(userId: string) {
    return this.prisma.holding.findMany({
      where: { userId },
      include: {
        account: {
          select: { name: true, type: true },
        },
      },
    });
  }

  async createHolding(userId: string, data: CreateHoldingDto) {
    // Verify account ownership
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.holding.create({
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

  async updateHolding(userId: string, id: string, data: UpdateHoldingDto) {
    const holding = await this.prisma.holding.findFirst({
      where: { id, userId },
    });
    if (!holding) {
      throw new NotFoundException('Holding not found');
    }

    const updateData: Prisma.HoldingUpdateInput = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.averageCost !== undefined)
      updateData.averageCost = data.averageCost;
    if (data.currentPrice !== undefined)
      updateData.currentPrice = data.currentPrice;

    return this.prisma.holding.update({
      where: { id },
      data: updateData,
    });
  }

  // Record a trade (BUY / SELL) and dynamically adjust holding, account balance, and write transaction
  async recordTrade(userId: string, data: RecordTradeDto) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const symbol = data.symbol.toUpperCase();
      const totalCost = data.quantity * data.price + (data.fees || 0);

      // Check if user has an existing holding of this security in this account
      let holding = await tx.holding.findFirst({
        where: { accountId: data.accountId, symbol, userId },
      });

      if (data.tradeType === 'BUY') {
        // Confirm account has enough funds for the buy (only if cash/chequing/savings/investing account, don't check for debt)
        if (
          account.type !== 'credit_card' &&
          account.type !== 'loan' &&
          Number(account.currentBalance) < totalCost
        ) {
          throw new BadRequestException(
            'Insufficient funds in the account for this trade',
          );
        }

        if (holding) {
          // ACB (Adjusted Cost Base) calculation:
          // New ACB = (Previous Total Cost + Purchase Value + Buy Fees) / New Total Shares
          const prevTotalCost =
            Number(holding.quantity) * Number(holding.averageCost);
          const newQty = Number(holding.quantity) + data.quantity;
          const newACB = (prevTotalCost + totalCost) / newQty;

          holding = await tx.holding.update({
            where: { id: holding.id },
            data: {
              quantity: newQty,
              averageCost: newACB,
              currentPrice: data.price, // update current price to latest trade price
            },
          });
        } else {
          // Create new holding
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

        // Deduct balance from account
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            currentBalance: {
              decrement: totalCost,
            },
          },
        });

        // Add Transaction of type investment
        await tx.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            date: new Date(data.date),
            amount: -totalCost, // outflow
            currency: account.currency,
            category: 'Investment Buy',
            merchant: symbol,
            description: `Purchased ${data.quantity} shares of ${symbol} @ $${data.price}`,
            source: 'manual',
          },
        });

        // If it's a registered account (TFSA, FHSA, RRSP), log a contribution record!
        if (
          account.type === 'tfsa' ||
          account.type === 'fhsa' ||
          account.type === 'rrsp'
        ) {
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
      } else if (data.tradeType === 'SELL') {
        if (!holding || Number(holding.quantity) < data.quantity) {
          throw new BadRequestException(
            'Insufficient shares in holding to execute this sell',
          );
        }

        const newQty = Number(holding.quantity) - data.quantity;
        const sellValue = data.quantity * data.price - (data.fees || 0);

        // Capital gain/loss calculation:
        // Gain = Proceeds - (ACB * Shares Sold) - Sell Fees
        const acbPerShare = Number(holding.averageCost);
        const realizedGain = sellValue - acbPerShare * data.quantity;

        if (newQty === 0) {
          await tx.holding.delete({
            where: { id: holding.id },
          });
        } else {
          holding = await tx.holding.update({
            where: { id: holding.id },
            data: {
              quantity: newQty,
              currentPrice: data.price,
            },
          });
        }

        // Add balance to account
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            currentBalance: {
              increment: sellValue,
            },
          },
        });

        // Add Transaction
        await tx.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            date: new Date(data.date),
            amount: sellValue, // inflow
            currency: account.currency,
            category: 'Investment Sell',
            merchant: symbol,
            description: `Sold ${data.quantity} shares of ${symbol} @ $${data.price}. Realized Gain: $${realizedGain.toFixed(2)}`,
            source: 'manual',
          },
        });
      }

      return holding;
    });
  }

  // Calculate overall performance metrics (total cost, current value, gain/loss, yield)
  async getPerformance(userId: string) {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
    });

    let totalCost = 0;
    let totalValue = 0;

    for (const h of holdings) {
      const cost = Number(h.quantity) * Number(h.averageCost);
      const val = Number(h.quantity) * Number(h.currentPrice);
      totalCost += cost;
      totalValue += val;
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
}
