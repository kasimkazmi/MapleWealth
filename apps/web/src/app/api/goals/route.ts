import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser, withLogging } from "../../../server/request-context";
import * as goalsService from "../../../server/services/goals";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const data = await goalsService.findAll(prisma, user.id);
    return NextResponse.json(data);
  });
}

export async function POST(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();
    const data = await goalsService.create(prisma, user.id, body);
    return NextResponse.json(data);
  });
}
