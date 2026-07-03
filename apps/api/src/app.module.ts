import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GoalsModule } from './goals/goals.module';
import { InvestmentsModule } from './investments/investments.module';
import { ContributionsModule } from './contributions/contributions.module';
import { DividendsModule } from './dividends/dividends.module';
import { ProjectionsModule } from './projections/projections.module';
import { RulesModule } from './rules/rules.module';
import { ImportsModule } from './imports/imports.module';

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    AccountsModule,
    TransactionsModule,
    GoalsModule,
    InvestmentsModule,
    ContributionsModule,
    DividendsModule,
    ProjectionsModule,
    RulesModule,
    ImportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
