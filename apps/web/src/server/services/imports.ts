import { randomUUID } from "crypto";
import type { PrismaClient } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface ImportCsvInput {
  accountId: string;
  csvContent: string;
  institution: "cibc" | "neo" | "wealthsimple";
}

export interface ParsedTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description: string;
  isDuplicate: boolean;
}

// In-memory cache for pending imports, module-scoped to mirror the previous NestJS
// Injectable's per-process singleton state. LANDMINE (carried forward unchanged from the
// original NestJS ImportsService): this Map is not persisted anywhere, so pending imports
// are lost on process restart and are NOT shared across instances — this will not survive
// multi-instance/serverless deployment (e.g. Vercel functions, PM2 clustering). Acceptable
// only for single-instance deployment, same limitation as the app had before this port.
const pendingImports = new Map<
  string,
  { userId: string; accountId: string; transactions: ParsedTransaction[] }
>();

export async function parseAndAnalyzeCsv(
  prisma: PrismaClient,
  userId: string,
  data: ImportCsvInput,
) {
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId },
  });
  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  const lines = data.csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new HttpError(400, "CSV file is empty or missing headers");
  }

  const parsedTransactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((val) => val.trim().replace(/^["']|["']$/g, ""));
    const headers = lines[0].toLowerCase().split(",");
    if (row.length < headers.length) continue;

    let dateStr = "";
    let amount = 0;
    let description = "";
    let category = "Uncategorized";

    if (data.institution === "cibc") {
      const dateIdx = 0;
      const descIdx = 1;
      const withdrawalIdx = 3;
      const depositIdx = 4;

      dateStr = row[dateIdx];
      description = row[descIdx];

      const withdrawal = row[withdrawalIdx] ? parseFloat(row[withdrawalIdx]) : 0;
      const deposit = row[depositIdx] ? parseFloat(row[depositIdx]) : 0;

      if (withdrawal > 0) {
        amount = -withdrawal;
      } else if (deposit > 0) {
        amount = deposit;
      }
    } else if (data.institution === "neo") {
      dateStr = row[0];
      description = row[1];
      amount = parseFloat(row[2]) || 0;
    } else if (data.institution === "wealthsimple") {
      dateStr = row[0];
      description = row[2];
      amount = parseFloat(row[3]) || 0;
    }

    if (!dateStr || isNaN(amount)) continue;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) continue;

    const descLower = description.toLowerCase();
    if (descLower.includes("grocery") || descLower.includes("supermarket") || descLower.includes("walmart")) {
      category = "Groceries";
    } else if (
      descLower.includes("cibc savings") ||
      descLower.includes("neo savings") ||
      descLower.includes("transfer")
    ) {
      category = "Transfer";
    } else if (descLower.includes("xeqt") || descLower.includes("wealthsimple") || descLower.includes("invest")) {
      category = "Investment";
    } else if (descLower.includes("rent") || descLower.includes("landlord")) {
      category = "Housing";
    } else if (descLower.includes("starbucks") || descLower.includes("restaurant") || descLower.includes("uber")) {
      category = "Dining Out";
    }

    parsedTransactions.push({
      id: randomUUID(),
      date: date.toISOString().split("T")[0],
      amount,
      category,
      merchant: description,
      description: `Imported from ${data.institution} statement`,
      isDuplicate: false,
    });
  }

  // Deduplication: same date +/- 2 days, same amount
  const existingTransactions = await prisma.transaction.findMany({
    where: { accountId: data.accountId, userId },
  });

  for (const parsed of parsedTransactions) {
    const parsedDate = new Date(parsed.date);

    const duplicate = existingTransactions.find((existing) => {
      const existingDate = new Date(existing.date);
      const dayDiff = Math.abs(existingDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
      return dayDiff <= 2 && Math.abs(Number(existing.amount) - parsed.amount) < 0.01;
    });

    if (duplicate) {
      parsed.isDuplicate = true;
    }
  }

  const importId = randomUUID();
  pendingImports.set(importId, {
    userId,
    accountId: data.accountId,
    transactions: parsedTransactions,
  });

  return {
    importId,
    accountId: data.accountId,
    totalCount: parsedTransactions.length,
    duplicateCount: parsedTransactions.filter((t) => t.isDuplicate).length,
    transactions: parsedTransactions,
  };
}

export function getImportStatus(userId: string, importId: string) {
  const pending = pendingImports.get(importId);
  if (!pending || pending.userId !== userId) {
    throw new HttpError(404, "Pending import session not found or already expired.");
  }
  return {
    importId,
    accountId: pending.accountId,
    totalCount: pending.transactions.length,
    transactions: pending.transactions,
  };
}

export async function commitImport(
  prisma: PrismaClient,
  userId: string,
  importId: string,
  correlationId?: string,
) {
  const pending = pendingImports.get(importId);
  if (!pending || pending.userId !== userId) {
    throw new HttpError(404, "Pending import session not found or already expired.");
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: pending.accountId, userId },
    });
    if (!account) {
      throw new HttpError(404, "Account not found");
    }

    const importedRecords = [];
    let totalAmountAdded = 0;

    for (const t of pending.transactions) {
      if (t.isDuplicate) continue;

      const created = await tx.transaction.create({
        data: {
          userId,
          accountId: pending.accountId,
          date: new Date(t.date),
          amount: t.amount,
          currency: account.currency,
          category: t.category,
          merchant: t.merchant,
          description: t.description,
          source: "csv",
        },
      });

      importedRecords.push(created);
      totalAmountAdded += t.amount;
    }

    await tx.account.update({
      where: { id: pending.accountId },
      data: { currentBalance: { increment: totalAmountAdded } },
    });

    await tx.auditLog.create({
      data: {
        userId,
        entityType: "import",
        entityId: importId,
        action: "commit_csv",
        afterJson: { count: importedRecords.length, accountId: pending.accountId },
        correlationId,
      },
    });

    pendingImports.delete(importId);

    return {
      importId,
      importedCount: importedRecords.length,
      balanceChange: totalAmountAdded,
      status: "committed",
    };
  });
}
