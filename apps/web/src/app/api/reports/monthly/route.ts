import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as reportsService from "../../../../server/services/reports";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const targetMonth = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const data = await reportsService.getMonthlyReport(prisma, user.id, targetMonth);
    return NextResponse.json(data);
  });
}
