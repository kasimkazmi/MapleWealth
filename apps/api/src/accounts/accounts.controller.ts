import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  AccountsService,
  CreateAccountDto,
  UpdateAccountDto,
} from './accounts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('accounts')
@UseInterceptors(UserInterceptor)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.accountsService.findAll(user.id);
  }

  @Get('net-worth')
  calculateNetWorth(@CurrentUser() user: User) {
    return this.accountsService.calculateNetWorth(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.accountsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateAccountDto) {
    return this.accountsService.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.accountsService.remove(user.id, id);
  }
}
