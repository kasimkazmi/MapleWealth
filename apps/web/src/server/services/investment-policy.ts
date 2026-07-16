import type { PrismaClient } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface AddApprovedHoldingInput {
  symbol: string;
}

// Used by rules.ts whenever a user has configured zero approved holdings, so existing
// users see no behavior change until they actively customize their list.
export const DEFAULT_APPROVED_HOLDINGS = ["XEQT", "VEQT", "VGRO"];

export async function findAll(prisma: PrismaClient, userId: string): Promise<string[]> {
  const rows = await prisma.approvedHolding.findMany({
    where: { userId },
    orderBy: { symbol: "asc" },
  });
  return rows.map((r) => r.symbol);
}

export async function add(
  prisma: PrismaClient,
  userId: string,
  data: AddApprovedHoldingInput,
): Promise<string[]> {
  const symbol = data.symbol.trim().toUpperCase();
  if (!symbol) {
    throw new HttpError(409, "Symbol cannot be empty.");
  }

  try {
    await prisma.approvedHolding.create({ data: { userId, symbol } });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new HttpError(409, `${symbol} is already in your approved list.`);
    }
    throw err;
  }

  return findAll(prisma, userId);
}

export async function remove(
  prisma: PrismaClient,
  userId: string,
  symbol: string,
): Promise<string[]> {
  const normalized = symbol.trim().toUpperCase();
  const existing = await prisma.approvedHolding.findFirst({
    where: { userId, symbol: normalized },
  });
  if (!existing) {
    throw new HttpError(404, `${normalized} is not in your approved list.`);
  }
  await prisma.approvedHolding.delete({ where: { id: existing.id } });
  return findAll(prisma, userId);
}
