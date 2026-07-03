import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType, AccountPurpose } from '@maplewealth/db';

export class CreateAccountDto {
  institution!: string;
  name!: string;
  type!: AccountType;
  purpose!: AccountPurpose;
  currentBalance!: number;
  currency?: string;
}

export class UpdateAccountDto {
  institution?: string;
  name?: string;
  type?: AccountType;
  purpose?: AccountPurpose;
  currentBalance?: number;
  currency?: string;
  isActive?: boolean;
}

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async create(userId: string, data: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        institution: data.institution,
        name: data.name,
        type: data.type,
        purpose: data.purpose,
        currentBalance: data.currentBalance,
        currency: data.currency || 'CAD',
      },
    });
  }

  async update(userId: string, id: string, data: UpdateAccountDto) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.account.update({
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

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.account.delete({
      where: { id },
    });
  }

  // Net worth calculation
  async calculateNetWorth(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
    });

    let assets = 0;
    let debt = 0;

    for (const acc of accounts) {
      const balance = Number(acc.currentBalance);
      if (acc.type === 'credit_card' || acc.type === 'loan') {
        debt += balance; // Usually credit balances are stored positive or negative, let's treat balance as positive debt
      } else {
        assets += balance;
      }
    }

    const netWorth = assets - debt;
    return {
      assets,
      debt,
      netWorth,
    };
  }
}
