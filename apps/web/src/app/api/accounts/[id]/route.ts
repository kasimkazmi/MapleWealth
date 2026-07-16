import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as accountsService from "../../../../server/services/accounts";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const data = await accountsService.findOne(prisma, user.id, id);
    return NextResponse.json(data);
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const data = await accountsService.update(prisma, user.id, id, body);
    return NextResponse.json(data);
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const data = await accountsService.remove(prisma, user.id, id);
    return NextResponse.json(data);
  });
}
