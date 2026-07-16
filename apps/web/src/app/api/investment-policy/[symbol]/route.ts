import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as investmentPolicyService from "../../../../server/services/investment-policy";

export async function DELETE(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { symbol } = await params;
    const data = await investmentPolicyService.remove(prisma, user.id, symbol);
    return NextResponse.json(data);
  });
}
