import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser, withLogging } from "../../../server/request-context";
import * as transactionsService from "../../../server/services/transactions";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const filters = {
      accountId: url.searchParams.get("accountId") || undefined,
      from: url.searchParams.get("from") || undefined,
      to: url.searchParams.get("to") || undefined,
      category: url.searchParams.get("category") || undefined,
    };
    const data = await transactionsService.findAll(prisma, user.id, filters);
    return NextResponse.json(data);
  });
}

export async function POST(req: Request) {
  return withLogging(req, async (correlationId) => {
    const user = await requireUser(req);
    const body = await req.json();
    const data = await transactionsService.create(prisma, user.id, body, correlationId);
    return NextResponse.json(data);
  });
}
