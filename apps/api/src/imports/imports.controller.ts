import { Controller, Get, Post, Param, Body, UseInterceptors } from '@nestjs/common';
import { ImportsService, ImportCsvDto } from './imports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('imports')
@UseInterceptors(UserInterceptor)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('csv')
  parseAndAnalyzeCsv(@CurrentUser() user: any, @Body() body: ImportCsvDto) {
    return this.importsService.parseAndAnalyzeCsv(user.id, body);
  }

  @Get(':id/status')
  getImportStatus(@Param('id') id: string) {
    return this.importsService.getImportStatus(id);
  }

  @Post(':id/commit')
  commitImport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.importsService.commitImport(user.id, id);
  }
}
