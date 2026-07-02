import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wrench, Pencil, Car } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { OdometerEditor } from "@/components/OdometerEditor";
import { ServiceRuleForm } from "@/components/forms/ServiceRuleForm";
import { VehicleFormDialog } from "@/components/forms/VehicleFormDialog";
import { ServiceEventsTable } from "@/components/tables/ServiceEventsTable";
import { RepairEventsTable } from "@/components/tables/RepairEventsTable";
import { RenewalsTable } from "@/components/tables/RenewalsTable";
import { AttachmentUploader } from "@/components/AttachmentUploader";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getVehicle,
  getServiceRules,
  getServiceEvents,
  getRepairEvents,
  getRenewals,
  getProviders,
  getServiceCategories,
  getVehicleRelatedAttachments,
  getPlannedJobs,
  getFuelTypes,
} from "@/lib/queries";
import { fuelTypeLabels } from "@/lib/labels";
import { serviceCategoryLabelFull } from "@/lib/categoryLabels";
import { formatDate, formatTHB } from "@/lib/utils";
import { deleteServiceRule, deleteVehicle } from "@/app/actions";
import { PlannedJobForm } from "@/components/forms/PlannedJobForm";
import { PlannedJobsTable } from "@/components/tables/PlannedJobsTable";
import { VehicleReportTab } from "@/components/forms/VehicleReportTab";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const vehicle = await getVehicle(params.id);
  if (!vehicle) notFound();

  const [rules, events, repairs, renewals, providers, categories, plannedJobs, fuelTypes] =
    await Promise.all([
      getServiceRules(params.id),
      getServiceEvents(params.id),
      getRepairEvents(params.id),
      getRenewals(params.id),
      getProviders(),
      getServiceCategories(),
      getPlannedJobs(params.id),
      getFuelTypes(),
    ]);

  const eventIds = [
    ...events.map((e) => e.id),
    ...repairs.map((r) => r.id),
    ...renewals.map((rn) => rn.id),
  ];
  const allAttachments = await getVehicleRelatedAttachments(params.id, eventIds);

  const vehicleAttachments = allAttachments.filter((a) => a.entity_type === "vehicle");
  const serviceAttachments = allAttachments.filter((a) => a.entity_type === "service_event");
  const repairAttachments = allAttachments.filter((a) => a.entity_type === "repair_event");
  const renewalAttachments = allAttachments.filter((a) => a.entity_type === "renewal");

  const serviceTotal = events.reduce(
    (s, e) => s + Number(e.cost_parts) + Number(e.cost_labor) + Number(e.cost_misc),
    0
  );
  const repairTotal = repairs.reduce((s, r) => s + Number(r.total_cost), 0);
  const renewalTotal = renewals
    .filter((r) => r.status === "done")
    .reduce((s, r) => s + Number(r.cost_estimate), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>

      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        subtitle={`${vehicle.plate_no ?? "ไม่ระบุทะเบียน"}${vehicle.year ? ` · ปี ${vehicle.year}` : ""}`}
        icon={Car}
        actions={
          <>
            <QuickAddSheet
              vehicles={[vehicle]}
              providers={providers}
              categories={categories}
              defaultVehicleId={vehicle.id}
              label="บันทึกด่วน"
            />
            <VehicleFormDialog vehicle={vehicle} fuelTypes={fuelTypes} />
            <DeleteButton
              action={deleteVehicle.bind(null, vehicle.id)}
              confirmText="ลบรถคันนี้และข้อมูลทั้งหมด?"
            />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{fuelTypeLabels[vehicle.fuel_type].th}</Badge>
        {vehicle.vin ? <Badge variant="outline">VIN: {vehicle.vin}</Badge> : null}
        {vehicle.purchase_date ? (
          <Badge variant="outline">ซื้อเมื่อ {formatDate(vehicle.purchase_date)}</Badge>
        ) : null}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="maintenance">บำรุงรักษา</TabsTrigger>
          <TabsTrigger value="repairs">ซ่อม</TabsTrigger>
          <TabsTrigger value="renewals">ต่ออายุ</TabsTrigger>
          <TabsTrigger value="planned">แผนงาน</TabsTrigger>
          <TabsTrigger value="expenses">ค่าใช้จ่าย</TabsTrigger>
          <TabsTrigger value="attachments">เอกสารแนบ</TabsTrigger>
          <TabsTrigger value="report">รายงาน</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="ค่าบำรุงรักษารวม" value={formatTHB(serviceTotal)} />
            <StatCard label="ค่าซ่อมรวม" value={formatTHB(repairTotal)} />
            <StatCard label="จำนวนบันทึก" value={events.length + repairs.length} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">เลขไมล์</CardTitle>
            </CardHeader>
            <CardContent>
              <OdometerEditor
                vehicleId={vehicle.id}
                odometer={vehicle.odometer}
                unit={vehicle.odometer_unit}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                กฎการบำรุงรักษา (Service rules)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ServiceRuleForm vehicleId={vehicle.id} categories={categories} />
              {rules.length === 0 ? (
                <EmptyState
                  icon={Wrench}
                  title="ยังไม่มีกฎการบำรุงรักษา"
                  description="ตั้งกฎ เช่น เปลี่ยนน้ำมันเครื่องทุก 10,000 กม. หรือทุก 6 เดือน"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หมวด</TableHead>
                      <TableHead>ทุกๆ (กม.)</TableHead>
                      <TableHead>ทุกๆ (เดือน)</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {serviceCategoryLabelFull(r.category, categories)}
                        </TableCell>
                        <TableCell>{r.interval_km ?? "-"}</TableCell>
                        <TableCell>{r.interval_months ?? "-"}</TableCell>
                        <TableCell>
                          <DeleteButton action={deleteServiceRule.bind(null, r.id)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {vehicle.note ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">หมายเหตุ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {vehicle.note}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <Card>
            <CardContent className="pt-6">
              <ServiceEventsTable
                events={events}
                categories={categories}
                providers={providers}
                attachments={serviceAttachments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repairs */}
        <TabsContent value="repairs">
          <Card>
            <CardContent className="pt-6">
              <RepairEventsTable
                events={repairs}
                providers={providers}
                attachments={repairAttachments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renewals */}
        <TabsContent value="renewals">
          <Card>
            <CardContent className="pt-6">
              <RenewalsTable
                renewals={renewals}
                attachments={renewalAttachments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planned Jobs */}
        <TabsContent value="planned" className="space-y-6">
          <PlannedJobForm vehicleId={vehicle.id} />
          <Card>
            <CardContent className="pt-6">
              <PlannedJobsTable jobs={plannedJobs} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">สรุปค่าใช้จ่ายของรถคันนี้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm pt-6">
              <div className="flex justify-between border-b py-2">
                <span>ค่าบำรุงรักษา / Maintenance</span>
                <span className="tabular-nums font-medium">{formatTHB(serviceTotal)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span>ค่าซ่อมแซม / Repairs</span>
                <span className="tabular-nums font-medium">{formatTHB(repairTotal)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span>ค่าต่ออายุภาษี/พ.ร.บ./ประกันภัย / Renewals</span>
                <span className="tabular-nums font-medium">{formatTHB(renewalTotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-semibold">
                <span>รวมทั้งหมด / Grand Total</span>
                <span className="tabular-nums">{formatTHB(serviceTotal + repairTotal + renewalTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments */}
        <TabsContent value="attachments">
          <Card>
            <CardContent className="pt-6">
              <AttachmentUploader
                entityType="vehicle"
                entityId={vehicle.id}
                vehicleId={vehicle.id}
                attachments={vehicleAttachments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="report">
          <VehicleReportTab
            vehicle={vehicle}
            services={events}
            repairs={repairs}
            renewals={renewals}
            providers={providers}
            categories={categories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
