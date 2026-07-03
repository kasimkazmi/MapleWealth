import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  ContributionsService,
  RecordContributionDto,
} from './contributions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';
import type { AccountType, User } from '@maplewealth/db';

@Controller('registered-accounts')
@UseInterceptors(UserInterceptor)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Get('contributions')
  getContributions(
    @CurrentUser() user: User,
    @Query('type') type?: AccountType,
    @Query('year') year?: string,
  ) {
    const parseYear = year ? parseInt(year, 10) : undefined;
    return this.contributionsService.getContributions(user.id, type, parseYear);
  }

  @Post('contributions')
  recordContribution(
    @CurrentUser() user: User,
    @Body() body: RecordContributionDto,
  ) {
    return this.contributionsService.recordContribution(user.id, body);
  }

  @Get('room')
  getContributionRoom(@CurrentUser() user: User) {
    return this.contributionsService.getContributionRoom(user.id);
  }
}
