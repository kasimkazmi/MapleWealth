import type { PrismaClient, Prisma, GoalType } from "@maplewealth/db";
import { HttpError } from "../request-context";

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: number;
}

export interface UpdateGoalInput {
  name?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: number;
}

export async function findAll(prisma: PrismaClient, userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { priority: "asc" },
  });

  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
  });

  const emergencyBalance = accounts
    .filter((a) => a.purpose === "emergency")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const vacationBalance = accounts
    .filter((a) => a.purpose === "vacation")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const assets = accounts
    .filter((a) => a.type !== "credit_card" && a.type !== "loan")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const debts = accounts
    .filter((a) => a.type === "credit_card" || a.type === "loan")
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const netWorth = assets - debts;

  return goals.map((goal) => {
    let currentAmount = Number(goal.currentAmount);

    if (goal.type === "emergency_fund") {
      currentAmount = emergencyBalance;
    } else if (goal.type === "vacation") {
      currentAmount = vacationBalance;
    } else if (goal.type === "net_worth") {
      currentAmount = netWorth;
    }

    return { ...goal, currentAmount };
  });
}

export async function create(prisma: PrismaClient, userId: string, data: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      priority: data.priority || 1,
    },
  });
}

export async function update(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateGoalInput,
) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }

  const updateData: Prisma.GoalUpdateInput = {};
  if (data.name) updateData.name = data.name;
  if (data.type) updateData.type = data.type;
  if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
  if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount;
  if (data.targetDate !== undefined)
    updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
  if (data.priority !== undefined) updateData.priority = data.priority;

  return prisma.goal.update({ where: { id }, data: updateData });
}
