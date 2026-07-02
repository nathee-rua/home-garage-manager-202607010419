import type { Vehicle, ServiceEvent, RepairEvent, Renewal, Provider } from "./types";
import { formatDate } from "./utils";
import { renewalTypeLabels } from "./labels";

// Helper to escape values for CSV
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportHistoryToCSV(
  vehicle: Vehicle,
  services: ServiceEvent[],
  repairs: RepairEvent[],
  renewals: Renewal[],
  providers: Provider[],
  categories: any[],
  filters: {
    startDate: string;
    endDate: string;
    includeService: boolean;
    includeRepair: boolean;
    includeRenewal: boolean;
  }
) {
  // 1. Filter and compile raw data
  const rows: {
    type: string;
    date: string;
    odometer: string;
    details: string;
    providerName: string;
    costParts: number;
    costLabor: number;
    costMisc: number;
    totalCost: number;
    note: string;
  }[] = [];

  const start = filters.startDate ? new Date(filters.startDate) : null;
  const end = filters.endDate ? new Date(filters.endDate) : null;

  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };

  const getProviderName = (id: string | null) => {
    if (!id) return "-";
    const p = providers.find((item) => item.id === id);
    return p ? `${p.name} ${p.branch ? `(${p.branch})` : ""}` : "-";
  };

  // 1.1 Maintenance Logs
  if (filters.includeService) {
    services.forEach((s) => {
      if (isInRange(s.date)) {
        const cat = categories.find((c) => c.code === s.category);
        const catLabel = cat ? cat.label_th : s.category;
        const detailText = [catLabel, s.details].filter(Boolean).join(" - ");
        const total = Number(s.cost_parts) + Number(s.cost_labor) + Number(s.cost_misc);
        rows.push({
          type: "บำรุงรักษา",
          date: s.date,
          odometer: s.odometer ? `${s.odometer} กม.` : "-",
          details: detailText,
          providerName: getProviderName(s.provider_id),
          costParts: Number(s.cost_parts),
          costLabor: Number(s.cost_labor),
          costMisc: Number(s.cost_misc),
          totalCost: total,
          note: s.note ?? "",
        });
      }
    });
  }

  // 1.2 Repair Logs
  if (filters.includeRepair) {
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
          providerName: getProviderName(r.provider_id),
          costParts: Number(r.total_cost), // Put under parts/general repair cost
          costLabor: 0,
          costMisc: 0,
          totalCost: Number(r.total_cost),
          note: r.note ?? "",
        });
      }
    });
  }

  // 1.3 Renewals
  if (filters.includeRenewal) {
    renewals.forEach((rn) => {
      if (isInRange(rn.due_date)) {
        const label = renewalTypeLabels[rn.type]?.th ?? rn.type;
        rows.push({
          type: "ต่ออายุ/ภาษี/ประกัน",
          date: rn.due_date,
          odometer: "-",
          details: `ต่ออายุ ${label} (สถานะ: ${rn.status})`,
          providerName: "-",
          costParts: 0,
          costLabor: 0,
          costMisc: Number(rn.cost_estimate),
          totalCost: Number(rn.cost_estimate),
          note: rn.note ?? "",
        });
      }
    });
  }

  // Sort rows by date ascending
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Generate CSV String
  const csvHeaders = [
    "ประเภท",
    "วันที่ทำรายการ",
    "ระยะทางสะสม",
    "รายละเอียดรายการ",
    "ผู้ให้บริการ/อู่รถยนต์",
    "ค่าอะไหล่",
    "ค่าแรง",
    "ค่าบริการอื่น ๆ",
    "ยอดรวม",
    "หมายเหตุ"
  ];

  let csvContent = "\uFEFF"; // Add UTF-8 BOM for Excel/Google Sheets compatibility
  csvContent += csvHeaders.map(escapeCSV).join(",") + "\r\n";

  rows.forEach((row) => {
    const csvRow = [
      row.type,
      formatDate(row.date),
      row.odometer,
      row.details,
      row.providerName,
      row.costParts > 0 ? row.costParts : "-",
      row.costLabor > 0 ? row.costLabor : "-",
      row.costMisc > 0 ? row.costMisc : "-",
      row.totalCost > 0 ? row.totalCost : "-",
      row.note
    ];
    csvContent += csvRow.map(escapeCSV).join(",") + "\r\n";
  });

  // Calculate and append Summary Row
  const totalSpend = rows.reduce((s, r) => s + r.totalCost, 0);
  csvContent += `\r\n,,,,,ยอดรวมค่าใช้จ่ายทั้งหมด,,,${totalSpend},\r\n`;

  // 3. Trigger Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `report_${vehicle.brand}_${vehicle.model}_${dateStr}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
