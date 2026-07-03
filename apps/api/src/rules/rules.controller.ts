import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('rules')
@UseInterceptors(UserInterceptor)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get('evaluate')
  evaluate(@CurrentUser() user: User) {
    return this.rulesService.evaluateRules(user.id);
  }
}
