import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { DeleteButton } from "@/components/DeleteButton";
import { formatDate, formatTHB } from "@/lib/utils";
import { repairUrgencyLabels } from "@/lib/labels";
import type { RepairEvent, Vehicle, Provider } from "@/lib/types";
import { deleteRepairEvent } from "@/app/actions";

export function RepairEventsTable({
  events,
  vehicles,
  providers,
  showVehicle = false,
}: {
  events: RepairEvent[];
  vehicles?: Vehicle[];
  providers?: Provider[];
  showVehicle?: boolean;
}) {
  if (events.length === 0) {
    return <EmptyState title="ยังไม่มีบันทึกการซ่อม" />;
  }
  const vName = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : "-";
  };
  const pName = (id: string | null) => {
    if (!id) return "-";
    return providers?.find((p) => p.id === id)?.name ?? "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>วันที่</TableHead>
          {showVehicle ? <TableHead>รถ</TableHead> : null}
          <TableHead>อาการ / การแก้ไข</TableHead>
          <TableHead className="hidden md:table-cell">ความเร่งด่วน</TableHead>
          <TableHead className="hidden lg:table-cell">ร้าน</TableHead>
          <TableHead className="text-right">ค่าใช้จ่าย</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{formatDate(e.date)}</TableCell>
            {showVehicle ? <TableCell>{vName(e.vehicle_id)}</TableCell> : null}
            <TableCell className="max-w-xs">
              <span className="font-medium">{e.symptom ?? "-"}</span>
              {e.action_taken ? (
                <span className="block text-xs text-muted-foreground">{e.action_taken}</span>
              ) : null}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant={e.urgency === "emergency" ? "destructive" : "secondary"}>
                {repairUrgencyLabels[e.urgency].th}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">{pName(e.provider_id)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatTHB(Number(e.total_cost))}
            </TableCell>
            <TableCell>
              <DeleteButton action={deleteRepairEvent.bind(null, e.id)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
