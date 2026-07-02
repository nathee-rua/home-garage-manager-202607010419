"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Camera, Loader2, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/supabase/client";
import { createAttachment, deleteAttachment } from "@/app/actions";
import type { Attachment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
        {/* Hidden inputs */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onFile}
          accept="image/*,application/pdf"
        />
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          onChange={onFile}
          accept="image/*"
          capture="environment"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            type="button"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            อัปโหลดไฟล์ / PDF / รูปภาพ
          </Button>

          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            type="button"
            className="gap-1.5"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            ถ่ายภาพใบเสร็จ / Camera
          </Button>
        </div>

        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <p className="mt-2 text-[11px] text-muted-foreground">
          รองรับไฟล์ PDF, รูปภาพทั่วไป หรือถ่ายจากกล้องมือถือโดยตรง · เก็บใน Storage bucket &quot;{BUCKET}&quot;
        </p>
      </div>

      {attachments.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPreviewFile(a);
                }}
                className="flex min-w-0 items-center gap-2 text-sm hover:underline text-left"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{a.file_name ?? "ไฟล์แนบ"}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
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

      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 bg-slate-900 border-slate-800 text-white">
            <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
              <DialogTitle className="text-sm font-semibold truncate max-w-[80%]">
                {previewFile.file_name ?? "ใบเสร็จ / Receipt"}
              </DialogTitle>
              <a
                href={previewFile.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-200 hover:underline flex items-center gap-1 shrink-0 ml-4 mr-6"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>เปิดแท็บใหม่ / Open Tab</span>
              </a>
            </DialogHeader>
            <div className="flex items-center justify-center pt-4 min-h-[300px]">
              {previewFile.file_type?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewFile.file_url}
                  alt={previewFile.file_name ?? "Receipt"}
                  className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-md"
                />
              ) : (
                <iframe
                  src={previewFile.file_url}
                  title={previewFile.file_name ?? "PDF Receipt"}
                  className="w-full h-[60vh] rounded-lg border-0 bg-white"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
