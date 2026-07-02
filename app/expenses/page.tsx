import { PageHeader } from "@/components/PageHeader";
import { Receipt } from "lucide-react";
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
  getRenewals,
} from "@/lib/queries";
import { serviceCategoryLabel } from "@/lib/categoryLabels";
import { formatTHB } from "@/lib/utils";
import { renewalTypeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [vehicles, events, repairs, renewals, categories] = await Promise.all([
    getVehicles(),
    getServiceEvents(),
    getRepairEvents(),
    getRenewals(),
    getServiceCategories(),
  ]);

  const doneRenewals = renewals.filter((r) => r.status === "done");

  const vName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}${v.plate_no ? ` (${v.plate_no})` : ""}` : id;
  };

  const svcCost = (e: (typeof events)[number]) =>
    Number(e.cost_parts) + Number(e.cost_labor) + Number(e.cost_misc);

  // Per vehicle (service + repair + renewals)
  const perVehicle = new Map<string, number>();
  for (const e of events) perVehicle.set(e.vehicle_id, (perVehicle.get(e.vehicle_id) ?? 0) + svcCost(e));
  for (const r of repairs)
    perVehicle.set(r.vehicle_id, (perVehicle.get(r.vehicle_id) ?? 0) + Number(r.total_cost));
  for (const rn of doneRenewals)
    perVehicle.set(rn.vehicle_id, (perVehicle.get(rn.vehicle_id) ?? 0) + Number(rn.cost_estimate));

  // Per category (service + renewals)
  const perCategory = new Map<string, number>();
  for (const e of events)
    perCategory.set(e.category, (perCategory.get(e.category) ?? 0) + svcCost(e));
  for (const rn of doneRenewals) {
    const label = `ต่ออายุ: ${renewalTypeLabels[rn.type]?.th ?? rn.type}`;
    perCategory.set(label, (perCategory.get(label) ?? 0) + Number(rn.cost_estimate));
  }

  // Per month (service + repair + renewals)
  const perMonth = new Map<string, number>();
  const monthKey = (d: string) => d.slice(0, 7);
  for (const e of events) perMonth.set(monthKey(e.date), (perMonth.get(monthKey(e.date)) ?? 0) + svcCost(e));
  for (const r of repairs)
    perMonth.set(monthKey(r.date), (perMonth.get(monthKey(r.date)) ?? 0) + Number(r.total_cost));
  for (const rn of doneRenewals)
    perMonth.set(monthKey(rn.due_date), (perMonth.get(monthKey(rn.due_date)) ?? 0) + Number(rn.cost_estimate));

  const grandTotal =
    events.reduce((s, e) => s + svcCost(e), 0) +
    repairs.reduce((s, r) => s + Number(r.total_cost), 0) +
    doneRenewals.reduce((s, rn) => s + Number(rn.cost_estimate), 0);

  const perVehicleRows = Array.from(perVehicle.entries())
    .map(([id, total]) => ({ vehicle: vName(id), total }))
    .sort((a, b) => b.total - a.total);
  const perCategoryRows = Array.from(perCategory.entries())
    .map(([code, total]) => ({ category: serviceCategoryLabel(code, categories), total }))
    .sort((a, b) => b.total - a.total);
  const perMonthRows = Array.from(perMonth.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));

  const empty = events.length === 0 && repairs.length === 0 && doneRenewals.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ค่าใช้จ่าย"
        subtitle="Expenses · สรุปตามรถ หมวด และเดือน"
        icon={Receipt}
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
            <StatCard label="จำนวนบันทึก" value={events.length + repairs.length + doneRenewals.length} />
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
                  {perVehicleRows.map((r) => {
                    const percentage = grandTotal > 0 ? (r.total / grandTotal) * 100 : 0;
                    return (
                      <TableRow key={r.vehicle}>
                        <TableCell>
                          <div className="font-medium">{r.vehicle}</div>
                          <div className="mt-1.5 hidden h-1 w-full max-w-[200px] rounded-full bg-slate-100 sm:block">
                            <div
                              className="h-1 rounded-full bg-[#c5a880] transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="font-semibold">{formatTHB(r.total)}</span>
                          <span className="ml-2 text-xs text-muted-foreground font-normal">({percentage.toFixed(1)}%)</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                    {perCategoryRows.map((r) => {
                      const percentage = grandTotal > 0 ? (r.total / grandTotal) * 100 : 0;
                      return (
                        <TableRow key={r.category}>
                          <TableCell>
                            <div className="font-medium">{r.category}</div>
                            <div className="mt-1.5 hidden h-1 w-full max-w-[200px] rounded-full bg-slate-100 sm:block">
                              <div
                                className="h-1 rounded-full bg-[#c5a880] transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className="font-semibold">{formatTHB(r.total)}</span>
                            <span className="ml-2 text-xs text-muted-foreground font-normal">({percentage.toFixed(1)}%)</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                    {perMonthRows.map((r) => {
                      const maxMonthTotal = Math.max(...perMonthRows.map(row => row.total), 1);
                      const percentage = (r.total / maxMonthTotal) * 100;
                      return (
                        <TableRow key={r.month}>
                          <TableCell>
                            <div className="font-medium">{r.month}</div>
                            <div className="mt-1.5 hidden h-1 w-full max-w-[200px] rounded-full bg-slate-100 sm:block">
                              <div
                                className="h-1 rounded-full bg-[#c5a880] transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {formatTHB(r.total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
