import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionSource } from '@maplewealth/db';
import type { Prisma } from '@maplewealth/db';

export class CreateTransactionDto {
  accountId!: string;
  date!: string;
  amount!: number;
  category!: string;
  merchant?: string;
  description?: string;
  source?: TransactionSource;
}

export class UpdateTransactionDto {
  date?: string;
  amount?: number;
  category?: string;
  merchant?: string;
  description?: string;
  source?: TransactionSource;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters: {
      accountId?: string;
      from?: string;
      to?: string;
      category?: string;
    },
  ) {
    const whereClause: Prisma.TransactionWhereInput = { userId };

    if (filters.accountId) {
      whereClause.accountId = filters.accountId;
    }
    if (filters.category) {
      whereClause.category = filters.category;
    }
    if (filters.from || filters.to) {
      whereClause.date = {};
      if (filters.from) {
        whereClause.date.gte = new Date(filters.from);
      }
      if (filters.to) {
        whereClause.date.lte = new Date(filters.to);
      }
    }

    return this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: {
          select: { name: true, institution: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async create(
    userId: string,
    data: CreateTransactionDto,
    correlationId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get account
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // 2. Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          date: new Date(data.date),
          amount: data.amount,
          currency: account.currency,
          category: data.category,
          merchant: data.merchant,
          description: data.description,
          source: data.source || TransactionSource.manual,
        },
      });

      // 3. Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          currentBalance: {
            increment: data.amount,
          },
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          entityType: 'transaction',
          entityId: transaction.id,
          action: 'create',
          afterJson: transaction,
          correlationId,
        },
      });

      return transaction;
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateTransactionDto,
    correlationId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!oldTx) {
        throw new NotFoundException('Transaction not found');
      }

      const updatedData: Prisma.TransactionUpdateInput = {};
      if (data.date) updatedData.date = new Date(data.date);
      if (data.amount !== undefined) updatedData.amount = data.amount;
      if (data.category) updatedData.category = data.category;
      if (data.merchant !== undefined) updatedData.merchant = data.merchant;
      if (data.description !== undefined)
        updatedData.description = data.description;
      if (data.source) updatedData.source = data.source;

      const newTx = await tx.transaction.update({
        where: { id },
        data: updatedData,
      });

      // Adjust account balance if amount changed
      if (data.amount !== undefined && Number(oldTx.amount) !== data.amount) {
        const diff = data.amount - Number(oldTx.amount);
        await tx.account.update({
          where: { id: oldTx.accountId },
          data: {
            currentBalance: {
              increment: diff,
            },
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          entityType: 'transaction',
          entityId: id,
          action: 'update',
          beforeJson: oldTx,
          afterJson: newTx,
          correlationId,
        },
      });

      return newTx;
    });
  }

  async remove(userId: string, id: string, correlationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Revert account balance (decrement the added amount)
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: {
            decrement: transaction.amount,
          },
        },
      });

      await tx.transaction.delete({
        where: { id },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          entityType: 'transaction',
          entityId: id,
          action: 'delete',
          beforeJson: transaction,
          correlationId,
        },
      });

      return transaction;
    });
  }
}
