import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { withLogging } from "../../../server/request-context";

// Public catalog data — no auth required, same as any other "compare cards" page.
export async function GET(req: Request) {
  return withLogging(req, async () => {
    const cards = await prisma.creditCardProduct.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(cards);
  });
}
