import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { RulesModule } from '../rules/rules.module';
import { ContributionsModule } from '../contributions/contributions.module';

@Module({
  imports: [RulesModule, ContributionsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
