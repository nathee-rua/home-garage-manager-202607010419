"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { fuelTypeLabels } from "@/lib/labels";
import { createVehicle, updateVehicle } from "@/app/actions";
import type { Vehicle, FuelTypeRecord } from "@/lib/types";

interface VehicleFormDialogProps {
  vehicle?: Vehicle;
  fuelTypes?: FuelTypeRecord[];
}

export function VehicleFormDialog({ vehicle, fuelTypes }: VehicleFormDialogProps) {
  const isEdit = !!vehicle;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fuel, setFuel] = useState(vehicle?.fuel_type ?? "gasoline");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("fuel_type", fuel);
    startTransition(async () => {
      const res = isEdit
        ? await updateVehicle(vehicle.id, formData)
        : await createVehicle(formData);
      if (res.ok) {
        toast.success(
          isEdit
            ? "แก้ไขข้อมูลรถยนต์สำเร็จแล้ว"
            : "เพิ่มข้อมูลรถยนต์สำเร็จแล้ว"
        );
        setOpen(false);
        if (!isEdit) setFuel("gasoline");
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
        setError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  // Build fuel type options: prefer fuelTypes prop (from DB), fall back to static labels
  const fuelOptions: { key: string; label: string }[] = fuelTypes
    ? fuelTypes.map((ft) => ({
        key: ft.code,
        label: `${ft.label_th} (${ft.label_en})`,
      }))
    : Object.entries(fuelTypeLabels).map(([k, v]) => ({
        key: k,
        label: `${v.th} (${v.en})`,
      }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="แก้ไข">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> เพิ่มรถ
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขรถยนต์ / Edit Vehicle" : "เพิ่มรถใหม่"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Edit vehicle details" : "Add a vehicle to your garage"}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ยี่ห้อ / Brand" htmlFor="brand">
              <Input id="brand" name="brand" required placeholder="Toyota" defaultValue={vehicle?.brand ?? ""} />
            </Field>
            <Field label="รุ่น / Model" htmlFor="model">
              <Input id="model" name="model" required placeholder="Yaris" defaultValue={vehicle?.model ?? ""} />
            </Field>
            <Field label="ปี / Year" htmlFor="year">
              <Input id="year" name="year" type="number" placeholder="2022" defaultValue={vehicle?.year ?? ""} />
            </Field>
            <Field label="ทะเบียน / Plate" htmlFor="plate_no">
              <Input id="plate_no" name="plate_no" placeholder="กท 1234" defaultValue={vehicle?.plate_no ?? ""} />
            </Field>
            <Field label="ประเภทเชื้อเพลิง / Fuel" htmlFor="fuel_type">
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger id="fuel_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelOptions.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="เลขไมล์ / Odometer (km)" htmlFor="odometer">
              <Input id="odometer" name="odometer" type="number" placeholder="35000" defaultValue={vehicle?.odometer ?? ""} />
            </Field>
            <Field label="เลขตัวถัง / VIN" htmlFor="vin">
              <Input id="vin" name="vin" defaultValue={vehicle?.vin ?? ""} />
            </Field>
            <Field label="วันที่ซื้อ / Purchase date" htmlFor="purchase_date">
              <Input id="purchase_date" name="purchase_date" type="date" defaultValue={vehicle?.purchase_date ?? ""} />
            </Field>
          </div>
          <Field label="หมายเหตุ / Note" htmlFor="note">
            <Textarea id="note" name="note" rows={2} defaultValue={vehicle?.note ?? ""} />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
