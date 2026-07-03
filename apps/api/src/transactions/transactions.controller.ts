import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseInterceptors } from '@nestjs/common';
import { TransactionsService, CreateTransactionDto, UpdateTransactionDto } from './transactions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CorrelationId } from '../common/decorators/correlation-id.decorator';
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
  create(@CurrentUser() user: any, @Body() body: CreateTransactionDto, @CorrelationId() correlationId: string) {
    return this.transactionsService.create(user.id, body, correlationId);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateTransactionDto, @CorrelationId() correlationId: string) {
    return this.transactionsService.update(user.id, id, body, correlationId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string, @CorrelationId() correlationId: string) {
    return this.transactionsService.remove(user.id, id, correlationId);
  }
}
