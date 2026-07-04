"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  const [imgLoading, setImgLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setImgLoading(true);
  }, [previewFile]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const sb = getBrowserClient();
      if (!sb) throw new Error("Supabase client is not available");

      // Validate file size (10MB limit)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error("ไฟล์มีขนาดใหญ่เกินไป จำกัดไม่เกิน 10MB / File too large, max 10MB");
      }

      const filePath = `${vehicleId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await sb.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);

      const res = await createAttachment({
        entity_type: entityType,
        entity_id: entityId,
        file_url: urlData.publicUrl,
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
    if (!confirm("คุณต้องการลบไฟล์แนบนี้ใช่หรือไม่? / Are you sure you want to delete this attachment?")) {
      return;
    }
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
                <div className="relative w-full flex items-center justify-center min-h-[300px]">
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewFile.file_url}
                    alt={previewFile.file_name ?? "Receipt"}
                    onLoad={() => setImgLoading(false)}
                    className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-md"
                  />
                </div>
              ) : isMobile ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <FileText className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-sm font-semibold text-slate-200 mb-6">
                    การดูไฟล์ PDF ในหน้านี้อาจจำกัดบนมือถือ
                  </p>
                  <a
                    href={previewFile.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-3 text-sm font-bold text-white transition-colors"
                  >
                    <ExternalLink className="h-4.5 w-4.5" />
                    <span>เปิดดูไฟล์ PDF / View PDF</span>
                  </a>
                </div>
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
