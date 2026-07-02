"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/forms/Field";
import { createServiceRule } from "@/app/actions";
import type { ServiceCategory } from "@/lib/types";

export function ServiceRuleForm({
  vehicleId,
  categories,
}: {
  vehicleId: string;
  categories: ServiceCategory[];
}) {
  const [category, setCategory] = useState(categories[0]?.code ?? "engine_oil");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        fd.set("vehicle_id", vehicleId);
        fd.set("category", category);
        startTransition(async () => {
          const res = await createServiceRule(fd);
          if (res.ok) {
            toast.success("เพิ่มกฎการบำรุงรักษาเรียบร้อยแล้ว");
          } else {
            toast.error(res.error ?? "เกิดข้อผิดพลาด");
            setError(res.error ?? "เกิดข้อผิดพลาด");
          }
        });
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-4"
    >
      <Field label="หมวด / Category">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label_th}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="ทุกๆ (กม.) / Every km">
        <Input name="interval_km" type="number" placeholder="10000" />
      </Field>
      <Field label="ทุกๆ (เดือน) / Every months">
        <Input name="interval_months" type="number" placeholder="6" />
      </Field>
      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          เพิ่มกฎ
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive sm:col-span-4">{error}</p> : null}
    </form>
  );
}
