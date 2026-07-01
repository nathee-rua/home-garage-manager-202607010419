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
import { providerTypeLabels } from "@/lib/labels";
import { createProvider } from "@/app/actions";

export function ProviderFormDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("dealer");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> เพิ่มร้าน/ศูนย์
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มร้าน / ศูนย์บริการ</DialogTitle>
          <DialogDescription>Add a service provider</DialogDescription>
        </DialogHeader>
        <form
          action={(fd) => {
            setError(null);
            fd.set("type", type);
            startTransition(async () => {
              const res = await createProvider(fd);
              if (res.ok) {
                setOpen(false);
                setType("dealer");
              } else setError(res.error ?? "เกิดข้อผิดพลาด");
            });
          }}
          className="space-y-4"
        >
          <Field label="ชื่อ / Name" htmlFor="name">
            <Input id="name" name="name" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ประเภท / Type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providerTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="สาขา / Branch" htmlFor="branch">
              <Input id="branch" name="branch" />
            </Field>
            <Field label="โทรศัพท์ / Phone" htmlFor="phone">
              <Input id="phone" name="phone" />
            </Field>
            <Field label="LINE" htmlFor="line_contact">
              <Input id="line_contact" name="line_contact" />
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
