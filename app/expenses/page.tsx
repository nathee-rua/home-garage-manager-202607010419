import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CSVExportButton } from "@/components/CSVExportButton";
import { EmptyState } from "@/components/EmptyState";
import { ConfigBanner } from "@/components/ConfigBanner";
import { StatCard } from "@/components/StatCard";
import {
  getServiceEvents,
  getRepairEvents,
  getVehicles,
  getServiceCategories,
} from "@/lib/queries";
import { serviceCategoryLabel } from "@/lib/categoryLabels";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [vehicles, events, repairs, categories] = await Promise.all([
    getVehicles(),
    getServiceEvents(),
    getRepairEvents(),
    getServiceCategories(),
  ]);

  const vName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}${v.plate_no ? ` (${v.plate_no})` : ""}` : id;
  };

  const svcCost = (e: (typeof events)[number]) =>
    Number(e.cost_parts) + Number(e.cost_labor) + Number(e.cost_misc);

  // Per vehicle
  const perVehicle = new Map<string, number>();
  for (const e of events) perVehicle.set(e.vehicle_id, (perVehicle.get(e.vehicle_id) ?? 0) + svcCost(e));
  for (const r of repairs)
    perVehicle.set(r.vehicle_id, (perVehicle.get(r.vehicle_id) ?? 0) + Number(r.total_cost));

  // Per category (service only)
  const perCategory = new Map<string, number>();
  for (const e of events)
    perCategory.set(e.category, (perCategory.get(e.category) ?? 0) + svcCost(e));

  // Per month (service + repair)
  const perMonth = new Map<string, number>();
  const monthKey = (d: string) => d.slice(0, 7);
  for (const e of events) perMonth.set(monthKey(e.date), (perMonth.get(monthKey(e.date)) ?? 0) + svcCost(e));
  for (const r of repairs)
    perMonth.set(monthKey(r.date), (perMonth.get(monthKey(r.date)) ?? 0) + Number(r.total_cost));

  const grandTotal =
    events.reduce((s, e) => s + svcCost(e), 0) +
    repairs.reduce((s, r) => s + Number(r.total_cost), 0);

  const perVehicleRows = Array.from(perVehicle.entries())
    .map(([id, total]) => ({ vehicle: vName(id), total }))
    .sort((a, b) => b.total - a.total);
  const perCategoryRows = Array.from(perCategory.entries())
    .map(([code, total]) => ({ category: serviceCategoryLabel(code, categories), total }))
    .sort((a, b) => b.total - a.total);
  const perMonthRows = Array.from(perMonth.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));

  const empty = events.length === 0 && repairs.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ค่าใช้จ่าย"
        subtitle="Expenses · สรุปตามรถ หมวด และเดือน"
        actions={
          <CSVExportButton
            data={perMonthRows}
            filename="expenses-by-month"
            headers={[
              { key: "month", label: "เดือน" },
              { key: "total", label: "ยอดรวม (บาท)" },
            ]}
            label="ส่งออกรายเดือน CSV"
          />
        }
      />
      <ConfigBanner />

      {empty ? (
        <EmptyState
          title="ยังไม่มีข้อมูลค่าใช้จ่าย"
          description="บันทึกการบำรุงรักษาหรือการซ่อมเพื่อดูสรุปค่าใช้จ่าย"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="ค่าใช้จ่ายรวมทั้งหมด" value={formatTHB(grandTotal)} />
            <StatCard label="จำนวนรถ" value={vehicles.length} />
            <StatCard label="จำนวนบันทึก" value={events.length + repairs.length} />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">ตามรถ / Per vehicle</CardTitle>
              <CSVExportButton
                data={perVehicleRows}
                filename="expenses-by-vehicle"
                headers={[
                  { key: "vehicle", label: "รถ" },
                  { key: "total", label: "ยอดรวม (บาท)" },
                ]}
                label="CSV"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รถ</TableHead>
                    <TableHead className="text-right">ยอดรวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perVehicleRows.map((r) => (
                    <TableRow key={r.vehicle}>
                      <TableCell>{r.vehicle}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTHB(r.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">ตามหมวด / Per category</CardTitle>
                <CSVExportButton
                  data={perCategoryRows}
                  filename="expenses-by-category"
                  headers={[
                    { key: "category", label: "หมวด" },
                    { key: "total", label: "ยอดรวม (บาท)" },
                  ]}
                  label="CSV"
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หมวด</TableHead>
                      <TableHead className="text-right">ยอดรวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perCategoryRows.map((r) => (
                      <TableRow key={r.category}>
                        <TableCell>{r.category}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatTHB(r.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">ตามเดือน / Per month</CardTitle>
                <CSVExportButton
                  data={perMonthRows}
                  filename="expenses-by-month"
                  headers={[
                    { key: "month", label: "เดือน" },
                    { key: "total", label: "ยอดรวม (บาท)" },
                  ]}
                  label="CSV"
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>เดือน</TableHead>
                      <TableHead className="text-right">ยอดรวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perMonthRows.map((r) => (
                      <TableRow key={r.month}>
                        <TableCell>{r.month}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatTHB(r.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
