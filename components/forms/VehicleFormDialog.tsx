"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { createVehicle } from "@/app/actions";

export function VehicleFormDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fuel, setFuel] = useState("gasoline");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("fuel_type", fuel);
    startTransition(async () => {
      const res = await createVehicle(formData);
      if (res.ok) {
        setOpen(false);
        setFuel("gasoline");
      } else {
        setError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> เพิ่มรถ
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มรถใหม่</DialogTitle>
          <DialogDescription>Add a vehicle to your garage</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ยี่ห้อ / Brand" htmlFor="brand">
              <Input id="brand" name="brand" required placeholder="Toyota" />
            </Field>
            <Field label="รุ่น / Model" htmlFor="model">
              <Input id="model" name="model" required placeholder="Yaris" />
            </Field>
            <Field label="ปี / Year" htmlFor="year">
              <Input id="year" name="year" type="number" placeholder="2022" />
            </Field>
            <Field label="ทะเบียน / Plate" htmlFor="plate_no">
              <Input id="plate_no" name="plate_no" placeholder="กท 1234" />
            </Field>
            <Field label="ประเภทเชื้อเพลิง / Fuel" htmlFor="fuel_type">
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger id="fuel_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fuelTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.th} ({v.en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="เลขไมล์ / Odometer (km)" htmlFor="odometer">
              <Input id="odometer" name="odometer" type="number" placeholder="35000" />
            </Field>
            <Field label="เลขตัวถัง / VIN" htmlFor="vin">
              <Input id="vin" name="vin" />
            </Field>
            <Field label="วันที่ซื้อ / Purchase date" htmlFor="purchase_date">
              <Input id="purchase_date" name="purchase_date" type="date" />
            </Field>
          </div>
          <Field label="หมายเหตุ / Note" htmlFor="note">
            <Textarea id="note" name="note" rows={2} />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
