import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class RecordDividendDto {
  accountId!: string;
  holdingId!: string;
  payDate!: string; // YYYY-MM-DD
  amount!: number;
  reinvested!: boolean;
  dripQuantity?: number;
}

@Injectable()
export class DividendsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.dividend.findMany({
      where: { userId },
      include: {
        account: {
          select: { name: true }
        },
        holding: {
          select: { symbol: true }
        }
      },
      orderBy: { payDate: 'desc' }
    });
  }

  async create(userId: string, data: RecordDividendDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate account and holding
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId }
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const holding = await tx.holding.findFirst({
        where: { id: data.holdingId, accountId: data.accountId, userId }
      });
      if (!holding) {
        throw new NotFoundException('Holding not found in this account');
      }

      // 2. Create dividend record
      const dividend = await tx.dividend.create({
        data: {
          userId,
          accountId: data.accountId,
          holdingId: data.holdingId,
          payDate: new Date(data.payDate),
          amount: data.amount,
          reinvested: data.reinvested,
          dripQuantity: data.reinvested ? data.dripQuantity : null
        }
      });

      // 3. Handle cash and holdings updates based on DRIP setting
      if (data.reinvested) {
        if (!data.dripQuantity || data.dripQuantity <= 0) {
          throw new BadRequestException('dripQuantity must be specified and greater than zero for reinvested dividends');
        }

        // Reinvested Dividend:
        // - Holding quantity increases by dripQuantity.
        // - ACB (averageCost) recalculation:
        //   New Average Cost = (Prev Qty * Prev Avg Cost + Reinvested Amount) / New Qty
        const prevTotalCost = Number(holding.quantity) * Number(holding.averageCost);
        const newQty = Number(holding.quantity) + data.dripQuantity;
        const newACB = (prevTotalCost + data.amount) / newQty;

        await tx.holding.update({
          where: { id: holding.id },
          data: {
            quantity: newQty,
            averageCost: newACB
          }
        });

        // Add Transaction of type investment reinvestment (net-zero impact on cash balance because cash was received and immediately spent, but let's log the transaction for tracking)
        await tx.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            date: new Date(data.payDate),
            amount: 0, // net-zero cash transaction
            currency: account.currency,
            category: 'Dividend Reinvestment',
            merchant: holding.symbol,
            description: `Reinvested $${data.amount} dividend for ${data.dripQuantity} shares of ${holding.symbol}`,
            source: 'manual'
          }
        });

      } else {
        // Cash Dividend:
        // - Account balance increases by dividend amount.
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            currentBalance: {
              increment: data.amount
            }
          }
        });

        // Add Transaction of type inflow
        await tx.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            date: new Date(data.payDate),
            amount: data.amount,
            currency: account.currency,
            category: 'Dividend Payout',
            merchant: holding.symbol,
            description: `Received $${data.amount} cash dividend from ${holding.symbol}`,
            source: 'manual'
          }
        });
      }

      return dividend;
    });
  }
}
