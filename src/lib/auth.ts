import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const getSecret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET must be set (at least 16 characters)");
  }
  return new TextEncoder().encode(s);
};

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function signStudentToken(studentId: string, username: string): Promise<string> {
  return new SignJWT({ role: "student", sub: studentId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getAdminFromCookie(): Promise<boolean> {
  const jar = await cookies();
  const t = jar.get("admin_session")?.value;
  if (!t) return false;
  return verifyAdminToken(t);
}

export type StudentPayload = { studentId: string; username: string };

export async function verifyStudentToken(token: string): Promise<StudentPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "student" || typeof payload.sub !== "string") return null;
    const username = typeof payload.username === "string" ? payload.username : "";
    return { studentId: payload.sub, username };
  } catch {
    return null;
  }
}

export async function getStudentFromCookie(): Promise<StudentPayload | null> {
  const jar = await cookies();
  const t = jar.get("student_session")?.value;
  if (!t) return null;
  return verifyStudentToken(t);
}
