import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as usersService from "../../../../server/services/users";

export async function POST(req: Request) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const data = await usersService.exportUserData(prisma, user.id);
    return NextResponse.json(data);
  });
}
