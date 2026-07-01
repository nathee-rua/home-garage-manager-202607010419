"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Loader2, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/supabase/client";
import { createAttachment, deleteAttachment } from "@/app/actions";
import type { Attachment } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const BUCKET = "attachments";

export function AttachmentUploader({
  entityType,
  entityId,
  vehicleId,
  attachments,
}: {
  entityType: string;
  entityId: string;
  vehicleId: string;
  attachments: Attachment[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const sb = getBrowserClient();
    if (!sb) {
      setError("ยังไม่ได้ตั้งค่า Supabase");
      return;
    }
    setUploading(true);
    try {
      const path = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file, {
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      const res = await createAttachment({
        entity_type: entityType,
        entity_id: entityId,
        file_url: data.publicUrl,
        file_name: file.name,
        file_type: file.type,
      });
      if (!res.ok) throw new Error(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDelete(id: string) {
    startTransition(async () => {
      await deleteAttachment(id, vehicleId);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onFile}
          accept="image/*,application/pdf"
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          อัปโหลดไฟล์ / เอกสาร
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <p className="mt-2 text-xs text-muted-foreground">
          รองรับรูปภาพและ PDF · เก็บใน Storage bucket &quot;{BUCKET}&quot;
        </p>
      </div>

      {attachments.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <a
                href={a.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm hover:underline"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{a.file_name ?? "ไฟล์แนบ"}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatDate(a.captured_at ?? a.created_at)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(a.id)}
                  disabled={pending}
                  aria-label="ลบ"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">ยังไม่มีไฟล์แนบ</p>
      )}
    </div>
  );
}
