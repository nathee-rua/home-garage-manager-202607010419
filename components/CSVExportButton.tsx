"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/csv";

export function CSVExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  headers,
  label = "ส่งออก CSV",
}: {
  data: T[];
  filename: string;
  headers?: { key: keyof T; label: string }[];
  label?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCSV(data, filename, headers)}
      disabled={data.length === 0}
      title="Export CSV"
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}
