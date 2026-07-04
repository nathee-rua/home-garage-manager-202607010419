"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { sendEmailNotification, sendTelegramNotification } from "@/lib/notifications";

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
  if (v === null || typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

function getLocalDateString(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
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
    "/settings",
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
    date: str(formData.get("date")) ?? getLocalDateString(),
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
    date: str(formData.get("date")) ?? getLocalDateString(),
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

export async function completeRenewal(
  id: string,
  actualCost: number
): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb
    .from("renewals")
    .update({ status: "done", cost_estimate: actualCost })
    .eq("id", id);
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

  // Fetch file_url first to delete it from storage
  const { data: attachment } = await sb
    .from("attachments")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();

  if (attachment?.file_url) {
    const parts = attachment.file_url.split("/attachments/");
    if (parts.length > 1) {
      const filePath = parts[1];
      await sb.storage.from("attachments").remove([filePath]);
    }
  }

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

// ── Vehicle Update ──
export async function updateVehicle(id: string, formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb
    .from("vehicles")
    .update({
      brand: str(formData.get("brand"))!,
      model: str(formData.get("model"))!,
      year: num(formData.get("year")),
      plate_no: str(formData.get("plate_no")),
      vin: str(formData.get("vin")),
      fuel_type: str(formData.get("fuel_type")) ?? "gasoline",
      odometer: num(formData.get("odometer")) ?? 0,
      purchase_date: str(formData.get("purchase_date")),
      note: str(formData.get("note")),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/vehicles/${id}`);
  return { ok: true };
}

// ── Provider Update ──
export async function updateProvider(id: string, formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb
    .from("providers")
    .update({
      name: str(formData.get("name"))!,
      type: str(formData.get("type")) ?? "dealer",
      branch: str(formData.get("branch")),
      phone: str(formData.get("phone")),
      line_contact: str(formData.get("line_contact")),
      note: str(formData.get("note")),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── Fuel Types CRUD ──
export async function createFuelType(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("fuel_types").insert({
    code: str(formData.get("code"))!,
    label_th: str(formData.get("label_th"))!,
    label_en: str(formData.get("label_en"))!,
    sort_order: num(formData.get("sort_order")) ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateFuelType(code: string, formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb
    .from("fuel_types")
    .update({
      label_th: str(formData.get("label_th"))!,
      label_en: str(formData.get("label_en"))!,
      sort_order: num(formData.get("sort_order")) ?? 0,
    })
    .eq("code", code);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteFuelType(code: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { count } = await sb
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("fuel_type", code);
  if (count && count > 0) {
    return { ok: false, error: `ไม่สามารถลบได้ มีรถยนต์ ${count} คันที่ใช้ประเภทเชื้อเพลิงนี้อยู่` };
  }
  const { error } = await sb.from("fuel_types").delete().eq("code", code);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── Service Categories CRUD ──
export async function createServiceCategory(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb.from("service_categories").insert({
    code: str(formData.get("code"))!,
    label_th: str(formData.get("label_th"))!,
    label_en: str(formData.get("label_en"))!,
    ev_relevant: formData.get("ev_relevant") === "true",
    default_interval_km: num(formData.get("default_interval_km")),
    default_interval_months: num(formData.get("default_interval_months")),
    is_user_defined: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateServiceCategory(code: string, formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { error } = await sb
    .from("service_categories")
    .update({
      label_th: str(formData.get("label_th"))!,
      label_en: str(formData.get("label_en"))!,
      ev_relevant: formData.get("ev_relevant") === "true",
      default_interval_km: num(formData.get("default_interval_km")),
      default_interval_months: num(formData.get("default_interval_months")),
    })
    .eq("code", code);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteServiceCategory(code: string): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };
  const { data: cat } = await sb
    .from("service_categories")
    .select("is_user_defined")
    .eq("code", code)
    .maybeSingle();
  if (!cat?.is_user_defined) {
    return { ok: false, error: "ไม่สามารถลบหมวดหมู่มาตรฐานของระบบได้" };
  }
  const { error } = await sb.from("service_categories").delete().eq("code", code);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── User Settings Actions ──
export async function saveUserSettings(formData: FormData): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "ยังไม่ได้เข้าสู่ระบบ" };

  const payload = {
    user_id: user.id,
    telegram_chat_id: str(formData.get("telegram_chat_id")),
    telegram_enabled: formData.get("telegram_enabled") === "true",
    email_enabled: formData.get("email_enabled") === "true",
    notify_days_before: num(formData.get("notify_days_before")) ?? 7,
  };

  const { error } = await sb.from("user_settings").upsert(payload, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidateAll();
  return { ok: true };
}

export async function sendTestNotification(): Promise<ActionResult> {
  const { sb, err } = requireClient();
  if (!sb) return { ok: false, error: err! };

  const { data: { user } } = await sb.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "ยังไม่ได้เข้าสู่ระบบ" };

  const { data: settings } = await sb
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings) {
    return { ok: false, error: "กรุณาตั้งค่าแจ้งเตือนและบันทึกข้อมูลก่อนทดสอบ" };
  }

  let emailSent = false;
  let telegramSent = false;
  let errors: string[] = [];

  if (settings.email_enabled) {
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">🧪 ทดสอบระบบการแจ้งเตือน</h2>
        <p style="color: #666; font-size: 14px;">ข้อความนี้เป็นข้อความทดสอบจากระบบ Home Garage Manager เพื่อตรวจสอบการเชื่อมต่อกับกล่องจดหมายของคุณ</p>
        <p style="color: green; font-size: 14px; font-weight: bold;">การเชื่อมต่ออีเมลสำเร็จ! / Email Connection Success!</p>
      </div>
    `;
    const res = await sendEmailNotification(user.email, "🧪 ทดสอบการส่งการแจ้งเตือน (Home Garage Manager)", htmlBody);
    if (res.ok) emailSent = true;
    else errors.push(`Email error: ${res.error}`);
  }

  if (settings.telegram_enabled && settings.telegram_chat_id) {
    const tgMsg = `<b>🧪 ทดสอบระบบแจ้งเตือน Telegram Bot</b>\n\nการเชื่อมต่อ Telegram สำเร็จ! คุณได้รับการตั้งค่าแจ้งเตือนล่วงหน้า <b>${settings.notify_days_before} วัน</b> เรียบร้อยแล้ว`;
    const res = await sendTelegramNotification(settings.telegram_chat_id, tgMsg);
    if (res.ok) telegramSent = true;
    else errors.push(`Telegram error: ${res.error}`);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      error: `ส่งข้อความไม่สำเร็จบางช่องทาง: ${errors.join(", ")}`,
    };
  }

  return { ok: true };
}
