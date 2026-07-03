import { Controller, Get, Post, Body, UseInterceptors } from '@nestjs/common';
import { DividendsService, RecordDividendDto } from './dividends.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('dividends')
@UseInterceptors(UserInterceptor)
export class DividendsController {
  constructor(private readonly dividendsService: DividendsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.dividendsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: RecordDividendDto) {
    return this.dividendsService.create(user.id, body);
  }
}
