// Shared domain types for Home Garage Manager.

export type FuelType = "gasoline" | "hybrid" | "phev" | "ev";
export type RenewalType =
  | "insurance"
  | "compulsory_insurance"
  | "road_tax"
  | "inspection"
  | "annual_pass"
  | "other";
export type RenewalStatus = "upcoming" | "done" | "overdue";
export type RepairUrgency = "emergency" | "planned";
export type JobPriority = "low" | "medium" | "high";
export type ProviderType =
  | "dealer"
  | "bquik"
  | "cockpit"
  | "independent"
  | "tire_shop"
  | "battery_shop"
  | "other";

export type DueStatus = "normal" | "due_soon" | "overdue";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  plate_no: string | null;
  vin: string | null;
  fuel_type: FuelType;
  odometer: number;
  odometer_unit: string;
  purchase_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRule {
  id: string;
  vehicle_id: string;
  category: string;
  interval_km: number | null;
  interval_months: number | null;
  created_at: string;
}

export interface ServiceEvent {
  id: string;
  vehicle_id: string;
  date: string;
  odometer: number | null;
  category: string;
  details: string | null;
  provider_id: string | null;
  cost_parts: number;
  cost_labor: number;
  cost_misc: number;
  note: string | null;
  created_at: string;
}

export interface RepairEvent {
  id: string;
  vehicle_id: string;
  date: string;
  symptom: string | null;
  diagnosis: string | null;
  action_taken: string | null;
  parts_used: string | null;
  provider_id: string | null;
  total_cost: number;
  urgency: RepairUrgency;
  note: string | null;
  created_at: string;
}

export interface Renewal {
  id: string;
  vehicle_id: string;
  type: RenewalType;
  due_date: string;
  cost_estimate: number;
  status: RenewalStatus;
  note: string | null;
  created_at: string;
}

export interface PlannedJob {
  id: string;
  vehicle_id: string;
  title: string;
  target_date: string | null;
  target_odometer: number | null;
  priority: JobPriority;
  criticality: string | null;
  note: string | null;
  created_at: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  branch: string | null;
  phone: string | null;
  line_contact: string | null;
  note: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  captured_at: string | null;
  note: string | null;
  created_at: string;
}

export interface ServiceCategory {
  code: string;
  label_th: string;
  label_en: string;
  ev_relevant: boolean;
}
