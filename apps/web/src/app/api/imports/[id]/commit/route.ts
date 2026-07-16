import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../../server/request-context";
import * as importsService from "../../../../../server/services/imports";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async (correlationId) => {
    const user = await requireUser(req);
    const { id } = await params;
    const data = await importsService.commitImport(prisma, user.id, id, correlationId);
    return NextResponse.json(data);
  });
}
