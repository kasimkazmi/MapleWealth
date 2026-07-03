import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType } from '@maplewealth/db';

export class RecordContributionDto {
  accountId!: string;
  amount!: number;
  date!: string; // YYYY-MM-DD
}

@Injectable()
export class ContributionsService {
  constructor(private prisma: PrismaService) {}

  // Get contribution history
  async getContributions(userId: string, type?: AccountType, year?: number) {
    const where: any = { userId };
    if (type) {
      where.registeredAccountType = type;
    }
    if (year) {
      where.contributionYear = year;
    }

    return this.prisma.contribution.findMany({
      where,
      include: {
        account: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  // Record a manual contribution (if not automatically logged via trades)
  async recordContribution(userId: string, data: RecordContributionDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId }
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    if (account.type !== 'tfsa' && account.type !== 'fhsa' && account.type !== 'rrsp') {
      throw new BadRequestException('Contributions can only be recorded on TFSA, FHSA, or RRSP registered accounts');
    }

    const date = new Date(data.date);
    const contributionYear = date.getFullYear();

    return this.prisma.contribution.create({
      data: {
        userId,
        accountId: data.accountId,
        registeredAccountType: account.type,
        date,
        amount: data.amount,
        contributionYear
      }
    });
  }

  // Calculate live contribution room for TFSA, FHSA, and RRSP
  async getContributionRoom(userId: string) {
    const profile = await this.prisma.financialProfile.findUnique({
      where: { userId }
    });
    const currentYear = new Date().getFullYear();

    // 1. Fetch total contributions this year
    const contributions = await this.prisma.contribution.findMany({
      where: { userId, contributionYear: currentYear }
    });

    const tfsaContributed = contributions
      .filter((c) => c.registeredAccountType === 'tfsa')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const fhsaContributed = contributions
      .filter((c) => c.registeredAccountType === 'fhsa')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const rrspContributed = contributions
      .filter((c) => c.registeredAccountType === 'rrsp')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // 2. Setup TFSA calculations
    const tfsaLimit = 7000;
    // For MVP, assume a clean baseline room (or read from profile configuration, if we add carry forwards later).
    // Let's assume the user starts with the annual limit.
    const tfsaUnusedCarryForward = 0; // MVP baseline
    const tfsaRoom = tfsaLimit + tfsaUnusedCarryForward - tfsaContributed;

    // 3. Setup FHSA calculations
    const fhsaLimit = 8000;
    const fhsaLifetimeLimit = 40000;
    const pastFhsas = await this.prisma.contribution.findMany({
      where: { userId, registeredAccountType: 'fhsa' }
    });
    const fhsaLifetimeContributed = pastFhsas.reduce((sum, c) => sum + Number(c.amount), 0);

    const fhsaRoomLeft = Math.max(0, fhsaLimit - fhsaContributed);
    const fhsaLifetimeRoomLeft = Math.max(0, fhsaLifetimeLimit - fhsaLifetimeContributed);

    // 4. Setup RRSP calculations
    // RRSP room is based on 18% of prior year salary, maxing out at CRA cap ($32,490 for 2025, $33,830 for 2026)
    const priorSalary = profile ? Number(profile.annualSalary) : 0;
    const rrspCappedLimit = currentYear === 2026 ? 33830 : 32490;
    const rrspBaseLimit = Math.min(priorSalary * 0.18, rrspCappedLimit);
    const rrspRoom = Math.max(0, rrspBaseLimit - rrspContributed);

    return {
      year: currentYear,
      tfsa: {
        limit: tfsaLimit,
        contributed: tfsaContributed,
        roomRemaining: tfsaRoom,
        overLimit: tfsaRoom < 0,
        estimatedPenalty: tfsaRoom < 0 ? Math.abs(tfsaRoom) * 0.01 : 0
      },
      fhsa: {
        limit: fhsaLimit,
        lifetimeLimit: fhsaLifetimeLimit,
        contributedThisYear: fhsaContributed,
        lifetimeContributed: fhsaLifetimeContributed,
        roomRemaining: Math.min(fhsaRoomLeft, fhsaLifetimeRoomLeft),
        overLimit: fhsaContributed > fhsaLimit || fhsaLifetimeContributed > fhsaLifetimeLimit,
        estimatedPenalty: (fhsaContributed > fhsaLimit ? (fhsaContributed - fhsaLimit) * 0.01 : 0)
      },
      rrsp: {
        calculatedLimit: rrspBaseLimit,
        contributed: rrspContributed,
        roomRemaining: rrspRoom,
        // RRSP allows a $2,000 lifetime overcontribution buffer before penalties kick in
        overLimit: rrspContributed > rrspBaseLimit + 2000,
        estimatedPenalty: rrspContributed > rrspBaseLimit + 2000 ? (rrspContributed - rrspBaseLimit - 2000) * 0.01 : 0
      }
    };
  }
}
