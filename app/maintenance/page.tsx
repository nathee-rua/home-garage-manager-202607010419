import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceEventsTable } from "@/components/tables/ServiceEventsTable";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { VehicleFilter, CategoryFilter } from "@/components/Filters";
import { ConfigBanner } from "@/components/ConfigBanner";
import {
  getServiceEvents,
  getVehicles,
  getProviders,
  getServiceCategories,
  getVehicleRelatedAttachments,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: { vehicle?: string; category?: string };
}) {
  const [vehicles, providers, categories] = await Promise.all([
    getVehicles(),
    getProviders(),
    getServiceCategories(),
  ]);
  let events = await getServiceEvents(searchParams.vehicle);
  if (searchParams.category) {
    events = events.filter((e) => e.category === searchParams.category);
  }
  const eventIds = events.map((e) => e.id);
  const attachments = await getVehicleRelatedAttachments("", eventIds);

  return (
    <div className="space-y-6">
      <PageHeader
        title="การบำรุงรักษา"
        subtitle="Maintenance log · บันทึกการบำรุงรักษาทั้งหมด"
        actions={
          <QuickAddSheet vehicles={vehicles} providers={providers} categories={categories} />
        }
      />
      <ConfigBanner />
      <div className="flex flex-wrap gap-2">
        <Suspense fallback={null}>
          <VehicleFilter vehicles={vehicles} />
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ServiceEventsTable
            events={events}
            categories={categories}
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
