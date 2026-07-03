import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // In dev mode/single-user MVP, automatically fetch the default seeded user
    let user = await this.prisma.user.findFirst();
    if (!user) {
      // Fallback fallback if seed wasn't run
      user = await this.prisma.user.create({
        data: {
          email: 'master@maplewealth.ca',
          name: 'Master',
        },
      });
    }
    
    request.user = user;
    return next.handle();
  }
}
