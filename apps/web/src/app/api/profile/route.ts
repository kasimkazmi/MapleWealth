import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser, withLogging } from "../../../server/request-context";
import * as profileService from "../../../server/services/profile";

export async function GET(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const data = await profileService.getProfile(prisma, user.id);
    return NextResponse.json(data);
  });
}

export async function PATCH(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const body = await req.json();
    const data = await profileService.updateProfile(prisma, user.id, body);
    return NextResponse.json(data);
  });
}
