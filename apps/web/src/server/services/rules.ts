import type { PrismaClient } from "@maplewealth/db";
import { DEFAULT_APPROVED_HOLDINGS } from "./investment-policy";
import { getContributionRoom } from "./contributions";

export interface RuleResult {
  status: "pass" | "warn" | "fail";
  severity: "info" | "low" | "medium" | "high";
  message: string;
  recommended_action: string;
  source_rule: string;
}

// The absolute floor below which an emergency fund is a critical risk, regardless of
// what the user has configured as their own minimum/ideal targets. Not user-editable.
export const EF_CRITICAL_FLOOR = 1000;
// Fallback EF targets used only when the user hasn't created their own
// "Emergency Fund - Minimum" / "... - Ideal" Goal rows yet.
export const DEFAULT_EF_MINIMUM = 5000;
export const DEFAULT_EF_IDEAL = 8000;

export async function evaluateRules(prisma: PrismaClient, userId: string): Promise<RuleResult[]> {
  const results: RuleResult[] = [];

  const profile = await prisma.financialProfile.findUnique({ where: { userId } });
  const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });
  const holdings = await prisma.holding.findMany({ where: { userId } });
  const efGoals = await prisma.goal.findMany({
    where: { userId, type: "emergency_fund" },
  });
  const approvedHoldingRows = await prisma.approvedHolding.findMany({ where: { userId } });

  const income = profile ? Number(profile.annualSalary) : 0;

  const efMinGoal = efGoals.find((g) => g.name.toLowerCase().includes("minimum"));
  const efIdealGoal = efGoals.find((g) => g !== efMinGoal);
  const efMinTarget = efMinGoal ? Number(efMinGoal.targetAmount) : DEFAULT_EF_MINIMUM;
  const efIdealTarget = efIdealGoal ? Number(efIdealGoal.targetAmount) : DEFAULT_EF_IDEAL;

  const allowedETFs =
    approvedHoldingRows.length > 0
      ? approvedHoldingRows.map((r) => r.symbol.toUpperCase())
      : DEFAULT_APPROVED_HOLDINGS;

  const efBalance = accounts
    .filter((a) => a.purpose === "emergency")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const investmentBalance = accounts
    .filter(
      (a) => a.type === "tfsa" || a.type === "fhsa" || a.type === "rrsp" || a.type === "non_registered",
    )
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  // Rule 1: Emergency Fund Critical Check
  if (efBalance < EF_CRITICAL_FLOOR) {
    results.push({
      status: "fail",
      severity: "high",
      message: `Emergency fund balance is critically low ($${efBalance.toFixed(2)}).`,
      recommended_action: `Stop all investing immediately and allocate 100% of savings capacity to build a $${efMinTarget.toLocaleString("en-CA")} minimum emergency buffer in HISA.`,
      source_rule: "Emergency Fund Minimum Target",
    });
  } else if (efBalance < efMinTarget) {
    results.push({
      status: "warn",
      severity: "medium",
      message: `Emergency fund ($${efBalance.toFixed(2)}) is below your minimum buffer target of $${efMinTarget.toLocaleString("en-CA")}.`,
      recommended_action: `Allocate priority savings to your emergency fund account until it reaches at least $${efMinTarget.toLocaleString("en-CA")}.`,
      source_rule: "Emergency Fund Minimum Target",
    });
  } else if (efBalance < efIdealTarget) {
    results.push({
      status: "pass",
      severity: "info",
      message: `Emergency fund ($${efBalance.toFixed(2)}) is secure but below your ideal target of $${efIdealTarget.toLocaleString("en-CA")}.`,
      recommended_action: `Optionally top up emergency fund to $${efIdealTarget.toLocaleString("en-CA")} for complete peace of mind.`,
      source_rule: "Emergency Fund Ideal Target",
    });
  } else {
    results.push({
      status: "pass",
      severity: "info",
      message: `Emergency fund is fully funded ($${efBalance.toFixed(2)}).`,
      recommended_action: "You can comfortably focus on TFSA and registered investments.",
      source_rule: "Emergency Fund Ideal Target",
    });
  }

  // Rule 2: Investment prioritization before EF complete
  if (efBalance < efMinTarget && investmentBalance > 10) {
    results.push({
      status: "warn",
      severity: "medium",
      message: "Investing assets before securing the minimum emergency fund.",
      recommended_action: `Securing $${efMinTarget.toLocaleString("en-CA")} cash must precede any long-term index ETF investments.`,
      source_rule: "Priority Sequencing: EF -> TFSA",
    });
  }

  // Rule 2b/2c/2d: EF -> TFSA -> FHSA -> RRSP waterfall using real contribution-room figures
  const room = await getContributionRoom(prisma, userId);
  const fhsaContributedThisYear = room.fhsa.contributedThisYear;
  const rrspContributedThisYear = room.rrsp.contributed;

  if (efBalance >= efMinTarget && room.tfsa.roomRemaining > 0 && fhsaContributedThisYear > 0) {
    results.push({
      status: "warn",
      severity: "low",
      message: `Contributing to FHSA ($${fhsaContributedThisYear.toFixed(2)} this year) while $${room.tfsa.roomRemaining.toFixed(2)} of TFSA room remains unused.`,
      recommended_action:
        "Per the Canadian Master Plan priority order, max out TFSA room before directing new savings to FHSA (unless actively saving for an imminent home purchase).",
      source_rule: "Priority Sequencing: TFSA -> FHSA",
    });
  }

  if (efBalance >= efMinTarget && room.tfsa.roomRemaining > 0 && rrspContributedThisYear > 0) {
    results.push({
      status: "warn",
      severity: "low",
      message: `Contributing to RRSP ($${rrspContributedThisYear.toFixed(2)} this year) while $${room.tfsa.roomRemaining.toFixed(2)} of TFSA room remains unused.`,
      recommended_action:
        "Per the Canadian Master Plan priority order, max out TFSA room before directing new savings to RRSP.",
      source_rule: "Priority Sequencing: TFSA -> RRSP",
    });
  }

  if (room.fhsa.roomRemaining > 0 && rrspContributedThisYear > 0) {
    results.push({
      status: "warn",
      severity: "low",
      message: `Contributing to RRSP ($${rrspContributedThisYear.toFixed(2)} this year) while $${room.fhsa.roomRemaining.toFixed(2)} of FHSA room remains unused.`,
      recommended_action:
        "Per the Canadian Master Plan priority order, max out FHSA room before directing new savings to RRSP.",
      source_rule: "Priority Sequencing: FHSA -> RRSP",
    });
  }

  // Rule 3: Approved holdings guidelines
  const speculativeHoldings = holdings.filter((h) => !allowedETFs.includes(h.symbol.toUpperCase()));

  if (speculativeHoldings.length > 0) {
    const list = speculativeHoldings.map((h) => h.symbol).join(", ");
    results.push({
      status: "warn",
      severity: "medium",
      message: `Speculative or non-approved asset holdings found: ${list}.`,
      recommended_action: `MapleWealth advises focusing strictly on your approved investment policy (${allowedETFs.join(", ")}). Avoid individual stocks or options outside this list.`,
      source_rule: "Asset Class Guidelines",
    });
  }

  // Rule 4: RRSP income threshold
  const rrspContributions = await prisma.contribution.findMany({
    where: { userId, registeredAccountType: "rrsp" },
  });
  const rrspTotal = rrspContributions.reduce((sum, c) => sum + Number(c.amount), 0);

  if (income < 70000 && rrspTotal > 0) {
    results.push({
      status: "warn",
      severity: "low",
      message: `RRSP contributions recorded ($${rrspTotal.toFixed(2)}) but salary is $${income.toFixed(2)}.`,
      recommended_action:
        "Because your income is below $70,000 CAD, tax deductions from RRSP contributions are less optimal. Prioritize TFSA contribution room first.",
      source_rule: "RRSP Optimization Rule",
    });
  }

  // Rule 5: CRA Contribution Room Checks
  if (room.tfsa.overLimit) {
    results.push({
      status: "fail",
      severity: "high",
      message: `TFSA contribution limit exceeded by $${Math.abs(room.tfsa.roomRemaining).toFixed(2)}.`,
      recommended_action: `Withdraw excess TFSA funds immediately. Excess amounts are subject to a CRA penalty of 1% per month (approx. $${room.tfsa.estimatedPenalty.toFixed(2)}/mo).`,
      source_rule: "TFSA Contribution Limit",
    });
  }

  if (room.fhsa.overLimit) {
    results.push({
      status: "fail",
      severity: "high",
      message: `FHSA contribution limit exceeded.`,
      recommended_action: "Withdraw the excess contributions to avoid the 1% monthly penalty from the CRA.",
      source_rule: "FHSA Contribution Limit",
    });
  }

  if (room.rrsp.overLimit) {
    results.push({
      status: "fail",
      severity: "high",
      message: `RRSP contribution limit exceeded by $${(room.rrsp.contributed - room.rrsp.calculatedLimit).toFixed(2)}.`,
      recommended_action:
        "Reduce contributions immediately. Overcontributions exceeding the $2,000 buffer trigger a 1% monthly CRA penalty.",
      source_rule: "RRSP Contribution Limit",
    });
  }

  return results;
}
