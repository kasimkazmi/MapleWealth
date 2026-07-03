import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { GoalsService, CreateGoalDto, UpdateGoalDto } from './goals.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('goals')
@UseInterceptors(UserInterceptor)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.goalsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateGoalDto) {
    return this.goalsService.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.id, id, body);
  }
}
