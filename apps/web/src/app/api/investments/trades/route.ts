import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as investmentsService from "../../../../server/services/investments";

export async function POST(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();
    const data = await investmentsService.recordTrade(prisma, user.id, body);
    return NextResponse.json(data);
  });
}
