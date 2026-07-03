import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { ProjectionsService, CompoundGrowthDto, NetWorthProjectionDto, EfCompletionDto } from './projections.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';
import { PrismaService } from '../prisma/prisma.service';

@Controller('projections')
@UseInterceptors(UserInterceptor)
export class ProjectionsController {
  constructor(
    private readonly projectionsService: ProjectionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('compound-growth')
  calculateCompoundGrowth(@Body() body: CompoundGrowthDto) {
    return this.projectionsService.calculateCompoundGrowth(body);
  }

  @Post('net-worth')
  projectNetWorth(@CurrentUser() user: any, @Body() body: NetWorthProjectionDto) {
    return this.projectionsService.projectNetWorth(user.id, this.prisma, body);
  }

  @Post('emergency-fund-completion')
  calculateEfCompletion(@CurrentUser() user: any, @Body() body: EfCompletionDto) {
    return this.projectionsService.calculateEfCompletion(user.id, this.prisma, body);
  }
}
