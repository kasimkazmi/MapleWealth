import { Controller, Post, Delete, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

@Controller('users')
@UseInterceptors(UserInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('export')
  exportUserData(@CurrentUser() user: any) {
    return this.usersService.exportUserData(user.id);
  }

  @Delete('purge')
  purgeUserAccount(@CurrentUser() user: any) {
    return this.usersService.purgeUserAccount(user.id);
  }
}
