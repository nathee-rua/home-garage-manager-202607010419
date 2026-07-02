"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  renewalTypeLabels,
  repairUrgencyLabels,
} from "@/lib/labels";
import type { Provider, ServiceCategory, Vehicle } from "@/lib/types";
import {
  createServiceEvent,
  createRepairEvent,
  createRenewal,
} from "@/app/actions";

interface Props {
  vehicles: Vehicle[];
  providers: Provider[];
  categories: ServiceCategory[];
  defaultVehicleId?: string;
  trigger?: "button" | "icon";
  label?: string;
}

function VehicleSelect({
  vehicles,
  value,
  onChange,
}: {
  vehicles: Vehicle[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label="รถ / Vehicle">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="เลือกรถ" />
        </SelectTrigger>
        <SelectContent>
          {vehicles.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.brand} {v.model}
              {v.plate_no ? ` (${v.plate_no})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function ProviderSelect({
  providers,
  value,
  onChange,
}: {
  providers: Provider[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label="ร้าน/ศูนย์บริการ / Provider (optional)">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="ไม่ระบุ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">ไม่ระบุ</SelectItem>
          {providers.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
              {p.branch ? ` — ${p.branch}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

export function QuickAddSheet({
  vehicles,
  providers,
  categories,
  defaultVehicleId,
  trigger = "button",
  label = "บันทึกด่วน",
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // shared selects
  const initialVehicle = defaultVehicleId ?? vehicles[0]?.id ?? "";
  const [logVehicle, setLogVehicle] = useState(initialVehicle);
  const [logProvider, setLogProvider] = useState("none");
  const [logCategory, setLogCategory] = useState(categories[0]?.code ?? "engine_oil");

  const [repVehicle, setRepVehicle] = useState(initialVehicle);
  const [repProvider, setRepProvider] = useState("none");
  const [repUrgency, setRepUrgency] = useState("planned");

  const [renVehicle, setRenVehicle] = useState(initialVehicle);
  const [renType, setRenType] = useState("compulsory_insurance");

  function handle(
    fn: (fd: FormData) => Promise<{ ok: boolean; error?: string }>,
    formData: FormData,
    successMessage: string
  ) {
    setError(null);
    startTransition(async () => {
      const res = await fn(formData);
      if (res.ok) {
        toast.success(successMessage);
        setOpen(false);
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
        setError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger === "icon" ? (
        <Button size="icon" variant="outline" onClick={() => setOpen(true)} aria-label={label}>
          <Plus className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)} disabled={vehicles.length === 0}>
          <Plus className="h-4 w-4" /> {label}
        </Button>
      )}
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>บันทึกด่วน</SheetTitle>
          <SheetDescription>Quick add — บริการ / ซ่อม / ต่ออายุ</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="log" className="mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">บริการ</TabsTrigger>
            <TabsTrigger value="repair">ซ่อม</TabsTrigger>
            <TabsTrigger value="renewal">ต่ออายุ</TabsTrigger>
          </TabsList>

          {/* ---- Service log ---- */}
          <TabsContent value="log">
            <form
              action={(fd) => {
                fd.set("vehicle_id", logVehicle);
                fd.set("category", logCategory);
                fd.set("provider_id", logProvider === "none" ? "" : logProvider);
                handle(createServiceEvent, fd, "บันทึกประวัติการบำรุงรักษาเรียบร้อยแล้ว");
              }}
              className="space-y-3"
            >
              <VehicleSelect vehicles={vehicles} value={logVehicle} onChange={setLogVehicle} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="วันที่ / Date">
                  <Input name="date" type="date" defaultValue={today()} />
                </Field>
                <Field label="เลขไมล์ / Odometer">
                  <Input name="odometer" type="number" />
                </Field>
              </div>
              <Field label="หมวด / Category">
                <Select value={logCategory} onValueChange={setLogCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label_th} ({c.label_en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="รายละเอียด / Details">
                <Input name="details" />
              </Field>
              <ProviderSelect
                providers={providers}
                value={logProvider}
                onChange={setLogProvider}
              />
              <div className="grid grid-cols-3 gap-2">
                <Field label="ค่าอะไหล่">
                  <Input name="cost_parts" type="number" step="0.01" placeholder="0" />
                </Field>
                <Field label="ค่าแรง">
                  <Input name="cost_labor" type="number" step="0.01" placeholder="0" />
                </Field>
                <Field label="อื่นๆ">
                  <Input name="cost_misc" type="number" step="0.01" placeholder="0" />
                </Field>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={pending || !logVehicle}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึก
              </Button>
            </form>
          </TabsContent>

          {/* ---- Repair ---- */}
          <TabsContent value="repair">
            <form
              action={(fd) => {
                fd.set("vehicle_id", repVehicle);
                fd.set("urgency", repUrgency);
                fd.set("provider_id", repProvider === "none" ? "" : repProvider);
                handle(createRepairEvent, fd, "บันทึกประวัติการซ่อมบำรุงเรียบร้อยแล้ว");
              }}
              className="space-y-3"
            >
              <VehicleSelect vehicles={vehicles} value={repVehicle} onChange={setRepVehicle} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="วันที่ / Date">
                  <Input name="date" type="date" defaultValue={today()} />
                </Field>
                <Field label="ความเร่งด่วน / Urgency">
                  <Select value={repUrgency} onValueChange={setRepUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(repairUrgencyLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.th}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="อาการ / Symptom">
                <Input name="symptom" />
              </Field>
              <Field label="การวินิจฉัย / Diagnosis">
                <Input name="diagnosis" />
              </Field>
              <Field label="การแก้ไข / Action taken">
                <Textarea name="action_taken" rows={2} />
              </Field>
              <Field label="อะไหล่ที่ใช้ / Parts used">
                <Input name="parts_used" />
              </Field>
              <ProviderSelect
                providers={providers}
                value={repProvider}
                onChange={setRepProvider}
              />
              <Field label="ค่าใช้จ่ายรวม / Total cost">
                <Input name="total_cost" type="number" step="0.01" placeholder="0" />
              </Field>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={pending || !repVehicle}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึก
              </Button>
            </form>
          </TabsContent>

          {/* ---- Renewal ---- */}
          <TabsContent value="renewal">
            <form
              action={(fd) => {
                fd.set("vehicle_id", renVehicle);
                fd.set("type", renType);
                fd.set("status", "upcoming");
                handle(createRenewal, fd, "บันทึกประวัติการต่ออายุเรียบร้อยแล้ว");
              }}
              className="space-y-3"
            >
              <VehicleSelect vehicles={vehicles} value={renVehicle} onChange={setRenVehicle} />
              <Field label="ประเภท / Type">
                <Select value={renType} onValueChange={setRenType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(renewalTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="วันครบกำหนด / Due date">
                  <Input name="due_date" type="date" required />
                </Field>
                <Field label="ประมาณการค่าใช้จ่าย">
                  <Input name="cost_estimate" type="number" step="0.01" placeholder="0" />
                </Field>
              </div>
              <Field label="หมายเหตุ / Note">
                <Textarea name="note" rows={2} />
              </Field>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={pending || !renVehicle}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึก
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
