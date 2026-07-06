import { Module } from '@nestjs/common';
import { InvestmentPolicyService } from './investment-policy.service';
import { InvestmentPolicyController } from './investment-policy.controller';

@Module({
  controllers: [InvestmentPolicyController],
  providers: [InvestmentPolicyService],
  exports: [InvestmentPolicyService],
})
export class InvestmentPolicyModule {}
