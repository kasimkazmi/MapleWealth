import { Controller, Get, Post, Patch, Param, Body, UseInterceptors } from '@nestjs/common';
import { InvestmentsService, CreateHoldingDto, UpdateHoldingDto, RecordTradeDto } from './investments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('investments')
@UseInterceptors(UserInterceptor)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('holdings')
  getHoldings(@CurrentUser() user: any) {
    return this.investmentsService.getHoldings(user.id);
  }

  @Post('holdings')
  createHolding(@CurrentUser() user: any, @Body() body: CreateHoldingDto) {
    return this.investmentsService.createHolding(user.id, body);
  }

  @Patch('holdings/:id')
  updateHolding(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateHoldingDto) {
    return this.investmentsService.updateHolding(user.id, id, body);
  }

  @Get('performance')
  getPerformance(@CurrentUser() user: any) {
    return this.investmentsService.getPerformance(user.id);
  }

  @Post('trades')
  recordTrade(@CurrentUser() user: any, @Body() body: RecordTradeDto) {
    return this.investmentsService.recordTrade(user.id, body);
  }
}
