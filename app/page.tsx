import { Car, AlertTriangle, Clock3, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { RemindersTable } from "@/components/RemindersTable";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { VehicleFormDialog } from "@/components/forms/VehicleFormDialog";
import { ConfigBanner } from "@/components/ConfigBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getVehicles,
  getServiceRules,
  getServiceEvents,
  getRenewals,
  getProviders,
  getServiceCategories,
} from "@/lib/queries";
import { buildReminders, computeDashboardStats } from "@/lib/reminders";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [vehicles, rules, events, renewals, providers, categories] = await Promise.all([
    getVehicles(),
    getServiceRules(),
    getServiceEvents(),
    getRenewals(),
    getProviders(),
    getServiceCategories(),
  ]);

  const reminders = buildReminders(vehicles, rules, events, renewals);
  const stats = computeDashboardStats(vehicles, reminders);
  const actionable = reminders.filter((r) => r.status !== "normal");

  return (
    <div className="space-y-6">
      <PageHeader
        title="แดชบอร์ด"
        subtitle="ภาพรวมการดูแลรักษารถทั้งหมด · Overview"
        actions={
          <>
            <QuickAddSheet
              vehicles={vehicles}
              providers={providers}
              categories={categories}
            />
            <VehicleFormDialog />
          </>
        }
      />

      <ConfigBanner />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="รถทั้งหมด" value={stats.totalVehicles} icon={Car} />
        <StatCard
          label="เกินกำหนด"
          value={stats.overdueCount}
          icon={AlertTriangle}
          tone={stats.overdueCount > 0 ? "danger" : "default"}
        />
        <StatCard
          label="ใกล้ถึงกำหนด"
          value={stats.dueSoonCount}
          icon={Clock3}
          tone={stats.dueSoonCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="ครบกำหนดเดือนนี้"
          value={stats.upcomingThisMonth}
          icon={CalendarDays}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            รายการที่ต้องดำเนินการ (เรียงตามความเร่งด่วน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RemindersTable
            reminders={actionable.length > 0 ? actionable : reminders}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
