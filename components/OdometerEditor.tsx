"use client";

import { useState, useTransition } from "react";
import { Gauge, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateVehicleOdometer } from "@/app/actions";

export function OdometerEditor({
  vehicleId,
  odometer,
  unit,
}: {
  vehicleId: string;
  odometer: number;
  unit: string;
}) {
  const [value, setValue] = useState(String(odometer));
  const [pending, startTransition] = useTransition();
  const dirty = value !== String(odometer);

  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Gauge className="h-4 w-4" /> เลขไมล์ปัจจุบัน ({unit})
        </label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-40"
        />
      </div>
      <Button
        variant="secondary"
        disabled={!dirty || pending}
        onClick={() =>
          startTransition(async () => {
            await updateVehicleOdometer(vehicleId, Number(value) || 0);
          })
        }
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        อัปเดต
      </Button>
    </div>
  );
}
