import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { ImportsService, ImportCsvDto } from './imports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@maplewealth/db';
import { CorrelationId } from '../common/decorators/correlation-id.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('imports')
@UseInterceptors(UserInterceptor)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('csv')
  parseAndAnalyzeCsv(@CurrentUser() user: User, @Body() body: ImportCsvDto) {
    return this.importsService.parseAndAnalyzeCsv(user.id, body);
  }

  @Get(':id/status')
  getImportStatus(@CurrentUser() user: User, @Param('id') id: string) {
    return this.importsService.getImportStatus(user.id, id);
  }

  @Post(':id/commit')
  commitImport(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.importsService.commitImport(user.id, id, correlationId);
  }
}
