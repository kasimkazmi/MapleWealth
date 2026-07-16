import { NextResponse } from "next/server";
import { requireUser, withLogging } from "../../../../server/request-context";
import * as projectionsService from "../../../../server/services/projections";

// Matches the NestJS controller: this route's own signature is user-agnostic (a pure
// calculation), but the controller-level @UseInterceptors(UserInterceptor) still guarded
// it, so auth is still required here for parity.

export async function POST(req: Request) {
  return withLogging(req, async () => {
    await requireUser(req);
    const body = await req.json();
    const data = projectionsService.calculateCompoundGrowth(body);
    return NextResponse.json(data);
  });
}
