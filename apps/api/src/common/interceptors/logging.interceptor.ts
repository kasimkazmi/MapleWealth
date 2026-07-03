import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import type { RequestWithContext } from '../types/request-with-context';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Registered globally, so this runs outermost — before UserInterceptor's auth check —
// meaning correlationId is available on the request (and gets logged) even for 401s.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const response = context.switchToHttp().getResponse<Response>();

    const incoming = request.headers?.['x-correlation-id'];
    const correlationId =
      typeof incoming === 'string' && UUID_RE.test(incoming)
        ? incoming
        : randomUUID();

    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    const start = Date.now();
    const { method, originalUrl } = request;

    const logLine = (statusCode: number) => {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          correlationId,
          method,
          url: originalUrl,
          statusCode,
          latencyMs: Date.now() - start,
        }),
      );
    };

    return next.handle().pipe(
      tap(() => logLine(response.statusCode)),
      catchError((err: unknown) => {
        const status =
          err instanceof Error && 'status' in err
            ? Number((err as Error & { status?: number }).status)
            : 500;
        logLine(status || 500);
        throw err instanceof Error ? err : new Error(String(err));
      }),
    );
  }
}
