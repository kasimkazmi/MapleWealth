import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithContext } from '../types/request-with-context';

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    return request.correlationId;
  },
);
