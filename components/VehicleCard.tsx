import Link from "next/link";
import { Gauge, ChevronRight, Fuel } from "lucide-react";
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
      <Card className="relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 bg-slate-950 text-slate-100 border border-slate-800 shadow-md hover:shadow-lg rounded-2xl min-h-[190px] flex flex-col justify-between">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-800/10 blur-xl group-hover:bg-slate-800/20 transition-all duration-300" />
        
        <CardContent className="p-6 flex flex-col h-full justify-between flex-1">
          {/* Top Section */}
          <div className="flex items-start justify-between w-full">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Vehicle Profile</span>
              <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-400">
                {vehicle.year ? `Model Year ${vehicle.year}` : "No year specified"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono font-bold text-slate-600 tracking-widest">GARAGE IO</span>
              {worstStatus ? <DueBadge status={worstStatus} /> : null}
            </div>
          </div>

          {/* Middle Section: Formatted plate number like credit card numbers */}
          <div className="my-5">
            <p className="text-sm tracking-wide text-slate-200 font-medium">
              {vehicle.plate_no ? vehicle.plate_no : "ไม่ระบุทะเบียน / No License"}
            </p>
            {nextDueSummary ? (
              <p className="text-[11px] text-slate-400 truncate mt-1">{nextDueSummary}</p>
            ) : null}
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between border-t border-slate-800/60 pt-3 mt-auto">
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Odometer</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-200">
                <Gauge className="h-3.5 w-3.5 text-slate-500" />
                <span>{vehicle.odometer.toLocaleString()} {vehicle.odometer_unit}</span>
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Fuel Type</p>
              <Badge variant="secondary" className="bg-slate-900 hover:bg-slate-900 text-slate-300 text-[10px] font-medium border border-slate-800 px-2 py-0">
                {fuelTypeLabels[vehicle.fuel_type]?.th ?? vehicle.fuel_type}
              </Badge>
            </div>
          </div>
        </CardContent>

        {/* Absolute Hover Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <ChevronRight className="h-5 w-5 text-amber-200" />
        </div>
      </Card>
    </Link>
  );
}
