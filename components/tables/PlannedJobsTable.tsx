"use client";

import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { priorityLabels } from "@/lib/labels";
import type { PlannedJob, Vehicle } from "@/lib/types";
import { deletePlannedJob } from "@/app/actions";

export function PlannedJobsTable({
  jobs,
  vehicles,
  showVehicle = false,
}: {
  jobs: PlannedJob[];
  vehicles?: Vehicle[];
  showVehicle?: boolean;
}) {
  if (jobs.length === 0) {
    return <EmptyState title="ยังไม่มีรายการแผนงานบำรุงรักษา" />;
  }

  const vName = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : "-";
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "high":
        return <Badge variant="destructive">สูง / High</Badge>;
      case "medium":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-400">
            ปานกลาง / Medium
          </Badge>
        );
      case "low":
      default:
        return <Badge variant="secondary">ต่ำ / Low</Badge>;
    }
  };

  const handleDelete = async (id: string, vehicleId: string) => {
    try {
      const res = await deletePlannedJob(id, vehicleId);
      if (res.ok) {
        toast.success("ลบแผนงานเรียบร้อยแล้ว");
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
      return res;
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบแผนงาน");
      return { ok: false, error: "เกิดข้อผิดพลาดในการลบแผนงาน" };
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ความสำคัญ</TableHead>
          <TableHead>หัวข้อแผนงาน</TableHead>
          {showVehicle ? <TableHead>รถ</TableHead> : null}
          <TableHead className="hidden sm:table-cell">เป้าหมายวันที่</TableHead>
          <TableHead className="hidden sm:table-cell">เป้าหมายระยะไมล์</TableHead>
          <TableHead>ความเร่งด่วน</TableHead>
          <TableHead className="w-20 text-right">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell>{getPriorityBadge(job.priority)}</TableCell>
            <TableCell className="font-medium">
              <div>{job.title}</div>
              {job.note ? (
                <span className="block text-xs text-muted-foreground mt-0.5">{job.note}</span>
              ) : null}
            </TableCell>
            {showVehicle ? <TableCell>{vName(job.vehicle_id)}</TableCell> : null}
            <TableCell className="hidden sm:table-cell">
              {job.target_date ? formatDate(job.target_date) : "-"}
            </TableCell>
            <TableCell className="hidden sm:table-cell tabular-nums">
              {job.target_odometer ? `${job.target_odometer.toLocaleString()} กม.` : "-"}
            </TableCell>
            <TableCell>{job.criticality ?? "-"}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <DeleteButton action={() => handleDelete(job.id, job.vehicle_id)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
