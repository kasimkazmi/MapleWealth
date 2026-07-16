import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as contributionsService from "../../../../server/services/contributions";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const data = await contributionsService.getContributionRoom(prisma, user.id);
    return NextResponse.json(data);
  });
}
