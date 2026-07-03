import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Export full user dataset for GDPR/PIPEDA compliance
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        financialProfile: true,
        accounts: {
          include: {
            transactions: true,
            holdings: true,
            contributions: true,
            dividends: true,
          }
        },
        goals: true,
        recurringRules: true,
      }
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      exportedAt: new Date().toISOString(),
      formatVersion: '1.0',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        baseCurrency: user.baseCurrency,
        createdAt: user.createdAt,
      },
      financialProfile: user.financialProfile,
      accounts: user.accounts.map(acc => ({
        id: acc.id,
        institution: acc.institution,
        name: acc.name,
        type: acc.type,
        purpose: acc.purpose,
        currency: acc.currency,
        currentBalance: acc.currentBalance,
        isActive: acc.isActive,
        transactions: acc.transactions,
        holdings: acc.holdings,
        contributions: acc.contributions,
        dividends: acc.dividends
      })),
      goals: user.goals,
      recurringRules: user.recurringRules
    };
  }

  // Permantently purge user account and all cascading data records
  async purgeUserAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Deletes user from DB (Cascades delete profile, accounts, transactions, holdings, contributions, dividends, rules, goals, and sessions)
      await tx.user.delete({
        where: { id: userId }
      });

      return {
        userId,
        status: 'deleted',
        message: 'Account and all associated financial records permanently purged.'
      };
    });
  }
}
