"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateRenewalStatus, completeRenewal } from "@/app/actions";
import { toast } from "sonner";

export function RenewalStatusControl({
  id,
  status,
  costEstimate = 0,
}: {
  id: string;
  status: string;
  costEstimate?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actualCost, setActualCost] = useState(costEstimate);
  const done = status === "done";

  function handleToggle() {
    if (done) {
      // If already done, toggle back to upcoming without any dialog
      startTransition(async () => {
        const res = await updateRenewalStatus(id, "upcoming");
        if (res.ok) {
          toast.success("ยกเลิกสถานะเสร็จสิ้นเรียบร้อยแล้ว");
        } else {
          toast.error(res.error ?? "เกิดข้อผิดพลาด");
        }
      });
    } else {
      // If not done, open dialog to input/confirm actual cost
      setActualCost(costEstimate);
      setDialogOpen(true);
    }
  }

  function handleConfirmComplete() {
    setDialogOpen(false);
    startTransition(async () => {
      const res = await completeRenewal(id, actualCost);
      if (res.ok) {
        toast.success("บันทึกการต่ออายุเสร็จสิ้นเรียบร้อยแล้ว");
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <>
      <Button
        variant={done ? "outline" : "secondary"}
        size="sm"
        onClick={handleToggle}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : done ? (
          <RotateCcw className="h-4 w-4 mr-1" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        {done ? "ยกเลิก" : "เสร็จแล้ว"}
      </Button>

      {/* Actual Cost Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <span>ยืนยันค่าใช้จ่ายจริง / Confirm Actual Cost</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              กรุณาระบุจำนวนเงินค่าใช้จ่ายจริงที่เกิดขึ้นในการต่ออายุครั้งนี้ เพื่อใช้คำนวณในรายงานอย่างถูกต้อง
            </p>
            <div className="space-y-2">
              <Label htmlFor="actual_cost" className="font-semibold text-xs">
                ค่าใช้จ่ายจริง (บาท) / Actual Cost (THB)
              </Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-[11px] text-muted-foreground">
                (ค่าที่ประมาณการไว้ตอนแรกคือ: {costEstimate.toLocaleString()} บาท)
              </p>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmComplete} className="bg-emerald-600 hover:bg-emerald-700">
              บันทึกและเสร็จสิ้น
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
