import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseInterceptors } from '@nestjs/common';
import { TransactionsService, CreateTransactionDto, UpdateTransactionDto } from './transactions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('transactions')
@UseInterceptors(UserInterceptor)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('accountId') accountId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category') category?: string,
  ) {
    return this.transactionsService.findAll(user.id, { accountId, from, to, category });
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: CreateTransactionDto) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
