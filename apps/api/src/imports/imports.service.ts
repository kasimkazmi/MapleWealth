import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionSource } from '@maplewealth/db';
import type { Prisma } from '@maplewealth/db';
import { randomUUID } from 'crypto';

export class ImportCsvDto {
  accountId!: string;
  csvContent!: string; // Base64 encoded or raw CSV text
  institution!: 'cibc' | 'neo' | 'wealthsimple';
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

@Injectable()
export class ImportsService {
  // In-memory cache for pending imports
  private pendingImports = new Map<
    string,
    {
      userId: string;
      accountId: string;
      transactions: ParsedTransaction[];
    }
  >();

  constructor(private prisma: PrismaService) {}

  async parseAndAnalyzeCsv(userId: string, data: ImportCsvDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const lines = data.csvContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length < 2) {
      throw new BadRequestException('CSV file is empty or missing headers');
    }

    const headers = lines[0].toLowerCase().split(',');
    const parsedTransactions: ParsedTransaction[] = [];

    // Simple CSV row parser
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]
        .split(',')
        .map((val) => val.trim().replace(/^["']|["']$/g, ''));
      if (row.length < headers.length) continue;

      let dateStr = '';
      let amount = 0;
      let description = '';
      let category = 'Uncategorized';

      // Parse depending on institution columns
      if (data.institution === 'cibc') {
        // Expected CIBC structure: Date, Description, Card Number (optional), Withdrawals, Deposits
        // e.g. 2026-06-01,Grocery Store,,150.00,
        const dateIdx = 0;
        const descIdx = 1;
        const withdrawalIdx = 3;
        const depositIdx = 4;

        dateStr = row[dateIdx];
        description = row[descIdx];

        const withdrawal = row[withdrawalIdx]
          ? parseFloat(row[withdrawalIdx])
          : 0;
        const deposit = row[depositIdx] ? parseFloat(row[depositIdx]) : 0;

        if (withdrawal > 0) {
          amount = -withdrawal; // expense is negative
        } else if (deposit > 0) {
          amount = deposit;
        }
      } else if (data.institution === 'neo') {
        // Expected Neo structure: Date, Description, Amount
        // e.g. 2026-06-01,Subscription,-15.99
        dateStr = row[0];
        description = row[1];
        amount = parseFloat(row[2]) || 0;
      } else if (data.institution === 'wealthsimple') {
        // Expected WS structure: Date, Transaction Type, Description, Amount
        // e.g. 2026-06-01,Buy,XEQT,-500.00
        dateStr = row[0];
        description = row[2];
        amount = parseFloat(row[3]) || 0;
      }

      if (!dateStr || isNaN(amount)) continue;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;

      // Basic categorization rule based on description keyword matches
      const descLower = description.toLowerCase();
      if (
        descLower.includes('grocery') ||
        descLower.includes('supermarket') ||
        descLower.includes('walmart')
      ) {
        category = 'Groceries';
      } else if (
        descLower.includes('cibc savings') ||
        descLower.includes('neo savings') ||
        descLower.includes('transfer')
      ) {
        category = 'Transfer';
      } else if (
        descLower.includes('xeqt') ||
        descLower.includes('wealthsimple') ||
        descLower.includes('invest')
      ) {
        category = 'Investment';
      } else if (descLower.includes('rent') || descLower.includes('landlord')) {
        category = 'Housing';
      } else if (
        descLower.includes('starbucks') ||
        descLower.includes('restaurant') ||
        descLower.includes('uber')
      ) {
        category = 'Dining Out';
      }

      parsedTransactions.push({
        id: randomUUID(),
        date: date.toISOString().split('T')[0],
        amount,
        category,
        merchant: description,
        description: `Imported from ${data.institution} statement`,
        isDuplicate: false,
      });
    }

    // Deduplication check: Query existing transactions in this account and flag potential duplicates
    // Rule: Duplicate if there's a transaction on the same date +/- 2 days with the exact same amount
    const existingTransactions = await this.prisma.transaction.findMany({
      where: { accountId: data.accountId, userId },
    });

    for (const parsed of parsedTransactions) {
      const parsedDate = new Date(parsed.date);

      const duplicate = existingTransactions.find((existing) => {
        const existingDate = new Date(existing.date);
        const dayDiff =
          Math.abs(existingDate.getTime() - parsedDate.getTime()) /
          (1000 * 60 * 60 * 24);

        return (
          dayDiff <= 2 &&
          Math.abs(Number(existing.amount) - parsed.amount) < 0.01
        );
      });

      if (duplicate) {
        parsed.isDuplicate = true;
      }
    }

    const importId = randomUUID();
    this.pendingImports.set(importId, {
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

  getImportStatus(userId: string, importId: string) {
    const pending = this.pendingImports.get(importId);
    if (!pending || pending.userId !== userId) {
      throw new NotFoundException(
        'Pending import session not found or already expired.',
      );
    }
    return {
      importId,
      accountId: pending.accountId,
      totalCount: pending.transactions.length,
      transactions: pending.transactions,
    };
  }

  // Commit transaction import to database, skipping flagged duplicates
  async commitImport(userId: string, importId: string, correlationId?: string) {
    const pending = this.pendingImports.get(importId);
    if (!pending || pending.userId !== userId) {
      throw new NotFoundException(
        'Pending import session not found or already expired.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: pending.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const importedRecords = [];
      let totalAmountAdded = 0;

      // Commit only non-duplicate transactions
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
            source: TransactionSource.csv,
          },
        });

        importedRecords.push(created);
        totalAmountAdded += t.amount;
      }

      // Update account balance
      await tx.account.update({
        where: { id: pending.accountId },
        data: {
          currentBalance: {
            increment: totalAmountAdded,
          },
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          entityType: 'import',
          entityId: importId,
          action: 'commit_csv',
          afterJson: {
            count: importedRecords.length,
            accountId: pending.accountId,
          },
          correlationId,
        },
      });

      // Clear from in-memory pending map
      this.pendingImports.delete(importId);

      return {
        importId,
        importedCount: importedRecords.length,
        balanceChange: totalAmountAdded,
        status: 'committed',
      };
    });
  }
}
