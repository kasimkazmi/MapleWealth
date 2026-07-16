import type { PrismaClient, AccountType, AccountPurpose } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface CreateAccountInput {
  institution: string;
  name: string;
  type: AccountType;
  purpose: AccountPurpose;
  currentBalance: number;
  currency?: string;
}

export interface UpdateAccountInput {
  institution?: string;
  name?: string;
  type?: AccountType;
  purpose?: AccountPurpose;
  currentBalance?: number;
  currency?: string;
  isActive?: boolean;
}

export async function findAll(prisma: PrismaClient, userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function findOne(prisma: PrismaClient, userId: string, id: string) {
  const account = await prisma.account.findFirst({ where: { id, userId } });
  if (!account) {
    throw new HttpError(404, "Account not found");
  }
  return account;
}

export async function create(prisma: PrismaClient, userId: string, data: CreateAccountInput) {
  return prisma.account.create({
    data: {
      userId,
      institution: data.institution,
      name: data.name,
      type: data.type,
      purpose: data.purpose,
      currentBalance: data.currentBalance,
      currency: data.currency || "CAD",
    },
  });
}

export async function update(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateAccountInput,
) {
  await findOne(prisma, userId, id);

  return prisma.account.update({
    where: { id },
    data: {
      institution: data.institution,
      name: data.name,
      type: data.type,
      purpose: data.purpose,
      currentBalance: data.currentBalance,
      currency: data.currency,
      isActive: data.isActive,
    },
  });
}

export async function remove(prisma: PrismaClient, userId: string, id: string) {
  await findOne(prisma, userId, id);
  return prisma.account.delete({ where: { id } });
}

export async function calculateNetWorth(prisma: PrismaClient, userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
  });

  let assets = 0;
  let debt = 0;

  for (const acc of accounts) {
    const balance = Number(acc.currentBalance);
    if (acc.type === "credit_card" || acc.type === "loan") {
      debt += balance;
    } else {
      assets += balance;
    }
  }

  const netWorth = assets - debt;
  return { assets, debt, netWorth };
}
