import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";

export default async function StudentDashboardPage() {
  const session = await getStudentFromCookie();
  if (!session) redirect("/");

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    select: { username: true, grade: true },
  });

  if (!student) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm text-[var(--muted)]">Signed in as</p>
        <p className="text-lg font-semibold">{student.username}</p>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 text-center">
          <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Your grade</p>
          <p className="mt-2 text-4xl font-bold text-[var(--success)]">{student.grade}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="text-center text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            ← Back to login
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
