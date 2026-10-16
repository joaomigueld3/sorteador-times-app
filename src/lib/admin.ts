import { NextRequest, NextResponse } from "next/server";

export function validateAdmin(req: NextRequest): NextResponse | null {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
  }
  return null;
}
