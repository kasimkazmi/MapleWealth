import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as reportsService from "../../../../server/services/reports";

export async function POST(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const targetMonth = body.month || new Date().toISOString().slice(0, 7);
    const data = await reportsService.generateReportData(prisma, user.id, targetMonth);
    return NextResponse.json(data);
  });
}
