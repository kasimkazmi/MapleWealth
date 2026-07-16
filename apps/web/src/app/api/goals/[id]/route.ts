import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as goalsService from "../../../../server/services/goals";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const data = await goalsService.update(prisma, user.id, id, body);
    return NextResponse.json(data);
  });
}
