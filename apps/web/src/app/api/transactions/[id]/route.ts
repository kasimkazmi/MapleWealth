import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as transactionsService from "../../../../server/services/transactions";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async (correlationId) => {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const data = await transactionsService.update(prisma, user.id, id, body, correlationId);
    return NextResponse.json(data);
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async (correlationId) => {
    const user = await requireUser(req);
    const { id } = await params;
    const data = await transactionsService.remove(prisma, user.id, id, correlationId);
    return NextResponse.json(data);
  });
}
