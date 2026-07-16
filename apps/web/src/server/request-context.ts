import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { User } from "@maplewealth/db";
import { auth } from "./auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Thrown by requireUser() when there's no valid Better Auth session — callers should
// catch this and return the attached `response` (401), mirroring UserInterceptor's
// UnauthorizedException behavior in the old NestJS app.
export class UnauthorizedError extends Error {
  response: NextResponse;
  constructor(message = "Session expired or invalid. Please log in again.") {
    super(message);
    this.name = "UnauthorizedError";
    this.response = NextResponse.json({ message }, { status: 401 });
  }
}

// Replaces UserInterceptor + @CurrentUser(): resolves the Better Auth session from the
// request headers (cookie-based) and returns the underlying Prisma User row, or throws
// UnauthorizedError (401) if there's no valid session.
export async function requireUser(req: Request): Promise<User> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new UnauthorizedError("Missing or invalid session. Please log in again.");
  }
  return session.user as unknown as User;
}

// Correlation-id resolution, matching LoggingInterceptor: reuse a valid incoming
// x-correlation-id header, else mint a new UUID.
export function getCorrelationId(req: Request): string {
  const incoming = req.headers.get("x-correlation-id");
  return incoming && UUID_RE.test(incoming) ? incoming : randomUUID();
}

// Structured request logger, matching LoggingInterceptor's exact log shape
// (timestamp, correlationId, method, url, statusCode, latencyMs).
export function logRequest(params: {
  correlationId: string;
  method: string;
  url: string;
  statusCode: number;
  startedAt: number;
}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId: params.correlationId,
      method: params.method,
      url: params.url,
      statusCode: params.statusCode,
      latencyMs: Date.now() - params.startedAt,
    }),
  );
}

// Wraps a route handler with correlation-id + structured logging + generic error handling,
// so individual route.ts files don't need to repeat the boilerplate. Errors from services
// (thrown as `HttpError`, see below) are translated to the right status code.
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function withLogging(
  req: Request,
  handler: (correlationId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const correlationId = getCorrelationId(req);
  const startedAt = Date.now();
  let statusCode = 500;
  try {
    const res = await handler(correlationId);
    statusCode = res.status;
    res.headers.set("x-correlation-id", correlationId);
    return res;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      statusCode = 401;
      err.response.headers.set("x-correlation-id", correlationId);
      return err.response;
    }
    if (err instanceof HttpError) {
      statusCode = err.status;
      const res = NextResponse.json({ message: err.message }, { status: err.status });
      res.headers.set("x-correlation-id", correlationId);
      return res;
    }
    statusCode = 500;
    console.error(err);
    const res = NextResponse.json(
      { message: "The server hit an unexpected error." },
      { status: 500 },
    );
    res.headers.set("x-correlation-id", correlationId);
    return res;
  } finally {
    logRequest({
      correlationId,
      method: req.method,
      url: new URL(req.url).pathname + new URL(req.url).search,
      statusCode,
      startedAt,
    });
  }
}
