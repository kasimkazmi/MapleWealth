import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestWithContext } from '../types/request-with-context';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();

    const authorization = request.headers?.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header.',
      );
    }

    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException(
        'Session expired or invalid. Please log in again.',
      );
    }

    request.user = session.user;
    return next.handle();
  }
}
