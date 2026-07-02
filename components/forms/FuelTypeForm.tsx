"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFuelType, updateFuelType } from "@/app/actions";
import type { FuelTypeRecord } from "@/lib/types";

interface FuelTypeFormProps {
  fuelType?: FuelTypeRecord;
}

export function FuelTypeForm({ fuelType }: FuelTypeFormProps) {
  const isEdit = !!fuelType;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateFuelType(fuelType.code, formData)
        : await createFuelType(formData);
      if (res.ok) {
        toast.success(
          isEdit
            ? "แก้ไขประเภทเชื้อเพลิงสำเร็จ"
            : "เพิ่มประเภทเชื้อเพลิงสำเร็จ"
        );
        setOpen(false);
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
        setError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="แก้ไข">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> เพิ่มเชื้อเพลิง
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขประเภทเชื้อเพลิง" : "เพิ่มประเภทเชื้อเพลิง"}
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ft-code">Code</Label>
              <Input
                id="ft-code"
                name="code"
                required
                disabled={isEdit}
                defaultValue={fuelType?.code ?? ""}
                placeholder="diesel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ft-sort">ลำดับ / Sort order</Label>
              <Input
                id="ft-sort"
                name="sort_order"
                type="number"
                defaultValue={fuelType?.sort_order ?? 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ft-th">ชื่อไทย / Thai name</Label>
              <Input
                id="ft-th"
                name="label_th"
                required
                defaultValue={fuelType?.label_th ?? ""}
                placeholder="ดีเซล"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ft-en">ชื่ออังกฤษ / English name</Label>
              <Input
                id="ft-en"
                name="label_en"
                required
                defaultValue={fuelType?.label_en ?? ""}
                placeholder="Diesel"
              />
            </div>
          </div>
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
