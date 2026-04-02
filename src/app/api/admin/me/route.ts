import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const ok = await getAdminFromCookie();
  return NextResponse.json({ ok });
}
