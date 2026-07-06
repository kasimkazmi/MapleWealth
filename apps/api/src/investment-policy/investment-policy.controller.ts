import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  InvestmentPolicyService,
  AddApprovedHoldingDto,
} from './investment-policy.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('investment-policy')
@UseInterceptors(UserInterceptor)
export class InvestmentPolicyController {
  constructor(
    private readonly investmentPolicyService: InvestmentPolicyService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.investmentPolicyService.findAll(user.id);
  }

  @Post()
  add(@CurrentUser() user: User, @Body() body: AddApprovedHoldingDto) {
    return this.investmentPolicyService.add(user.id, body);
  }

  @Delete(':symbol')
  remove(@CurrentUser() user: User, @Param('symbol') symbol: string) {
    return this.investmentPolicyService.remove(user.id, symbol);
  }
}
