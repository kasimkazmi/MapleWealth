import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@maplewealth/db';
import type { RequestWithContext } from '../types/request-with-context';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    return request.user as User;
  },
);
