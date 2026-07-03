import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@maplewealth/db';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.financialProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: {
      age?: number;
      annualSalary?: number;
      monthlyTakeHome?: number;
      monthlyExpenses?: number;
      targetNetWorth?: number;
      tfsaCarryForwardBase?: number;
      fhsaCarryForwardBase?: number;
      rrspKnownRoom?: number;
    },
  ) {
    const currentProfile = await this.prisma.financialProfile.findUnique({
      where: { userId },
    });

    let savingsCapacity: number | undefined;
    if (
      data.monthlyTakeHome !== undefined &&
      data.monthlyExpenses !== undefined
    ) {
      savingsCapacity = data.monthlyTakeHome - data.monthlyExpenses;
    } else if (data.monthlyTakeHome !== undefined) {
      const expenses = currentProfile
        ? Number(currentProfile.monthlyExpenses)
        : 0;
      savingsCapacity = data.monthlyTakeHome - expenses;
    } else if (data.monthlyExpenses !== undefined) {
      const takeHome = currentProfile
        ? Number(currentProfile.monthlyTakeHome)
        : 0;
      savingsCapacity = takeHome - data.monthlyExpenses;
    }

    const updateData: Prisma.FinancialProfileUpdateInput = {
      ...data,
      savingsCapacity,
    };

    return this.prisma.financialProfile.upsert({
      where: { userId },
      create: {
        userId,
        age: data.age,
        annualSalary: data.annualSalary || 0,
        monthlyTakeHome: data.monthlyTakeHome || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
        savingsCapacity: savingsCapacity || 0,
        targetNetWorth: data.targetNetWorth || 100000,
        tfsaCarryForwardBase: data.tfsaCarryForwardBase || 0,
        fhsaCarryForwardBase: data.fhsaCarryForwardBase || 0,
        rrspKnownRoom: data.rrspKnownRoom || 0,
      },
      update: updateData,
    });
  }
}
