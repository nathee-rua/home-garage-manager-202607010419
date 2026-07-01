// Server-side read helpers. Each returns an empty array / null when Supabase
// is not configured, so pages render (with empty states) during build/preview.
import { getServerClient } from "./supabase/server";
import type {
  Vehicle,
  ServiceEvent,
  RepairEvent,
  Renewal,
  ServiceRule,
  PlannedJob,
  Provider,
  Attachment,
  ServiceCategory,
} from "./types";

export async function getVehicles(): Promise<Vehicle[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data } = await sb.from("vehicles").select("*").order("created_at", { ascending: false });
  return (data as Vehicle[]) ?? [];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const sb = getServerClient();
  if (!sb) return null;
  const { data } = await sb.from("vehicles").select("*").eq("id", id).maybeSingle();
  return (data as Vehicle) ?? null;
}

export async function getServiceEvents(vehicleId?: string): Promise<ServiceEvent[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("service_events").select("*").order("date", { ascending: false });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data } = await q;
  return (data as ServiceEvent[]) ?? [];
}

export async function getRepairEvents(vehicleId?: string): Promise<RepairEvent[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("repair_events").select("*").order("date", { ascending: false });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data } = await q;
  return (data as RepairEvent[]) ?? [];
}

export async function getRenewals(vehicleId?: string): Promise<Renewal[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("renewals").select("*").order("due_date", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data } = await q;
  return (data as Renewal[]) ?? [];
}

export async function getServiceRules(vehicleId?: string): Promise<ServiceRule[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("service_rules").select("*").order("created_at", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data } = await q;
  return (data as ServiceRule[]) ?? [];
}

export async function getPlannedJobs(vehicleId?: string): Promise<PlannedJob[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("planned_jobs").select("*").order("target_date", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data } = await q;
  return (data as PlannedJob[]) ?? [];
}

export async function getProviders(): Promise<Provider[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data } = await sb.from("providers").select("*").order("name", { ascending: true });
  return (data as Provider[]) ?? [];
}

export async function getAttachments(
  entityType: string,
  entityId: string
): Promise<Attachment[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data } = await sb
    .from("attachments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  return (data as Attachment[]) ?? [];
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data } = await sb.from("service_categories").select("*").order("code");
  return (data as ServiceCategory[]) ?? [];
}
