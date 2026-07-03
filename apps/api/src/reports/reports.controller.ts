import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('reports')
@UseInterceptors(UserInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlyReport(@CurrentUser() user: User, @Query('month') month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
    return this.reportsService.getMonthlyReport(user.id, targetMonth);
  }

  @Post('generate-monthly')
  generateMonthlyReport(
    @CurrentUser() user: User,
    @Body('month') month: string,
  ) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return this.reportsService.generateReportData(user.id, targetMonth);
  }
}
