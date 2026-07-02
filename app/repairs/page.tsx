import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { RepairEventsTable } from "@/components/tables/RepairEventsTable";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { VehicleFilter } from "@/components/Filters";
import { ConfigBanner } from "@/components/ConfigBanner";
import {
  getRepairEvents,
  getVehicles,
  getProviders,
  getServiceCategories,
  getVehicleRelatedAttachments,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: { vehicle?: string };
}) {
  const [vehicles, providers, categories] = await Promise.all([
    getVehicles(),
    getProviders(),
    getServiceCategories(),
  ]);
  const events = await getRepairEvents(searchParams.vehicle);
  const eventIds = events.map((e) => e.id);
  const attachments = await getVehicleRelatedAttachments("", eventIds);

  return (
    <div className="space-y-6">
      <PageHeader
        title="การซ่อม"
        subtitle="Repair log · บันทึกการซ่อมทั้งหมด"
        icon={AlertTriangle}
        actions={
          <QuickAddSheet vehicles={vehicles} providers={providers} categories={categories} />
        }
      />
      <ConfigBanner />
      <div className="flex flex-wrap gap-2">
        <Suspense fallback={null}>
          <VehicleFilter vehicles={vehicles} />
        </Suspense>
      </div>
      <Card>
        <CardContent className="pt-6">
          <RepairEventsTable
            events={events}
            vehicles={vehicles}
            providers={providers}
            attachments={attachments}
            showVehicle
          />
        </CardContent>
      </Card>
    </div>
  );
}
