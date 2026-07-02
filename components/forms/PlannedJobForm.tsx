"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/forms/Field";
import { createPlannedJob } from "@/app/actions";
import { priorityLabels } from "@/lib/labels";

export function PlannedJobForm({ vehicleId }: { vehicleId: string }) {
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        fd.set("vehicle_id", vehicleId);
        fd.set("priority", priority);
        startTransition(async () => {
          const res = await createPlannedJob(fd);
          if (res.ok) {
            toast.success("เพิ่มแผนงานบำรุงรักษาเรียบร้อยแล้ว");
            // Reset input values manually
            const form = document.getElementById("planned-job-form") as HTMLFormElement;
            form?.reset();
            setPriority("medium");
          } else {
            toast.error(res.error ?? "เกิดข้อผิดพลาด");
            setError(res.error ?? "เกิดข้อผิดพลาด");
          }
        });
      }}
      id="planned-job-form"
      className="space-y-4 rounded-xl border p-4 bg-card"
    >
      <h3 className="text-sm font-semibold">วางแผนการเช็กระยะ/ซ่อมครั้งถัดไป</h3>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="หัวข้อ / Title">
          <Input name="title" required placeholder="เช่น เปลี่ยนยางคู่หน้า, เช็กระยะ 80,000 กม." />
        </Field>

        <Field label="ความสำคัญ / Priority">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.th}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="วันที่เป้าหมาย / Target Date">
          <Input name="target_date" type="date" />
        </Field>

        <Field label="เลขไมล์เป้าหมาย / Target Odometer (km)">
          <Input name="target_odometer" type="number" placeholder="เช่น 90000" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="ความเร่งด่วน/วิกฤต / Criticality (optional)">
          <Input name="criticality" placeholder="เช่น ต้องทำก่อนเดินทางไกล" />
        </Field>

        <Field label="รายละเอียด / Note">
          <Textarea name="note" rows={2} placeholder="ระบุรายละเอียดเพิ่มเติม..." />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          บันทึกแผนงาน
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
