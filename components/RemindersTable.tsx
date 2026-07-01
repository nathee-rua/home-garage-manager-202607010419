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
  );
}
