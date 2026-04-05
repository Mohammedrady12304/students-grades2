import * as XLSX from "xlsx";

export type ParsedRow = {
  username: string;
  password: string;
  grades: Record<string, string>;
};

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Detect username & password columns only */
function detectColumns(headers: string[]): {
  userCol: number;
  passCol: number;
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
      s === "student name" ||
      s === "اسم المستخدم" ||
      s === "المستخدم" ||
      s.includes("username")
  );

  const passCol = find(
    (s) =>
      s === "password" ||
      s === "pass" ||
      s === "pwd" ||
      s === "كلمة المرور" ||
      s === "الرقم السري" ||
      s === "الباسورد" ||
      s === "كلمة السر" ||
      s.includes("password")
  );

  if (userCol < 0 || passCol < 0) return null;
  return { userCol, passCol };
}

export function parseStudentSheet(buffer: Buffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: "buffer" });

  const first = wb.SheetNames[0];
  if (!first) throw new Error("The workbook has no sheets.");

  const sheet = wb.Sheets[first];

  const rows = XLSX.utils.sheet_to_json<
    (string | number | null | undefined)[]
  >(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as (string | number | null | undefined)[][];

  if (!rows.length) throw new Error("The sheet is empty.");

  const headerRow = rows[0].map((c) => String(c ?? "").trim());

  const cols = detectColumns(headerRow);
  if (!cols) {
    throw new Error(
      "Could not find username and password columns. Use headers like: Username, Password."
    );
  }

  const out: ParsedRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row.length) continue;

    const u = String(row[cols.userCol] ?? "").trim();
    const p = String(row[cols.passCol] ?? "").trim();

    // تجاهل الصف الفاضي بالكامل
    if (!u && !p && row.every((c) => !String(c ?? "").trim())) continue;

    if (!u || !p) {
      throw new Error(`Row ${i + 1}: username and password are required.`);
    }

    const grades: Record<string, string> = {};

    for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
      if (colIndex === cols.userCol || colIndex === cols.passCol) continue;

      const subjectName = headerRow[colIndex];
      if (!subjectName) continue;

      const value = String(row[colIndex] ?? "").trim();

      grades[subjectName] = value || "—";
    }

    out.push({
      username: u,
      password: p,
      grades,
    });
  }

  if (!out.length) throw new Error("No data rows found below the header.");

  return out;
}