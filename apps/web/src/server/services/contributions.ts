import type { PrismaClient, Prisma, AccountType } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface RecordContributionInput {
  accountId: string;
  amount: number;
  date: string;
}

export async function getContributions(
  prisma: PrismaClient,
  userId: string,
  type?: AccountType,
  year?: number,
) {
  const where: Prisma.ContributionWhereInput = { userId };
  if (type) where.registeredAccountType = type;
  if (year) where.contributionYear = year;

  return prisma.contribution.findMany({
    where,
    include: { account: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
}

export async function recordContribution(
  prisma: PrismaClient,
  userId: string,
  data: RecordContributionInput,
) {
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId },
  });
  if (!account) {
    throw new HttpError(400, "Account not found");
  }
  if (account.type !== "tfsa" && account.type !== "fhsa" && account.type !== "rrsp") {
    throw new HttpError(
      400,
      "Contributions can only be recorded on TFSA, FHSA, or RRSP registered accounts",
    );
  }

  const date = new Date(data.date);
  const contributionYear = date.getFullYear();

  return prisma.contribution.create({
    data: {
      userId,
      accountId: data.accountId,
      registeredAccountType: account.type,
      date,
      amount: data.amount,
      contributionYear,
    },
  });
}

// Calculate live contribution room for TFSA, FHSA, and RRSP
export async function getContributionRoom(prisma: PrismaClient, userId: string) {
  const profile = await prisma.financialProfile.findUnique({ where: { userId } });
  const currentYear = new Date().getFullYear();

  const contributions = await prisma.contribution.findMany({
    where: { userId, contributionYear: currentYear },
  });

  const tfsaContributed = contributions
    .filter((c) => c.registeredAccountType === "tfsa")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const fhsaContributed = contributions
    .filter((c) => c.registeredAccountType === "fhsa")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const rrspContributed = contributions
    .filter((c) => c.registeredAccountType === "rrsp")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // TFSA
  const tfsaLimit = 7000;
  const tfsaCarryForwardBase = profile ? Number(profile.tfsaCarryForwardBase) : 0;
  const tfsaRoom = tfsaLimit + tfsaCarryForwardBase - tfsaContributed;

  // FHSA (single-year carry-forward, capped at $8,000)
  const fhsaLimit = 8000;
  const fhsaLifetimeLimit = 40000;
  const fhsaCarryForwardBase = profile
    ? Math.min(Number(profile.fhsaCarryForwardBase), fhsaLimit)
    : 0;
  const pastFhsas = await prisma.contribution.findMany({
    where: { userId, registeredAccountType: "fhsa" },
  });
  const fhsaLifetimeContributed = pastFhsas.reduce((sum, c) => sum + Number(c.amount), 0);

  const fhsaRoomLeft = Math.max(0, fhsaLimit + fhsaCarryForwardBase - fhsaContributed);
  const fhsaLifetimeRoomLeft = Math.max(0, fhsaLifetimeLimit - fhsaLifetimeContributed);

  // RRSP
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
      estimatedPenalty: tfsaRoom < 0 ? Math.abs(tfsaRoom) * 0.01 : 0,
    },
    fhsa: {
      limit: fhsaLimit,
      carryForwardBase: fhsaCarryForwardBase,
      lifetimeLimit: fhsaLifetimeLimit,
      contributedThisYear: fhsaContributed,
      lifetimeContributed: fhsaLifetimeContributed,
      roomRemaining: Math.min(fhsaRoomLeft, fhsaLifetimeRoomLeft),
      overLimit:
        fhsaContributed > fhsaLimit + fhsaCarryForwardBase ||
        fhsaLifetimeContributed > fhsaLifetimeLimit,
      estimatedPenalty:
        fhsaContributed > fhsaLimit + fhsaCarryForwardBase
          ? (fhsaContributed - fhsaLimit - fhsaCarryForwardBase) * 0.01
          : 0,
    },
    rrsp: {
      calculatedLimit: rrspBaseLimit,
      isEstimate: rrspIsEstimate,
      contributed: rrspContributed,
      roomRemaining: rrspRoom,
      overLimit: rrspContributed > rrspBaseLimit + 2000,
      estimatedPenalty:
        rrspContributed > rrspBaseLimit + 2000
          ? (rrspContributed - rrspBaseLimit - 2000) * 0.01
          : 0,
    },
  };
}
