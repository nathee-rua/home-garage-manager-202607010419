"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function requireClient() {
  const sb = getServerClient();
  if (!sb) {
    return { sb: null, err: "ยังไม่ได้ตั้งค่า Supabase — กรุณากรอก env ก่อน" };
  }
  return { sb, err: null };
}

function revalidateAll() {
  for (const p of [
    "/",
    "/vehicles",
    "/maintenance",
    "/repairs",
    "/renewals",
    "/expenses",
    "/providers",
  ]) {
    revalidatePath(p);
  }
}

// ---------------------------------------------------------------- Vehicles ---
export async function createVehicle(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };

  const payload = {
    brand: str(formData.get("brand")) ?? "",
    model: str(formData.get("model")) ?? "",
    year: num(formData.get("year")),
    plate_no: str(formData.get("plate_no")),
    vin: str(formData.get("vin")),
    fuel_type: (str(formData.get("fuel_type")) ?? "gasoline") as string,
    odometer: num(formData.get("odometer")) ?? 0,
    purchase_date: str(formData.get("purchase_date")),
    note: str(formData.get("note")),
  };
  if (!payload.brand || !payload.model) {
    return { ok: false, error: "กรุณากรอกยี่ห้อและรุ่น" };
  }
  const { data, error } = await sb.from("vehicles").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: (data as { id: string })?.id };
}

export async function updateVehicleOdometer(
  id: string,
  odometer: number
): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("vehicles").update({ odometer }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/vehicles/${id}`);
  return { ok: true };
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("vehicles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ------------------------------------------------------------ Service log ---
export async function createServiceEvent(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const payload = {
    vehicle_id: str(formData.get("vehicle_id")),
    date: str(formData.get("date")) ?? new Date().toISOString().slice(0, 10),
    odometer: num(formData.get("odometer")),
    category: str(formData.get("category")) ?? "engine_oil",
    details: str(formData.get("details")),
    provider_id: str(formData.get("provider_id")),
    cost_parts: num(formData.get("cost_parts")) ?? 0,
    cost_labor: num(formData.get("cost_labor")) ?? 0,
    cost_misc: num(formData.get("cost_misc")) ?? 0,
    note: str(formData.get("note")),
  };
  if (!payload.vehicle_id) return { ok: false, error: "กรุณาเลือกรถ" };
  const { error } = await sb.from("service_events").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteServiceEvent(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("service_events").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ------------------------------------------------------------- Repair log ---
export async function createRepairEvent(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const payload = {
    vehicle_id: str(formData.get("vehicle_id")),
    date: str(formData.get("date")) ?? new Date().toISOString().slice(0, 10),
    symptom: str(formData.get("symptom")),
    diagnosis: str(formData.get("diagnosis")),
    action_taken: str(formData.get("action_taken")),
    parts_used: str(formData.get("parts_used")),
    provider_id: str(formData.get("provider_id")),
    total_cost: num(formData.get("total_cost")) ?? 0,
    urgency: (str(formData.get("urgency")) ?? "planned") as string,
    note: str(formData.get("note")),
  };
  if (!payload.vehicle_id) return { ok: false, error: "กรุณาเลือกรถ" };
  const { error } = await sb.from("repair_events").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteRepairEvent(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("repair_events").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// --------------------------------------------------------------- Renewals ---
export async function createRenewal(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const payload = {
    vehicle_id: str(formData.get("vehicle_id")),
    type: (str(formData.get("type")) ?? "other") as string,
    due_date: str(formData.get("due_date")),
    cost_estimate: num(formData.get("cost_estimate")) ?? 0,
    status: (str(formData.get("status")) ?? "upcoming") as string,
    note: str(formData.get("note")),
  };
  if (!payload.vehicle_id || !payload.due_date) {
    return { ok: false, error: "กรุณาเลือกรถและวันครบกำหนด" };
  }
  const { error } = await sb.from("renewals").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateRenewalStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("renewals").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteRenewal(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("renewals").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// --------------------------------------------------------------- Providers ---
export async function createProvider(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const payload = {
    name: str(formData.get("name")) ?? "",
    type: (str(formData.get("type")) ?? "other") as string,
    branch: str(formData.get("branch")),
    phone: str(formData.get("phone")),
    line_contact: str(formData.get("line_contact")),
    note: str(formData.get("note")),
  };
  if (!payload.name) return { ok: false, error: "กรุณากรอกชื่อร้าน/ศูนย์บริการ" };
  const { error } = await sb.from("providers").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteProvider(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("providers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------- Service rules ---
export async function createServiceRule(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const payload = {
    vehicle_id: str(formData.get("vehicle_id")),
    category: str(formData.get("category")) ?? "engine_oil",
    interval_km: num(formData.get("interval_km")),
    interval_months: num(formData.get("interval_months")),
  };
  if (!payload.vehicle_id) return { ok: false, error: "กรุณาเลือกรถ" };
  const { error } = await sb.from("service_rules").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteServiceRule(id: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("service_rules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// --------------------------------------------------------------- Attachments ---
export async function createAttachment(payload: {
  entity_type: string;
  entity_id: string;
  file_url: string;
  file_name?: string | null;
  file_type?: string | null;
  note?: string | null;
}): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("attachments").insert({
    ...payload,
    captured_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicles/${payload.entity_id}`);
  return { ok: true };
}

export async function deleteAttachment(id: string, vehicleId: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("attachments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicles/${vehicleId}`);
  return { ok: true };
}

// ------------------------------------------------------------- Planned Jobs ---
export async function createPlannedJob(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };

  const payload = {
    vehicle_id: str(formData.get("vehicle_id")),
    title: str(formData.get("title")) ?? "",
    target_date: str(formData.get("target_date")),
    target_odometer: num(formData.get("target_odometer")),
    priority: (str(formData.get("priority")) ?? "medium") as string,
    criticality: str(formData.get("criticality")),
    note: str(formData.get("note")),
  };

  if (!payload.vehicle_id || !payload.title) {
    return { ok: false, error: "กรุณากรอกหัวข้อและเลือกรถ" };
  }

  const { error } = await sb.from("planned_jobs").insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/vehicles/${payload.vehicle_id}`);
  return { ok: true };
}

export async function deletePlannedJob(id: string, vehicleId: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("planned_jobs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/vehicles/${vehicleId}`);
  return { ok: true };
}
