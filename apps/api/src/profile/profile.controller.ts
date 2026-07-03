import { Controller, Get, Patch, Body, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserInterceptor } from '../common/interceptors/user.interceptor';

class UpdateProfileDto {
  age?: number;
  annualSalary?: number;
  monthlyTakeHome?: number;
  monthlyExpenses?: number;
  targetNetWorth?: number;
  tfsaCarryForwardBase?: number;
  fhsaCarryForwardBase?: number;
  rrspKnownRoom?: number;
}

@Controller('profile')
@UseInterceptors(UserInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  updateProfile(@CurrentUser() user: any, @Body() body: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, body);
  }
}
