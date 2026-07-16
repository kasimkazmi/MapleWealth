import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as investmentsService from "../../../../server/services/investments";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const data = await investmentsService.getPerformance(prisma, user.id);
    return NextResponse.json(data);
  });
}
