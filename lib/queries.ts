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
  FuelTypeRecord,
  UserSettings,
} from "./types";

export async function getVehicles(): Promise<Vehicle[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb.from("vehicles").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching vehicles:", error.message);
  }
  return (data as Vehicle[]) ?? [];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const sb = getServerClient();
  if (!sb) return null;
  const { data, error } = await sb.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error(`Error fetching vehicle ${id}:`, error.message);
  }
  return (data as Vehicle) ?? null;
}

export async function getServiceEvents(vehicleId?: string): Promise<ServiceEvent[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("service_events").select("*").order("date", { ascending: false });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data, error } = await q;
  if (error) {
    console.error("Error fetching service events:", error.message);
  }
  return (data as ServiceEvent[]) ?? [];
}

export async function getRepairEvents(vehicleId?: string): Promise<RepairEvent[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("repair_events").select("*").order("date", { ascending: false });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data, error } = await q;
  if (error) {
    console.error("Error fetching repair events:", error.message);
  }
  return (data as RepairEvent[]) ?? [];
}

export async function getRenewals(vehicleId?: string): Promise<Renewal[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("renewals").select("*").order("due_date", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data, error } = await q;
  if (error) {
    console.error("Error fetching renewals:", error.message);
  }
  return (data as Renewal[]) ?? [];
}

export async function getServiceRules(vehicleId?: string): Promise<ServiceRule[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("service_rules").select("*").order("created_at", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data, error } = await q;
  if (error) {
    console.error("Error fetching service rules:", error.message);
  }
  return (data as ServiceRule[]) ?? [];
}

export async function getPlannedJobs(vehicleId?: string): Promise<PlannedJob[]> {
  const sb = getServerClient();
  if (!sb) return [];
  let q = sb.from("planned_jobs").select("*").order("target_date", { ascending: true });
  if (vehicleId) q = q.eq("vehicle_id", vehicleId);
  const { data, error } = await q;
  if (error) {
    console.error("Error fetching planned jobs:", error.message);
  }
  return (data as PlannedJob[]) ?? [];
}

export async function getProviders(): Promise<Provider[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb.from("providers").select("*").order("name", { ascending: true });
  if (error) {
    console.error("Error fetching providers:", error.message);
  }
  return (data as Provider[]) ?? [];
}

export async function getAttachments(
  entityType: string,
  entityId: string
): Promise<Attachment[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("attachments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error(`Error fetching attachments for ${entityType} ${entityId}:`, error.message);
  }
  return (data as Attachment[]) ?? [];
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb.from("service_categories").select("*").order("code");
  if (error) {
    console.error("Error fetching service categories:", error.message);
  }
  return (data as ServiceCategory[]) ?? [];
}

export async function getFuelTypes(): Promise<FuelTypeRecord[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb.from("fuel_types").select("*").order("sort_order");
  if (error) {
    console.error("Error fetching fuel types:", error.message);
  }
  return (data as FuelTypeRecord[]) ?? [];
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const sb = getServerClient();
  if (!sb) return null;
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) return null;
  const { data, error } = await sb
    .from("user_settings")
    .select("*")
    .eq("user_id", user.user.id)
    .maybeSingle();
  if (error) {
    console.error(`Error fetching user settings for ${user.user.id}:`, error.message);
  }
  return (data as UserSettings) ?? null;
}

export async function getVehicleRelatedAttachments(
  vehicleId: string,
  eventIds: string[]
): Promise<Attachment[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const ids = [vehicleId, ...eventIds];
  const { data, error } = await sb
    .from("attachments")
    .select("*")
    .in("entity_id", ids)
    .order("created_at", { ascending: false });
  if (error) {
    console.error(`Error fetching related attachments for vehicle ${vehicleId}:`, error.message);
  }
  return (data as Attachment[]) ?? [];
}
