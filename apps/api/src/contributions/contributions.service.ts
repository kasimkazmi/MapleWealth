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
    // Carry-forward base is manually entered by the user from CRA My Account, since CRA is the
    // only authoritative source for unused prior-year room and there is no public API for it.
    // It represents unused room accumulated as of Jan 1 of the current year.
    const tfsaLimit = 7000;
    const tfsaCarryForwardBase = profile ? Number(profile.tfsaCarryForwardBase) : 0;
    const tfsaRoom = tfsaLimit + tfsaCarryForwardBase - tfsaContributed;

    // 3. Setup FHSA calculations
    // CRA allows only a single year of FHSA carry-forward, capped at $8,000, so
    // fhsaCarryForwardBase should never exceed 8000 when the user enters it.
    const fhsaLimit = 8000;
    const fhsaLifetimeLimit = 40000;
    const fhsaCarryForwardBase = profile ? Math.min(Number(profile.fhsaCarryForwardBase), fhsaLimit) : 0;
    const pastFhsas = await this.prisma.contribution.findMany({
      where: { userId, registeredAccountType: 'fhsa' }
    });
    const fhsaLifetimeContributed = pastFhsas.reduce((sum, c) => sum + Number(c.amount), 0);

    const fhsaRoomLeft = Math.max(0, fhsaLimit + fhsaCarryForwardBase - fhsaContributed);
    const fhsaLifetimeRoomLeft = Math.max(0, fhsaLifetimeLimit - fhsaLifetimeContributed);

    // 4. Setup RRSP calculations
    // rrspKnownRoom is the deduction limit from the user's latest CRA Notice of Assessment
    // (as of Jan 1 of the current year), which already bakes in all prior-year carry-forward.
    // If the user hasn't entered it yet, fall back to an estimate: 18% of current salary,
    // capped at the CRA dollar max ($32,490 for 2025, $33,830 for 2026). This estimate omits
    // carry-forward and uses current- rather than prior-year salary, so it understates real room.
    const rrspKnownRoom = profile ? Number(profile.rrspKnownRoom) : 0;
    const priorSalary = profile ? Number(profile.annualSalary) : 0;
    const rrspCappedLimit = currentYear === 2026 ? 33830 : 32490;
    const rrspEstimatedLimit = Math.min(priorSalary * 0.18, rrspCappedLimit);
    const rrspIsEstimate = rrspKnownRoom <= 0;
    const rrspBaseLimit = rrspIsEstimate ? rrspEstimatedLimit : rrspKnownRoom;
    const rrspRoom = Math.max(0, rrspBaseLimit - rrspContributed);

    return {
      year: currentYear,
      tfsa: {
        limit: tfsaLimit,
        carryForwardBase: tfsaCarryForwardBase,
        contributed: tfsaContributed,
        roomRemaining: tfsaRoom,
        overLimit: tfsaRoom < 0,
        estimatedPenalty: tfsaRoom < 0 ? Math.abs(tfsaRoom) * 0.01 : 0
      },
      fhsa: {
        limit: fhsaLimit,
        carryForwardBase: fhsaCarryForwardBase,
        lifetimeLimit: fhsaLifetimeLimit,
        contributedThisYear: fhsaContributed,
        lifetimeContributed: fhsaLifetimeContributed,
        roomRemaining: Math.min(fhsaRoomLeft, fhsaLifetimeRoomLeft),
        overLimit: fhsaContributed > fhsaLimit + fhsaCarryForwardBase || fhsaLifetimeContributed > fhsaLifetimeLimit,
        estimatedPenalty: (fhsaContributed > fhsaLimit + fhsaCarryForwardBase ? (fhsaContributed - fhsaLimit - fhsaCarryForwardBase) * 0.01 : 0)
      },
      rrsp: {
        calculatedLimit: rrspBaseLimit,
        isEstimate: rrspIsEstimate,
        contributed: rrspContributed,
        roomRemaining: rrspRoom,
        // RRSP allows a $2,000 lifetime overcontribution buffer before penalties kick in
        overLimit: rrspContributed > rrspBaseLimit + 2000,
        estimatedPenalty: rrspContributed > rrspBaseLimit + 2000 ? (rrspContributed - rrspBaseLimit - 2000) * 0.01 : 0
      }
    };
  }
}
