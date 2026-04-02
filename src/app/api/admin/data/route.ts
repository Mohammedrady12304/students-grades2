import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE() {
  const ok = await getAdminFromCookie();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.student.deleteMany();
  return NextResponse.json({ ok: true, deleted: result.count });
}
