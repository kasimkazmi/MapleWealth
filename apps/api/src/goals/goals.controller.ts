import { Controller, Get, Post, Patch, Param, Body, UseInterceptors } from '@nestjs/common';
import { GoalsService, CreateGoalDto, UpdateGoalDto } from './goals.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('goals')
@UseInterceptors(UserInterceptor)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.goalsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: CreateGoalDto) {
    return this.goalsService.create(user.id, body);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateGoalDto) {
    return this.goalsService.update(user.id, id, body);
  }
}
