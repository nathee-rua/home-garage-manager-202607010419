"use client";

import { useTransition } from "react";
import { Check, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRenewalStatus } from "@/app/actions";

export function RenewalStatusControl({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const done = status === "done";

  function toggle() {
    startTransition(async () => {
      await updateRenewalStatus(id, done ? "upcoming" : "done");
    });
  }

  return (
    <Button
      variant={done ? "outline" : "secondary"}
      size="sm"
      onClick={toggle}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <RotateCcw className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" />
      )}
      {done ? "ยกเลิก" : "เสร็จแล้ว"}
    </Button>
  );
}
