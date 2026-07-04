import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between border-slate-200/80 dark:border-slate-850">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 border border-amber-500/20">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{title}</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          </h1>
          {subtitle ? <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
