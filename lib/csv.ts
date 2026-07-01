"use client";

// Convert an array of plain objects to a CSV Blob and trigger a browser download.

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (rows.length === 0 && !headers) return "";

  const cols =
    headers ??
    Object.keys(rows[0] ?? {}).map((k) => ({ key: k as keyof T, label: k }));

  const headerLine = cols.map((c) => escapeCell(c.label)).join(",");
  const dataLines = rows.map((row) =>
    cols.map((c) => escapeCell(row[c.key])).join(",")
  );

  // Prepend BOM so Excel opens Thai (UTF-8) correctly.
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

export function downloadCSV<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
): void {
  const csv = toCSV(rows, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
