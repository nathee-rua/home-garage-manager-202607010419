import Link from "next/link";
import { Car, Gauge, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DueBadge } from "@/components/DueBadge";
import { fuelTypeLabels } from "@/lib/labels";
import type { Vehicle, DueStatus } from "@/lib/types";

export function VehicleCard({
  vehicle,
  worstStatus,
  nextDueSummary,
}: {
  vehicle: Vehicle;
  worstStatus?: DueStatus;
  nextDueSummary?: string;
}) {
  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.plate_no ?? "ไม่ระบุทะเบียน"}
                  {vehicle.year ? ` · ${vehicle.year}` : ""}
                </p>
              </div>
            </div>
            {worstStatus ? <DueBadge status={worstStatus} /> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{fuelTypeLabels[vehicle.fuel_type].th}</Badge>
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.odometer.toLocaleString()} {vehicle.odometer_unit}
            </span>
          </div>
          {nextDueSummary ? (
            <p className="text-sm text-muted-foreground">{nextDueSummary}</p>
          ) : null}
          <div className="flex items-center justify-end text-sm font-medium text-primary">
            ดูรายละเอียด <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
