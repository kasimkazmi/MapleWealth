import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalType } from '@maplewealth/db';
import type { Prisma } from '@maplewealth/db';

export class CreateGoalDto {
  name!: string;
  type!: GoalType;
  targetAmount!: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: number;
}

export class UpdateGoalDto {
  name?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: number;
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
    });

    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
    });

    // Sum accounts dynamically by purpose
    const emergencyBalance = accounts
      .filter((a) => a.purpose === 'emergency')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const vacationBalance = accounts
      .filter((a) => a.purpose === 'vacation')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const assets = accounts
      .filter((a) => a.type !== 'credit_card' && a.type !== 'loan')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const debts = accounts
      .filter((a) => a.type === 'credit_card' || a.type === 'loan')
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const netWorth = assets - debts;

    // Dynamically update goals matching automatic criteria
    return goals.map((goal) => {
      let currentAmount = Number(goal.currentAmount);

      if (goal.type === GoalType.emergency_fund) {
        currentAmount = emergencyBalance;
      } else if (goal.type === GoalType.vacation) {
        currentAmount = vacationBalance;
      } else if (goal.type === GoalType.net_worth) {
        currentAmount = netWorth;
      }

      return {
        ...goal,
        currentAmount,
      };
    });
  }

  async create(userId: string, data: CreateGoalDto) {
    return this.prisma.goal.create({
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

  async update(userId: string, id: string, data: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const updateData: Prisma.GoalUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.targetAmount !== undefined)
      updateData.targetAmount = data.targetAmount;
    if (data.currentAmount !== undefined)
      updateData.currentAmount = data.currentAmount;
    if (data.targetDate !== undefined)
      updateData.targetDate = data.targetDate
        ? new Date(data.targetDate)
        : null;
    if (data.priority !== undefined) updateData.priority = data.priority;

    return this.prisma.goal.update({
      where: { id },
      data: updateData,
    });
  }
}
