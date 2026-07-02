"use client";

import { useState } from "react";
import { FileText, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttachmentUploader } from "@/components/AttachmentUploader";
import type { Attachment } from "@/lib/types";

interface ReceiptManagerProps {
  entityType: "service_event" | "repair_event" | "renewal";
  entityId: string;
  vehicleId: string;
  attachments: Attachment[];
}

export function ReceiptManager({
  entityType,
  entityId,
  vehicleId,
  attachments,
}: ReceiptManagerProps) {
  const [open, setOpen] = useState(false);
  const count = attachments.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {count > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
            <span>ใบเสร็จ ({count})</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs border-dashed text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            <span>แนบใบเสร็จ</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>จัดการใบเสร็จ / Receipt Manager</span>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <AttachmentUploader
            entityType={entityType}
            entityId={entityId}
            vehicleId={vehicleId}
            attachments={attachments}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
