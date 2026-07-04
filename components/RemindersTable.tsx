import Link from "next/link";
import { Wrench, CalendarClock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DueBadge } from "@/components/DueBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { serviceCategoryLabel } from "@/lib/categoryLabels";
import type { Reminder } from "@/lib/reminders";
import type { ServiceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RemindersTable({
  reminders,
  categories,
}: {
  reminders: Reminder[];
  categories: ServiceCategory[];
}) {
  if (reminders.length === 0) {
    return (
      <EmptyState
        title="ไม่มีรายการเตือน"
        description="เพิ่มรถและตั้งกฎการบำรุงรักษา (service rules) เพื่อให้ระบบแจ้งเตือนอัตโนมัติ"
      />
    );
  }

  return (
    <div>
      {/* Desktop view: Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สถานะ</TableHead>
              <TableHead>รายการ</TableHead>
              <TableHead>รถ</TableHead>
              <TableHead className="hidden sm:table-cell">ครบกำหนด</TableHead>
              <TableHead className="hidden md:table-cell">เลขไมล์เป้าหมาย</TableHead>
              <TableHead className="text-right">เหลือ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <DueBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium">
                    {r.kind === "service" ? (
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {r.kind === "service" && r.category
                      ? serviceCategoryLabel(r.category, categories)
                      : r.title}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={`/vehicles/${r.vehicleId}`} className="hover:underline">
                    {r.vehicleLabel}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(r.nextDueDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell tabular-nums">
                  {r.nextDueOdometer ? `${r.nextDueOdometer.toLocaleString()} km` : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.daysLeft === null
                    ? "-"
                    : r.daysLeft < 0
                      ? `เกิน ${Math.abs(r.daysLeft)} วัน`
                      : `${r.daysLeft} วัน`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view: Rich list of native cards */}
      <div className="space-y-3.5 md:hidden">
        {reminders.map((r) => {
          const daysLeftStr = r.daysLeft === null
            ? "-"
            : r.daysLeft < 0
              ? `เกินกำหนด ${Math.abs(r.daysLeft)} วัน`
              : `เหลืออีก ${r.daysLeft} วัน`;

          const daysLeftColor = r.daysLeft === null
            ? "text-slate-400"
            : r.daysLeft < 0
              ? "text-rose-600 dark:text-rose-400 font-bold"
              : r.daysLeft <= 7
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-slate-500 dark:text-slate-400";

          return (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
            >
              {/* Top row: Status Badge & Days remaining */}
              <div className="flex items-center justify-between">
                <DueBadge status={r.status} />
                <span className={cn("text-xs font-mono font-bold tabular-nums", daysLeftColor)}>
                  {daysLeftStr}
                </span>
              </div>

              {/* Title & Icon */}
              <div className="space-y-1">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {r.kind === "service" ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                      <Wrench className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                      <CalendarClock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span>
                    {r.kind === "service" && r.category
                      ? serviceCategoryLabel(r.category, categories)
                      : r.title}
                  </span>
                </h4>
              </div>

              {/* Vehicle & Target info (Grid details) */}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-2.5 text-xs text-muted-foreground dark:border-slate-800/60">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">รถยนต์ / Vehicle</span>
                  <Link
                    href={`/vehicles/${r.vehicleId}`}
                    className="block font-medium text-slate-700 hover:underline dark:text-slate-300 truncate"
                  >
                    {r.vehicleLabel}
                  </Link>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">กำหนด / Due</span>
                  <div className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {r.nextDueDate ? formatDate(r.nextDueDate) : "-"}
                    {r.nextDueOdometer ? (
                      <span className="block text-[10px] text-slate-400">
                        {r.nextDueOdometer.toLocaleString()} กม.
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
