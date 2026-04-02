import * as XLSX from "xlsx";

export type ParsedRow = { username: string; password: string; grade: string };

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Map header cell to column index for username / password / grade */
function detectColumns(headers: string[]): {
  userCol: number;
  passCol: number;
  gradeCol: number;
} | null {
  const h = headers.map((c) => norm(String(c ?? "")));
  const find = (pred: (s: string) => boolean) => h.findIndex(pred);

  const userCol = find(
    (s) =>
      s === "username" ||
      s === "user" ||
      s === "login" ||
      s === "student" ||
      s === "student id" ||
      s.includes("username"),
  );
  const passCol = find(
    (s) =>
      s === "password" ||
      s === "pass" ||
      s === "pwd" ||
      s.includes("password"),
  );
  const gradeCol = find(
    (s) =>
      s === "grade" ||
      s === "mark" ||
      s === "score" ||
      s === "result" ||
      s.includes("grade"),
  );

  if (userCol < 0 || passCol < 0 || gradeCol < 0) return null;
  return { userCol, passCol, gradeCol };
}

export function parseStudentSheet(buffer: Buffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const first = wb.SheetNames[0];
  if (!first) throw new Error("The workbook has no sheets.");
  const sheet = wb.Sheets[first];
  const rows = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as (string | number | null | undefined)[][];

  if (!rows.length) throw new Error("The sheet is empty.");

  const headerRow = rows[0].map((c) => String(c ?? ""));
  const cols = detectColumns(headerRow);
  if (!cols) {
    throw new Error(
      "Could not find username, password, and grade columns. Use headers like: Username, Password, Grade.",
    );
  }

  const out: ParsedRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row.length) continue;
    const u = String(row[cols.userCol] ?? "").trim();
    const p = String(row[cols.passCol] ?? "").trim();
    const g = String(row[cols.gradeCol] ?? "").trim();
    if (!u && !p && !g) continue;
    if (!u || !p) {
      throw new Error(`Row ${i + 1}: username and password are required.`);
    }
    out.push({ username: u, password: p, grade: g || "—" });
  }

  if (!out.length) throw new Error("No data rows found below the header.");
  return out;
}
