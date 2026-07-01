import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { DeleteButton } from "@/components/DeleteButton";
import { DueBadge } from "@/components/DueBadge";
import { Badge } from "@/components/ui/badge";
import { RenewalStatusControl } from "@/components/RenewalStatusControl";
import { formatDate, formatTHB, daysUntil } from "@/lib/utils";
import { renewalTypeLabels } from "@/lib/labels";
import { computeStatus } from "@/lib/dueEngine";
import type { Renewal, Vehicle } from "@/lib/types";
import { deleteRenewal } from "@/app/actions";

export function RenewalsTable({
  renewals,
  vehicles,
  showVehicle = false,
}: {
  renewals: Renewal[];
  vehicles?: Vehicle[];
  showVehicle?: boolean;
}) {
  if (renewals.length === 0) {
    return <EmptyState title="ยังไม่มีรายการต่ออายุ" />;
  }
  const vName = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>สถานะ</TableHead>
          <TableHead>ประเภท</TableHead>
          {showVehicle ? <TableHead>รถ</TableHead> : null}
          <TableHead className="hidden sm:table-cell">ครบกำหนด</TableHead>
          <TableHead className="text-right">ประมาณการ</TableHead>
          <TableHead className="w-40 text-right">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renewals.map((r) => {
          const days = daysUntil(r.due_date);
          const computed =
            r.status === "done"
              ? null
              : computeStatus({
                  nextDueDate: r.due_date,
                  nextDueOdometer: null,
                  currentOdometer: null,
                });
          return (
            <TableRow key={r.id}>
              <TableCell>
                {r.status === "done" ? (
                  <Badge variant="secondary">เสร็จแล้ว</Badge>
                ) : (
                  <DueBadge status={computed ?? "normal"} />
                )}
              </TableCell>
              <TableCell className="font-medium">{renewalTypeLabels[r.type].th}</TableCell>
              {showVehicle ? <TableCell>{vName(r.vehicle_id)}</TableCell> : null}
              <TableCell className="hidden sm:table-cell">
                {formatDate(r.due_date)}
                {r.status !== "done" && days !== null ? (
                  <span className="block text-xs text-muted-foreground">
                    {days < 0 ? `เกิน ${Math.abs(days)} วัน` : `อีก ${days} วัน`}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatTHB(Number(r.cost_estimate))}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <RenewalStatusControl id={r.id} status={r.status} />
                  <DeleteButton action={deleteRenewal.bind(null, r.id)} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
