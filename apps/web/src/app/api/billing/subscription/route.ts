import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../server/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      isPremium: subscription?.status === "active",
      subscription,
    });
  } catch (err) {
    console.error("Fetch subscription error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
