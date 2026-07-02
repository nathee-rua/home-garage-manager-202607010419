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
import { providerTypeLabels } from "@/lib/labels";
import { createProvider, updateProvider } from "@/app/actions";
import type { Provider, ProviderType } from "@/lib/types";

interface ProviderFormDialogProps {
  provider?: Provider;
}

export function ProviderFormDialog({ provider }: ProviderFormDialogProps) {
  const isEdit = !!provider;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(provider?.type ?? "dealer");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="แก้ไข">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> เพิ่มร้าน/ศูนย์
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขร้าน/ศูนย์บริการ" : "เพิ่มร้าน / ศูนย์บริการ"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Edit provider details" : "Add a service provider"}
          </DialogDescription>
        </DialogHeader>
        <form
          action={(fd) => {
            setError(null);
            fd.set("type", type);
            startTransition(async () => {
              const res = isEdit
                ? await updateProvider(provider.id, fd)
                : await createProvider(fd);
              if (res.ok) {
                toast.success(
                  isEdit
                    ? "แก้ไขข้อมูลร้าน/ศูนย์บริการสำเร็จแล้ว"
                    : "เพิ่มข้อมูลร้าน/ศูนย์บริการสำเร็จแล้ว"
                );
                setOpen(false);
                if (!isEdit) setType("dealer");
              } else {
                toast.error(res.error ?? "เกิดข้อผิดพลาด");
                setError(res.error ?? "เกิดข้อผิดพลาด");
              }
            });
          }}
          className="space-y-4"
        >
          <Field label="ชื่อ / Name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={provider?.name ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ประเภท / Type">
              <Select value={type} onValueChange={(val) => setType(val as ProviderType)}>
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
              <Input id="branch" name="branch" defaultValue={provider?.branch ?? ""} />
            </Field>
            <Field label="โทรศัพท์ / Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={provider?.phone ?? ""} />
            </Field>
            <Field label="LINE" htmlFor="line_contact">
              <Input id="line_contact" name="line_contact" defaultValue={provider?.line_contact ?? ""} />
            </Field>
          </div>
          <Field label="หมายเหตุ / Note" htmlFor="note">
            <Textarea id="note" name="note" rows={2} defaultValue={provider?.note ?? ""} />
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
