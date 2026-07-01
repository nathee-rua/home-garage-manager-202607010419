// Bilingual (TH primary / EN secondary) labels for enums and UI copy.
import type {
  FuelType,
  RenewalType,
  RenewalStatus,
  RepairUrgency,
  JobPriority,
  ProviderType,
} from "./types";

export const fuelTypeLabels: Record<FuelType, { th: string; en: string }> = {
  gasoline: { th: "น้ำมัน", en: "Gasoline" },
  hybrid: { th: "ไฮบริด", en: "Hybrid" },
  phev: { th: "ปลั๊กอินไฮบริด", en: "PHEV" },
  ev: { th: "ไฟฟ้า", en: "EV" },
};

export const renewalTypeLabels: Record<RenewalType, { th: string; en: string }> = {
  insurance: { th: "ประกันภัย", en: "Insurance" },
  compulsory_insurance: { th: "พ.ร.บ.", en: "Compulsory Insurance" },
  road_tax: { th: "ภาษีรถยนต์", en: "Road Tax" },
  inspection: { th: "ตรวจสภาพ", en: "Inspection" },
  annual_pass: { th: "ค่าผ่านทางรายปี", en: "Annual Pass" },
  other: { th: "อื่นๆ", en: "Other" },
};

export const renewalStatusLabels: Record<RenewalStatus, { th: string; en: string }> = {
  upcoming: { th: "กำลังจะถึง", en: "Upcoming" },
  done: { th: "เสร็จแล้ว", en: "Done" },
  overdue: { th: "เกินกำหนด", en: "Overdue" },
};

export const repairUrgencyLabels: Record<RepairUrgency, { th: string; en: string }> = {
  emergency: { th: "ฉุกเฉิน", en: "Emergency" },
  planned: { th: "วางแผนไว้", en: "Planned" },
};

export const priorityLabels: Record<JobPriority, { th: string; en: string }> = {
  low: { th: "ต่ำ", en: "Low" },
  medium: { th: "ปานกลาง", en: "Medium" },
  high: { th: "สูง", en: "High" },
};

export const providerTypeLabels: Record<ProviderType, { th: string; en: string }> = {
  dealer: { th: "ศูนย์บริการ", en: "Dealer" },
  bquik: { th: "B-Quik", en: "B-Quik" },
  cockpit: { th: "Cockpit", en: "Cockpit" },
  independent: { th: "อู่อิสระ", en: "Independent" },
  tire_shop: { th: "ร้านยาง", en: "Tire Shop" },
  battery_shop: { th: "ร้านแบตเตอรี่", en: "Battery Shop" },
  other: { th: "อื่นๆ", en: "Other" },
};

export const dueStatusLabels = {
  normal: { th: "ปกติ", en: "Normal" },
  due_soon: { th: "ใกล้ถึงกำหนด", en: "Due Soon" },
  overdue: { th: "เกินกำหนด", en: "Overdue" },
} as const;
