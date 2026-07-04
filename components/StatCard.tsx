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
  tone?: "default" | "brand" | "warning" | "danger" | "info";
}) {
  const configs = {
    default: {
      text: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50",
    },
    brand: {
      text: "text-slate-900 dark:text-slate-100",
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    warning: {
      text: "text-orange-600 dark:text-orange-400 font-bold",
      bg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30",
    },
    danger: {
      text: "text-red-600 dark:text-red-400 font-bold",
      bg: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    },
    info: {
      text: "text-blue-600 dark:text-blue-400 font-bold",
      bg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    },
  };

  const config = configs[tone] || configs.default;

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
          <p className={cn("text-2xl font-bold tabular-nums", config.text)}>{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 shadow-sm", config.bg)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
