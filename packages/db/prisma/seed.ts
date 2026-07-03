import { PrismaClient, AccountType, AccountPurpose, GoalType, RecurringRuleType, Frequency, AssetType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Seed-only default credentials — change this password after first login in any shared environment.
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'ChangeMe123!';

async function main() {
  console.log('Seeding database...');

  // Read seed data from blueprint specs
  const seedDataPath = path.join(__dirname, '../../../blueprint/specs/seed-data.json');
  const seedRaw = fs.readFileSync(seedDataPath, 'utf-8');
  const seedData = JSON.parse(seedRaw);

  // Clean DB
  await prisma.session.deleteMany({});
  await prisma.authAccount.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.recurringRule.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.dividend.deleteMany({});
  await prisma.holding.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.financialProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default user
  const user = await prisma.user.create({
    data: {
      email: 'master@maplewealth.ca',
      name: 'Master',
      country: seedData.profile.country || 'Canada',
      baseCurrency: 'CAD',
    },
  });

  // Create login credentials for the seeded user so it can actually sign in.
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 12);
  await prisma.authAccount.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: 'credentials',
      password: passwordHash,
    },
  });
  console.log(`Seeded login: master@maplewealth.ca / ${SEED_USER_PASSWORD} (change this password after first login)`);

  // Create financial profile
  await prisma.financialProfile.create({
    data: {
      userId: user.id,
      age: seedData.profile.age,
      annualSalary: seedData.profile.annualSalary,
      monthlyTakeHome: seedData.profile.monthlyTakeHome,
      monthlyExpenses: seedData.profile.monthlyExpenses,
      savingsCapacity: seedData.profile.monthlyTakeHome - seedData.profile.monthlyExpenses,
      targetNetWorth: seedData.profile.targetNetWorth,
    },
  });

  // Create accounts
  const createdAccounts: { [name: string]: any } = {};
  for (const acc of seedData.accounts) {
    const createdAcc = await prisma.account.create({
      data: {
        userId: user.id,
        institution: acc.institution,
        name: acc.name,
        type: acc.type as AccountType,
        purpose: acc.purpose as AccountPurpose,
        currentBalance: acc.balance,
        currency: 'CAD',
        isActive: true,
      },
    });
    createdAccounts[acc.name] = createdAcc;
    console.log(`Created Account: ${acc.name}`);
  }

  // Create goals
  for (const goal of seedData.goals) {
    let goalType: GoalType = GoalType.custom;
    if (goal.name.toLowerCase().includes('emergency')) {
      goalType = GoalType.emergency_fund;
    } else if (goal.name.toLowerCase().includes('net worth')) {
      goalType = GoalType.net_worth;
    }

    await prisma.goal.create({
      data: {
        userId: user.id,
        name: goal.name,
        type: goalType,
        targetAmount: goal.target,
        currentAmount: goal.name.toLowerCase().includes('net worth')
          ? Object.values(createdAccounts).reduce((sum, current) => sum + Number(current.currentBalance), 0)
          : goal.name.toLowerCase().includes('minimum')
          ? Number(createdAccounts['CIBC Savings']?.currentBalance || 0)
          : Number(createdAccounts['CIBC Savings']?.currentBalance || 0),
        priority: 1,
      },
    });
    console.log(`Created Goal: ${goal.name}`);
  }

  // Create holdings
  for (const holding of seedData.holdings) {
    const acc = createdAccounts[holding.account];
    if (acc) {
      await prisma.holding.create({
        data: {
          userId: user.id,
          accountId: acc.id,
          symbol: holding.symbol,
          name: holding.name,
          assetType: holding.assetType as AssetType,
          quantity: holding.symbol === 'XEQT' ? 0.35 : 0.00, // tiny balance of $10
          averageCost: 28.57,
          currentPrice: 28.57,
        },
      });
      console.log(`Created Holding: ${holding.symbol}`);
    }
  }

  // Create recurring rules
  for (const rule of seedData.recurringRules) {
    const acc = createdAccounts[rule.account];
    if (acc) {
      await prisma.recurringRule.create({
        data: {
          userId: user.id,
          accountId: acc.id,
          type: rule.type as RecurringRuleType,
          amount: rule.amount,
          frequency: rule.frequency as Frequency,
          nextRunDate: new Date(),
          active: true,
        },
      });
      console.log(`Created Recurring Rule: ${rule.type} to ${rule.account}`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
