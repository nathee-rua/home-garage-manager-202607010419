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
import { formatDate, formatTHB } from "@/lib/utils";
import { serviceCategoryLabel } from "@/lib/categoryLabels";
import type { ServiceEvent, ServiceCategory, Vehicle, Provider, Attachment } from "@/lib/types";
import { deleteServiceEvent } from "@/app/actions";
import { ReceiptManager } from "@/components/ReceiptManager";

export function ServiceEventsTable({
  events,
  categories,
  vehicles,
  providers,
  attachments = [],
  showVehicle = false,
}: {
  events: ServiceEvent[];
  categories: ServiceCategory[];
  vehicles?: Vehicle[];
  providers?: Provider[];
  attachments?: Attachment[];
  showVehicle?: boolean;
}) {
  if (events.length === 0) {
    return <EmptyState title="ยังไม่มีบันทึกการบำรุงรักษา" />;
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
          <TableHead>หมวด</TableHead>
          <TableHead className="hidden md:table-cell">เลขไมล์</TableHead>
          <TableHead className="hidden lg:table-cell">ร้าน</TableHead>
          <TableHead className="text-right">ค่าใช้จ่าย</TableHead>
          <TableHead className="w-24 text-center">ใบเสร็จ</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => {
          const total =
            Number(e.cost_parts) + Number(e.cost_labor) + Number(e.cost_misc);
          return (
            <TableRow key={e.id}>
              <TableCell>{formatDate(e.date)}</TableCell>
              {showVehicle ? <TableCell>{vName(e.vehicle_id)}</TableCell> : null}
              <TableCell className="font-medium">
                {serviceCategoryLabel(e.category, categories)}
                {e.details ? (
                  <span className="block text-xs text-muted-foreground">{e.details}</span>
                ) : null}
              </TableCell>
              <TableCell className="hidden md:table-cell tabular-nums">
                {e.odometer ? e.odometer.toLocaleString() : "-"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{pName(e.provider_id)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatTHB(total)}</TableCell>
              <TableCell className="text-center">
                <ReceiptManager
                  entityType="service_event"
                  entityId={e.id}
                  vehicleId={e.vehicle_id}
                  attachments={attachments.filter((a) => a.entity_id === e.id)}
                />
              </TableCell>
              <TableCell>
                <DeleteButton action={deleteServiceEvent.bind(null, e.id)} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
