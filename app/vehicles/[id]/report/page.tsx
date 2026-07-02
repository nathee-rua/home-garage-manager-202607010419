import { notFound } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getVehicle,
  getServiceEvents,
  getRepairEvents,
  getRenewals,
  getProviders,
  getServiceCategories,
} from "@/lib/queries";
import { renewalTypeLabels } from "@/lib/labels";
import { formatDate, formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ReportPageProps {
  params: { id: string };
  searchParams: {
    start?: string;
    end?: string;
    service?: string;
    repair?: string;
    renewal?: string;
  };
}

export default async function VehicleReportPrintPage({ params, searchParams }: ReportPageProps) {
  const vehicle = await getVehicle(params.id);
  if (!vehicle) notFound();

  // Parse filters
  const startDate = searchParams.start ?? "";
  const endDate = searchParams.end ?? "";
  const includeService = searchParams.service !== "false";
  const includeRepair = searchParams.repair !== "false";
  const includeRenewal = searchParams.renewal !== "false";

  // Fetch all data
  const [services, repairs, renewals, providers, categories] = await Promise.all([
    getServiceEvents(params.id),
    getRepairEvents(params.id),
    getRenewals(params.id),
    getProviders(),
    getServiceCategories(),
  ]);

  // Filter logic
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };

  const getProviderLabel = (id: string | null) => {
    if (!id) return "-";
    const p = providers.find((item) => item.id === id);
    return p ? `${p.name} ${p.branch ? `(${p.branch})` : ""}` : "-";
  };

  const rows: {
    type: string;
    date: string;
    odometer: string;
    details: string;
    provider: string;
    cost: number;
  }[] = [];

  // Add services
  if (includeService) {
    services.forEach((s) => {
      if (isInRange(s.date)) {
        const cat = categories.find((c) => c.code === s.category);
        const catLabel = cat ? cat.label_th : s.category;
        const detailText = [catLabel, s.details].filter(Boolean).join(" - ");
        rows.push({
          type: "บำรุงรักษา",
          date: s.date,
          odometer: s.odometer ? `${s.odometer.toLocaleString()} กม.` : "-",
          details: detailText,
          provider: getProviderLabel(s.provider_id),
          cost: Number(s.cost_parts) + Number(s.cost_labor) + Number(s.cost_misc),
        });
      }
    });
  }

  // Add repairs
  if (includeRepair) {
    repairs.forEach((r) => {
      if (isInRange(r.date)) {
        const detailText = [
          r.symptom ? `อาการ: ${r.symptom}` : "",
          r.diagnosis ? `วินิจฉัย: ${r.diagnosis}` : "",
          r.action_taken ? `วิธีแก้: ${r.action_taken}` : "",
          r.parts_used ? `อะไหล่: ${r.parts_used}` : "",
        ].filter(Boolean).join(" | ");
        rows.push({
          type: "ซ่อมแซม",
          date: r.date,
          odometer: "-",
          details: detailText,
          provider: getProviderLabel(r.provider_id),
          cost: Number(r.total_cost),
        });
      }
    });
  }

  // Add renewals
  if (includeRenewal) {
    renewals.forEach((rn) => {
      if (isInRange(rn.due_date)) {
        const label = renewalTypeLabels[rn.type]?.th ?? rn.type;
        rows.push({
          type: "ต่ออายุ/ภาษี",
          date: rn.due_date,
          odometer: "-",
          details: `ต่ออายุ ${label} (สถานะ: ${rn.status})`,
          provider: "-",
          cost: Number(rn.cost_estimate),
        });
      }
    });
  }

  // Sort by date ascending
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculations
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);

  return (
    <div className="mx-auto max-w-4xl p-6 bg-white text-black font-sans leading-relaxed min-h-screen">
      {/* Print Control Header - Hidden during actual print */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <Link href={`/vehicles/${vehicle.id}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> กลับหน้าข้อมูลรถ
        </Link>
        <Button onClick={() => window.print()} className="gap-2 bg-black hover:bg-gray-800 text-white">
          <Printer className="h-4 w-4" /> สั่งพิมพ์ / บันทึก PDF
        </Button>
      </div>

      {/* Report Container */}
      <div className="space-y-8">
        {/* Document Title Header */}
        <div className="text-center space-y-2 border-b pb-6">
          <h1 className="text-2xl font-bold tracking-tight">รายงานประวัติและค่าใช้จ่ายรถยนต์</h1>
          <p className="text-sm text-gray-500 font-mono">Home Garage Manager Report</p>
          <div className="text-xs text-gray-500 mt-1">
            รายงานระหว่างวันที่: {startDate ? formatDate(startDate) : "เริ่มต้น"} ถึง {endDate ? formatDate(endDate) : "ล่าสุด"}
          </div>
        </div>

        {/* Vehicle Information Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50/50">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 block">ข้อมูลรถยนต์ / Vehicle info</span>
            <span className="font-bold text-lg block">{vehicle.brand} {vehicle.model}</span>
            {vehicle.year ? <span className="text-sm text-gray-600 block">ปีจดทะเบียน: {vehicle.year}</span> : null}
            {vehicle.vin ? <span className="text-xs text-gray-500 font-mono block">เลขตัวถัง VIN: {vehicle.vin}</span> : null}
          </div>
          <div className="space-y-1 text-right">
            <span className="text-xs text-gray-500 block">ข้อมูลจราจรและเลขไมล์ / Registration</span>
            <span className="font-semibold text-lg block">ทะเบียน: {vehicle.plate_no ?? "ไม่ระบุ"}</span>
            <span className="text-sm text-gray-600 block">เลขไมล์ล่าสุด: {vehicle.odometer.toLocaleString()} กม.</span>
            <span className="text-xs text-gray-500 block">ประเภทเชื้อเพลิง: {vehicle.fuel_type}</span>
          </div>
        </div>

        {/* Cost Summary Statistics Card */}
        <div className="border p-4 rounded-lg bg-black text-white flex justify-between items-center">
          <div>
            <span className="text-xs opacity-80 block">สรุปยอดรวมค่าใช้จ่ายในรายงานนี้</span>
            <span className="text-xs opacity-75 font-mono">จำนวนรายการทั้งหมด: {rows.length} รายการ</span>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-80 block">ยอดสุทธิ / Total Spend</span>
            <span className="text-2xl font-bold tracking-tight">{formatTHB(totalCost)}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold border-b pb-1.5">รายละเอียดข้อมูลตามช่วงเวลา (Timeline logs)</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">ไม่มีข้อมูลในตัวกรองหรือช่วงเวลาที่เลือก</p>
          ) : (
            <Table className="border-collapse w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-300">
                  <TableHead className="w-[120px] text-black font-semibold">วันที่</TableHead>
                  <TableHead className="w-[100px] text-black font-semibold">ประเภท</TableHead>
                  <TableHead className="w-[100px] text-black font-semibold">เลขไมล์</TableHead>
                  <TableHead className="text-black font-semibold">รายละเอียดรายการ</TableHead>
                  <TableHead className="text-black font-semibold">ผู้ให้บริการ/อู่</TableHead>
                  <TableHead className="w-[120px] text-right text-black font-semibold">ค่าใช้จ่าย</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx} className="border-b border-gray-200">
                    <TableCell className="font-mono text-sm py-3">{formatDate(row.date)}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs rounded font-normal border-gray-300 text-gray-700">
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm py-3">{row.odometer}</TableCell>
                    <TableCell className="text-sm py-3 leading-relaxed">{row.details}</TableCell>
                    <TableCell className="text-sm py-3">{row.provider}</TableCell>
                    <TableCell className="text-right font-mono text-sm py-3 font-semibold">
                      {row.cost > 0 ? formatTHB(row.cost) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Report Footer */}
        <div className="pt-8 text-center text-xs text-gray-400 border-t space-y-1">
          <p>เอกสารนี้จัดทำโดยระบบ Home Garage Manager ณ วันที่ {formatDate(new Date().toISOString())}</p>
          <p className="font-mono text-[10px]">Project: https://github.com/nathee-rua/home-garage-manager</p>
        </div>
      </div>

      {/* Auto print script tag */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Trigger print dialouge once page loaded
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
              }, 500);
            });
          `,
        }}
      />
    </div>
  );
}
