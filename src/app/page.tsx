"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/student");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 shadow-xl backdrop-blur">
    
    

    <h1 className="text-center text-2xl font-semibold tracking-tight">Student login</h1>
    
    <p className="mt-2 text-center text-sm text-[var(--muted)]">
      Sign in with the username and password your instructor gave you.
    </p>

    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="u" className="mb-1 block text-sm font-medium text-[var(--muted)]">
          Username
        </label>
        <input
          id="u"
          autoComplete="username"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none ring-[var(--accent)] focus:ring-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="p" className="mb-1 block text-sm font-medium text-[var(--muted)]">
          Password
        </label>
        <input
          id="p"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none ring-[var(--accent)] focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rounded-lg bg-[var(--danger)]/15 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "View my grade"}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-[var(--muted)]">
      Instructor?{" "}
      <Link href="/admin" className="text-[var(--accent)] hover:underline">
        Admin portal
      </Link>
    </p>
  </div>
</div>
  );
}
