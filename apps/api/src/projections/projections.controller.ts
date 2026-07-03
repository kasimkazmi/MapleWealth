import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import {
  ProjectionsService,
  CompoundGrowthDto,
  NetWorthProjectionDto,
  EfCompletionDto,
} from './projections.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('projections')
@UseInterceptors(UserInterceptor)
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  @Post('compound-growth')
  calculateCompoundGrowth(@Body() body: CompoundGrowthDto) {
    return this.projectionsService.calculateCompoundGrowth(body);
  }

  @Post('net-worth')
  projectNetWorth(
    @CurrentUser() user: User,
    @Body() body: NetWorthProjectionDto,
  ) {
    return this.projectionsService.projectNetWorth(user.id, body);
  }

  @Post('emergency-fund-completion')
  calculateEfCompletion(
    @CurrentUser() user: User,
    @Body() body: EfCompletionDto,
  ) {
    return this.projectionsService.calculateEfCompletion(user.id, body);
  }
}
