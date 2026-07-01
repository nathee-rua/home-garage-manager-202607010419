// Build a unified, urgency-sorted list of upcoming/overdue reminders across
// all vehicles by combining service rules (+ last matching service event) and
// renewals.
import { computeNextDue, computeStatus } from "./dueEngine";
import type {
  DueStatus,
  Renewal,
  ServiceEvent,
  ServiceRule,
  Vehicle,
} from "./types";
import { renewalTypeLabels } from "./labels";
import { daysUntil } from "./utils";

export interface Reminder {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  kind: "service" | "renewal";
  title: string;
  category?: string;
  nextDueDate: string | null;
  nextDueOdometer: number | null;
  currentOdometer: number | null;
  status: DueStatus;
  daysLeft: number | null;
}

const statusWeight: Record<DueStatus, number> = {
  overdue: 0,
  due_soon: 1,
  normal: 2,
};

function vehicleLabel(v: Vehicle): string {
  const plate = v.plate_no ? ` (${v.plate_no})` : "";
  return `${v.brand} ${v.model}${plate}`;
}

export function buildReminders(
  vehicles: Vehicle[],
  rules: ServiceRule[],
  events: ServiceEvent[],
  renewals: Renewal[],
  today = new Date()
): Reminder[] {
  const reminders: Reminder[] = [];
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  // Service rules → next due, using latest matching service event.
  for (const rule of rules) {
    const vehicle = vehicleById.get(rule.vehicle_id);
    if (!vehicle) continue;

    const matching = events
      .filter((e) => e.vehicle_id === rule.vehicle_id && e.category === rule.category)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const last = matching[0];

    const { nextDueDate, nextDueOdometer } = computeNextDue({
      lastDate: last?.date ?? vehicle.purchase_date ?? null,
      lastOdometer: last?.odometer ?? 0,
      intervalMonths: rule.interval_months,
      intervalKm: rule.interval_km,
    });

    const status = computeStatus({
      nextDueDate,
      nextDueOdometer,
      currentOdometer: vehicle.odometer,
      today,
    });

    reminders.push({
      id: `rule-${rule.id}`,
      vehicleId: vehicle.id,
      vehicleLabel: vehicleLabel(vehicle),
      kind: "service",
      title: rule.category,
      category: rule.category,
      nextDueDate,
      nextDueOdometer,
      currentOdometer: vehicle.odometer,
      status,
      daysLeft: daysUntil(nextDueDate, today),
    });
  }

  // Renewals → status from due date (unless marked done).
  for (const r of renewals) {
    if (r.status === "done") continue;
    const vehicle = vehicleById.get(r.vehicle_id);
    if (!vehicle) continue;
    const status = computeStatus({
      nextDueDate: r.due_date,
      nextDueOdometer: null,
      currentOdometer: null,
      today,
    });
    reminders.push({
      id: `renewal-${r.id}`,
      vehicleId: vehicle.id,
      vehicleLabel: vehicleLabel(vehicle),
      kind: "renewal",
      title: renewalTypeLabels[r.type].th,
      nextDueDate: r.due_date,
      nextDueOdometer: null,
      currentOdometer: null,
      status,
      daysLeft: daysUntil(r.due_date, today),
    });
  }

  reminders.sort((a, b) => {
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    const da = a.daysLeft ?? Number.POSITIVE_INFINITY;
    const db = b.daysLeft ?? Number.POSITIVE_INFINITY;
    return da - db;
  });

  return reminders;
}

export interface DashboardStats {
  totalVehicles: number;
  overdueCount: number;
  dueSoonCount: number;
  upcomingThisMonth: number;
}

export function computeDashboardStats(
  vehicles: Vehicle[],
  reminders: Reminder[],
  today = new Date()
): DashboardStats {
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const upcomingThisMonth = reminders.filter((r) => {
    if (!r.nextDueDate) return false;
    const d = new Date(r.nextDueDate);
    return d >= today && d <= monthEnd;
  }).length;

  return {
    totalVehicles: vehicles.length,
    overdueCount: reminders.filter((r) => r.status === "overdue").length,
    dueSoonCount: reminders.filter((r) => r.status === "due_soon").length,
    upcomingThisMonth,
  };
}
