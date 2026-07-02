import { Suspense } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { RenewalsTable } from "@/components/tables/RenewalsTable";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { VehicleFilter } from "@/components/Filters";
import { ConfigBanner } from "@/components/ConfigBanner";
import { StatCard } from "@/components/StatCard";
import {
  getRenewals,
  getVehicles,
  getProviders,
  getServiceCategories,
  getVehicleRelatedAttachments,
} from "@/lib/queries";
import { computeStatus } from "@/lib/dueEngine";

export const dynamic = "force-dynamic";

export default async function RenewalsPage({
  searchParams,
}: {
  searchParams: { vehicle?: string };
}) {
  const [vehicles, providers, categories] = await Promise.all([
    getVehicles(),
    getProviders(),
    getServiceCategories(),
  ]);
  const renewals = await getRenewals(searchParams.vehicle);
  const eventIds = renewals.map((r) => r.id);
  const attachments = await getVehicleRelatedAttachments("", eventIds);

  let overdue = 0;
  let dueSoon = 0;
  for (const r of renewals) {
    if (r.status === "done") continue;
    const s = computeStatus({
      nextDueDate: r.due_date,
      nextDueOdometer: null,
      currentOdometer: null,
    });
    if (s === "overdue") overdue++;
    else if (s === "due_soon") dueSoon++;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ต่ออายุ"
        subtitle="ประกันภัย · พ.ร.บ. · ภาษี · ตรวจสภาพ · Renewals"
        icon={CalendarClock}
        actions={
          <QuickAddSheet vehicles={vehicles} providers={providers} categories={categories} />
        }
      />
      <ConfigBanner />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="ทั้งหมด" value={renewals.length} />
        <StatCard label="เกินกำหนด" value={overdue} tone={overdue > 0 ? "danger" : "default"} />
        <StatCard
          label="ใกล้ถึงกำหนด"
          value={dueSoon}
          tone={dueSoon > 0 ? "warning" : "default"}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Suspense fallback={null}>
          <VehicleFilter vehicles={vehicles} />
        </Suspense>
      </div>
      <Card>
        <CardContent className="pt-6">
           <RenewalsTable
            renewals={renewals}
            vehicles={vehicles}
            attachments={attachments}
            showVehicle
          />
        </CardContent>
      </Card>
    </div>
  );
}
