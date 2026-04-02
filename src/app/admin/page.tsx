"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    const data = (await res.json()) as { ok?: boolean };
    setSession(!!data.ok);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        setSession(false);
        return;
      }
      setPassword("");
      setSession(true);
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession(false);
    setFile(null);
    setUploadMsg(null);
    setDeleteMsg(null);
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setUploadMsg(null);
    if (!file) {
      setUploadMsg("Choose an Excel file first.");
      return;
    }
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; count?: number };
      if (!res.ok) {
        setUploadMsg(data.error || "Upload failed");
        return;
      }
      setUploadMsg(`Imported ${data.count ?? 0} students. Previous data was replaced.`);
      setFile(null);
    } finally {
      setUploadLoading(false);
    }
  }

  async function deleteAll() {
    if (!window.confirm("Delete all student records? Students will not be able to sign in until you upload a new sheet.")) {
      return;
    }
    setDeleteMsg(null);
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/data", { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string; deleted?: number };
      if (!res.ok) {
        setDeleteMsg(data.error || "Delete failed");
        return;
      }
      setDeleteMsg(`Removed ${data.deleted ?? 0} student record(s).`);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload an Excel file with columns: <strong>Username</strong>, <strong>Password</strong>,{" "}
          <strong>Grade</strong> (header row required). Uploading replaces all existing students.
        </p>

        {!session ? (
          <form onSubmit={login} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-pw" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                Admin password
              </label>
              <input
                id="admin-pw"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p className="rounded-lg bg-[var(--danger)]/15 px-3 py-2 text-sm text-red-200">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {loginLoading ? "Checking…" : "Continue"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <form onSubmit={upload} className="space-y-4">
              <div>
                <label htmlFor="xlsx" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                  Excel file (.xlsx)
                </label>
                <input
                  id="xlsx"
                  type="file"
                  accept=".xlsx,.xls"
                  className="w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-white"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {uploadMsg && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    uploadMsg.startsWith("Imported")
                      ? "bg-emerald-500/15 text-emerald-100"
                      : "bg-[var(--danger)]/15 text-red-200"
                  }`}
                >
                  {uploadMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {uploadLoading ? "Uploading…" : "Upload & replace roster"}
              </button>
            </form>

            <div className="border-t border-[var(--border)] pt-6">
              <p className="text-sm text-[var(--muted)]">
                Clear all student accounts (same as deleting the sheet). You can upload a new file afterward.
              </p>
              {deleteMsg && (
                <p className="mt-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
                  {deleteMsg}
                </p>
              )}
              <button
                type="button"
                onClick={() => void deleteAll()}
                disabled={deleteLoading}
                className="mt-3 w-full rounded-lg border border-red-500/50 py-2.5 text-sm font-medium text-red-200 hover:bg-red-500/10 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Delete all student data"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              Sign out admin
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Student login
          </Link>
        </p>
      </div>
    </div>
  );
}
