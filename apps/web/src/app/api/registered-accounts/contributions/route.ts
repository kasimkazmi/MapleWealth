import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as contributionsService from "../../../../server/services/contributions";
import type { AccountType } from "@maplewealth/db";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const type = (url.searchParams.get("type") as AccountType | null) || undefined;
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const data = await contributionsService.getContributions(prisma, user.id, type, year);
    return NextResponse.json(data);
  });
}

export async function POST(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();
    const data = await contributionsService.recordContribution(prisma, user.id, body);
    return NextResponse.json(data);
  });
}
