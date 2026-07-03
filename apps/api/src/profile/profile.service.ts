import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async updateProfile(userId: string, data: {
    age?: number;
    annualSalary?: number;
    monthlyTakeHome?: number;
    monthlyExpenses?: number;
    targetNetWorth?: number;
  }) {
    const currentProfile = await this.prisma.financialProfile.findUnique({
      where: { userId },
    });

    const updateData: any = { ...data };
    if (data.monthlyTakeHome !== undefined && data.monthlyExpenses !== undefined) {
      updateData.savingsCapacity = data.monthlyTakeHome - data.monthlyExpenses;
    } else if (data.monthlyTakeHome !== undefined) {
      const expenses = currentProfile ? Number(currentProfile.monthlyExpenses) : 0;
      updateData.savingsCapacity = data.monthlyTakeHome - expenses;
    } else if (data.monthlyExpenses !== undefined) {
      const takeHome = currentProfile ? Number(currentProfile.monthlyTakeHome) : 0;
      updateData.savingsCapacity = takeHome - data.monthlyExpenses;
    }

    return this.prisma.financialProfile.upsert({
      where: { userId },
      create: {
        userId,
        age: data.age,
        annualSalary: data.annualSalary || 0,
        monthlyTakeHome: data.monthlyTakeHome || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
        savingsCapacity: updateData.savingsCapacity || 0,
        targetNetWorth: data.targetNetWorth || 100000,
      },
      update: updateData,
    });
  }
}
