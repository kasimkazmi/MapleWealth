import type { PrismaClient, Prisma, TransactionSource } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface CreateTransactionInput {
  accountId: string;
  date: string;
  amount: number;
  category: string;
  merchant?: string;
  description?: string;
  source?: TransactionSource;
}

export interface UpdateTransactionInput {
  date?: string;
  amount?: number;
  category?: string;
  merchant?: string;
  description?: string;
  source?: TransactionSource;
}

export async function findAll(
  prisma: PrismaClient,
  userId: string,
  filters: { accountId?: string; from?: string; to?: string; category?: string },
) {
  const whereClause: Prisma.TransactionWhereInput = { userId };

  if (filters.accountId) whereClause.accountId = filters.accountId;
  if (filters.category) whereClause.category = filters.category;
  if (filters.from || filters.to) {
    whereClause.date = {};
    if (filters.from) whereClause.date.gte = new Date(filters.from);
    if (filters.to) whereClause.date.lte = new Date(filters.to);
  }

  return prisma.transaction.findMany({
    where: whereClause,
    include: {
      account: { select: { name: true, institution: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function findOne(prisma: PrismaClient, userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!transaction) {
    throw new HttpError(404, "Transaction not found");
  }
  return transaction;
}

export async function create(
  prisma: PrismaClient,
  userId: string,
  data: CreateTransactionInput,
  correlationId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new HttpError(404, "Account not found");
    }

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
        source: data.source || "manual",
      },
    });

    await tx.account.update({
      where: { id: data.accountId },
      data: { currentBalance: { increment: data.amount } },
    });

    await tx.auditLog.create({
      data: {
        userId,
        entityType: "transaction",
        entityId: transaction.id,
        action: "create",
        afterJson: transaction,
        correlationId,
      },
    });

    return transaction;
  });
}

export async function update(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateTransactionInput,
  correlationId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const oldTx = await tx.transaction.findFirst({ where: { id, userId } });
    if (!oldTx) {
      throw new HttpError(404, "Transaction not found");
    }

    const updatedData: Prisma.TransactionUpdateInput = {};
    if (data.date) updatedData.date = new Date(data.date);
    if (data.amount !== undefined) updatedData.amount = data.amount;
    if (data.category) updatedData.category = data.category;
    if (data.merchant !== undefined) updatedData.merchant = data.merchant;
    if (data.description !== undefined) updatedData.description = data.description;
    if (data.source) updatedData.source = data.source;

    const newTx = await tx.transaction.update({ where: { id }, data: updatedData });

    if (data.amount !== undefined && Number(oldTx.amount) !== data.amount) {
      const diff = data.amount - Number(oldTx.amount);
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { increment: diff } },
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        entityType: "transaction",
        entityId: id,
        action: "update",
        beforeJson: oldTx,
        afterJson: newTx,
        correlationId,
      },
    });

    return newTx;
  });
}

export async function remove(
  prisma: PrismaClient,
  userId: string,
  id: string,
  correlationId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, userId } });
    if (!transaction) {
      throw new HttpError(404, "Transaction not found");
    }

    await tx.account.update({
      where: { id: transaction.accountId },
      data: { currentBalance: { decrement: transaction.amount } },
    });

    await tx.transaction.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId,
        entityType: "transaction",
        entityId: id,
        action: "delete",
        beforeJson: transaction,
        correlationId,
      },
    });

    return transaction;
  });
}
