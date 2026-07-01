import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "text-foreground",
    warning: "text-warning",
    danger: "text-destructive",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-semibold tabular-nums", toneClasses)}>{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
            <Icon className={cn("h-5 w-5", toneClasses)} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
