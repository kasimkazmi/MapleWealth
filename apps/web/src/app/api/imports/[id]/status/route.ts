import { NextResponse } from "next/server";
import { requireUser, withLogging } from "../../../../../server/request-context";
import * as importsService from "../../../../../server/services/imports";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withLogging(req, async () => {
    const user = await requireUser(req);
    const { id } = await params;
    const data = importsService.getImportStatus(user.id, id);
    return NextResponse.json(data);
  });
}
