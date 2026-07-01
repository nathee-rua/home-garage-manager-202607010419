"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmText = "ยืนยันการลบรายการนี้?",
  label = "ลบ",
}: {
  action: () => Promise<{ ok: boolean; error?: string }>;
  confirmText?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      title={label}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-destructive" />
      )}
    </Button>
  );
}
