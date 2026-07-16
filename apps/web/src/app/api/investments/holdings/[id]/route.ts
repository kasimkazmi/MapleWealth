import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../../server/request-context";
import * as investmentsService from "../../../../../server/services/investments";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const data = await investmentsService.updateHolding(prisma, user.id, id, body);
    return NextResponse.json(data);
  });
}
