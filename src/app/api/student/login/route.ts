import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signStudentToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { username },
  });

  if (!student) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, student.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await signStudentToken(student.id, student.username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("student_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
