import { Car } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFormDialog } from "@/components/forms/VehicleFormDialog";
import { EmptyState } from "@/components/EmptyState";
import { ConfigBanner } from "@/components/ConfigBanner";
import {
  getVehicles,
  getServiceRules,
  getServiceEvents,
  getRenewals,
} from "@/lib/queries";
import { buildReminders } from "@/lib/reminders";
import type { DueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const rank: Record<DueStatus, number> = { overdue: 0, due_soon: 1, normal: 2 };

export default async function VehiclesPage() {
  const [vehicles, rules, events, renewals] = await Promise.all([
    getVehicles(),
    getServiceRules(),
    getServiceEvents(),
    getRenewals(),
  ]);

  const reminders = buildReminders(vehicles, rules, events, renewals);

  // Worst status per vehicle
  const worst = new Map<string, DueStatus>();
  for (const r of reminders) {
    const cur = worst.get(r.vehicleId);
    if (!cur || rank[r.status] < rank[cur]) worst.set(r.vehicleId, r.status);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="รถของฉัน"
        subtitle="Vehicles · จัดการรถทั้งหมดในครัวเรือน"
        icon={Car}
        actions={<VehicleFormDialog />}
      />
      <ConfigBanner />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="ยังไม่มีรถ"
          description="เริ่มต้นด้วยการเพิ่มรถคันแรกของคุณ"
          action={<VehicleFormDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} worstStatus={worst.get(v.id) ?? "normal"} />
          ))}
        </div>
      )}
    </div>
  );
}
