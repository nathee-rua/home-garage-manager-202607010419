import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} title={hint}>
        {label}
      </Label>
      {children}
    </div>
  );
}
