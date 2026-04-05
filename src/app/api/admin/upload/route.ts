import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { parseStudentSheet } from "@/lib/excel";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ok = await getAdminFromCookie();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not read form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file field \"file\"" }, { status: 400 });
  }

  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);

  let rows;
  try {
    rows = parseStudentSheet(buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to parse Excel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const seen = new Set<string>();
  for (const r of rows) {
    const key = r.username.toLowerCase();
    if (seen.has(key)) {
      return NextResponse.json(
        { error: `Duplicate username in sheet: ${r.username}` },
        { status: 400 },
      );
    }
    seen.add(key);
  }

  const rounds = 10;

  const hashed = await Promise.all(
    rows.map(async (r) => ({
      username: r.username,
      passwordHash: await bcrypt.hash(r.password, rounds),
      grades: r.grades, // ✅ بدل grade
    })),
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.student.deleteMany();
      await tx.student.createMany({ data: hashed });
    });
  } catch (e) {
    console.error("[admin/upload]", e);
    const message = e instanceof Error ? e.message : "Database error during upload.";

    const schemaHint =
      /column|grade|grades|does not exist|Unknown arg/i.test(message)
        ? " تأكد إنك عملت migration بعد تعديل schema (grades بدل grade)."
        : "";

    return NextResponse.json({ error: message + schemaHint }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: hashed.length });
}