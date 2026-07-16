import { NextRequest, NextResponse } from "next/server";

// Mirrors the old NestJS ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]): a fixed
// 60-second window, 60 requests per IP. In-memory is fine here — the original was
// in-memory too (single-instance deployment per the project blueprint), so this carries
// the exact same multi-instance/serverless limitation forward, not a new one.
const WINDOW_MS = 60_000;
const LIMIT = 60;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so this Map doesn't grow unbounded on a long-running
// single-instance dev/prod server.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key);
  }
}, WINDOW_MS).unref?.();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;

  if (bucket.count > LIMIT) {
    return NextResponse.json(
      { message: "Too many requests. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
