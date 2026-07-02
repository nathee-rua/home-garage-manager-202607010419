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
import { Checkbox } from "@/components/ui/checkbox";
import { createServiceCategory, updateServiceCategory } from "@/app/actions";
import type { ServiceCategory } from "@/lib/types";

interface ServiceCategoryFormProps {
  category?: ServiceCategory;
}

export function ServiceCategoryForm({ category }: ServiceCategoryFormProps) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evRelevant, setEvRelevant] = useState(category?.ev_relevant ?? false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("ev_relevant", evRelevant ? "true" : "false");
    startTransition(async () => {
      const res = isEdit
        ? await updateServiceCategory(category.code, formData)
        : await createServiceCategory(formData);
      if (res.ok) {
        toast.success(
          isEdit
            ? "แก้ไขหมวดหมู่บำรุงรักษาสำเร็จ"
            : "เพิ่มหมวดหมู่บำรุงรักษาสำเร็จ"
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
          <Plus className="h-4 w-4" /> เพิ่มหมวดหมู่
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขหมวดหมู่บำรุงรักษา" : "เพิ่มหมวดหมู่บำรุงรักษา"}
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sc-code">Code</Label>
              <Input
                id="sc-code"
                name="code"
                required
                disabled={isEdit}
                defaultValue={category?.code ?? ""}
                placeholder="brake_pad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-th">ชื่อไทย / Thai name</Label>
              <Input
                id="sc-th"
                name="label_th"
                required
                defaultValue={category?.label_th ?? ""}
                placeholder="ผ้าเบรก"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-en">ชื่ออังกฤษ / English name</Label>
              <Input
                id="sc-en"
                name="label_en"
                required
                defaultValue={category?.label_en ?? ""}
                placeholder="Brake Pad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-km">ระยะทาง (กม.)</Label>
              <Input
                id="sc-km"
                name="default_interval_km"
                type="number"
                placeholder="10000"
                defaultValue={category?.default_interval_km ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-months">ระยะเวลา (เดือน)</Label>
              <Input
                id="sc-months"
                name="default_interval_months"
                type="number"
                placeholder="6"
                defaultValue={category?.default_interval_months ?? ""}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="sc-ev"
              checked={evRelevant}
              onCheckedChange={(v) => setEvRelevant(v === true)}
            />
            <Label htmlFor="sc-ev" className="cursor-pointer">
              เกี่ยวกับ EV / EV Relevant
            </Label>
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
