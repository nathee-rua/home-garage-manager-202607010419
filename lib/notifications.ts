import { formatDate, formatTHB } from "./utils";
import { renewalTypeLabels } from "./labels";
import type { RenewalType } from "./types";

// 1. Send Email via Resend HTTP POST API (No external packages required)
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "placeholder") {
    console.warn("RESEND_API_KEY is not set or is placeholder");
    return { ok: false, error: "Resend API key not configured" };
  }

  try {
    const targetEmail = process.env.RESEND_TO_EMAIL_OVERRIDE || to;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Home Garage Manager <onboarding@resend.dev>", // default sender for testing
        to: [targetEmail],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Resend error: ${errText}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "Unknown email send error" };
  }
}

// 2. Send Telegram Message via Telegram Bot HTTP POST API
export async function sendTelegramNotification(
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not set");
    return { ok: false, error: "Telegram Bot Token not configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const errJson = await res.json();
      return { ok: false, error: `Telegram error: ${errJson.description ?? res.statusText}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "Unknown Telegram send error" };
  }
}

// 3. Main checking logic for a specific user.
// Returns details of items processed and if notifications were sent.
export async function checkAndSendDueNotifications(
  userId: string,
  sbAdmin: any, // Client with bypass RLS to read specific user's tables during cron
  userEmail: string
): Promise<{ emailSent: boolean; telegramSent: boolean; messageCount: number }> {
  let emailSent = false;
  let telegramSent = false;
  let messageCount = 0;

  // 3.1 Fetch user settings
  const { data: settings } = await sbAdmin
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const emailEnabled = settings ? settings.email_enabled : true;
  const telegramEnabled = settings ? settings.telegram_enabled : false;
  const telegramChatId = settings ? settings.telegram_chat_id : null;
  const notifyDaysBefore = settings ? settings.notify_days_before : 7;

  if (!emailEnabled && (!telegramEnabled || !telegramChatId)) {
    return { emailSent, telegramSent, messageCount };
  }

  // 3.2 Fetch user's vehicles
  const { data: vehicles } = await sbAdmin
    .from("vehicles")
    .select("id, brand, model, plate_no, odometer")
    .eq("user_id", userId);

  if (!vehicles || vehicles.length === 0) {
    return { emailSent, telegramSent, messageCount };
  }

  const vehicleIds = vehicles.map((v: any) => v.id);

  // 3.3 Fetch renewals
  const { data: renewals } = await sbAdmin
    .from("renewals")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .eq("status", "upcoming");

  // 3.4 Fetch planned jobs
  const { data: plannedJobs } = await sbAdmin
    .from("planned_jobs")
    .select("*")
    .in("vehicle_id", vehicleIds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifyLimitDate = new Date();
  notifyLimitDate.setDate(today.getDate() + notifyDaysBefore);
  notifyLimitDate.setHours(23, 59, 59, 999);

  // Group items by vehicle
  const dueItemsMap: Record<
    string,
    {
      vehicleName: string;
      plate: string;
      renewals: { title: string; date: string; cost: number }[];
      jobs: { title: string; date: string; odometer: number | null }[];
    }
  > = {};

  vehicles.forEach((v: any) => {
    dueItemsMap[v.id] = {
      vehicleName: `${v.brand} ${v.model}`,
      plate: v.plate_no ?? "ไม่ระบุทะเบียน",
      renewals: [],
      jobs: [],
    };
  });

  // Filter due renewals
  if (renewals) {
    renewals.forEach((r: any) => {
      const dueDate = new Date(r.due_date);
      if (dueDate >= today && dueDate <= notifyLimitDate) {
        const typeTh = renewalTypeLabels[r.type as RenewalType]?.th ?? r.type;
        dueItemsMap[r.vehicle_id].renewals.push({
          title: `ต่ออายุ ${typeTh}`,
          date: r.due_date,
          cost: Number(r.cost_estimate),
        });
        messageCount++;
      }
    });
  }

  // Filter due planned jobs
  if (plannedJobs) {
    plannedJobs.forEach((j: any) => {
      if (j.target_date) {
        const targetDate = new Date(j.target_date);
        if (targetDate >= today && targetDate <= notifyLimitDate) {
          dueItemsMap[j.vehicle_id].jobs.push({
            title: j.title,
            date: j.target_date,
            odometer: j.target_odometer,
          });
          messageCount++;
        }
      }
    });
  }

  // If no items are due, we do not send any notification
  if (messageCount === 0) {
    return { emailSent, telegramSent, messageCount };
  }

  // 3.5 Construct message content
  // Build Telegram text (HTML format supported by Telegram sendMessage API)
  let tgMessage = `<b>🔔 แจ้งเตือนครบกำหนดดูแลรถยนต์</b>\n`;
  tgMessage += `พบรายการใกล้ครบกำหนดในอีก ${notifyDaysBefore} วัน:\n\n`;

  let htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">🔔 แจ้งเตือนครบกำหนดดูแลรถยนต์</h2>
      <p style="color: #666; font-size: 14px;">พบรายการบริการหรือเอกสารภาษีที่ใกล้ถึงวันกำหนดชำระ/ตรวจเช็ก ภายใน <strong>${notifyDaysBefore} วัน</strong> ต่อไปนี้:</p>
  `;

  let hasData = false;

  Object.values(dueItemsMap).forEach((v) => {
    if (v.renewals.length === 0 && v.jobs.length === 0) return;
    hasData = true;

    tgMessage += `🚘 <b>${v.vehicleName}</b> (${v.plate})\n`;
    htmlBody += `
      <div style="margin-bottom: 20px; padding: 12px; background-color: #f9f9f9; border-left: 4px solid #000; border-radius: 4px;">
        <span style="font-weight: bold; font-size: 16px; color: #000;">🚘 ${v.vehicleName}</span> <span style="font-size: 13px; color: #666;">(${v.plate})</span>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
    `;

    v.renewals.forEach((r) => {
      const daysLeft = Math.ceil((new Date(r.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      tgMessage += `  • ${r.title} (ครบกำหนด: ${formatDate(r.date)} - อีก ${daysLeft} วัน)\n`;
      htmlBody += `<li style="margin-bottom: 4px;"><strong>${r.title}</strong>: ครบกำหนด ${formatDate(r.date)} (อีก ${daysLeft} วัน) ${r.cost > 0 ? `| ค่าใช้จ่าย: ${formatTHB(r.cost)}` : ""}</li>`;
    });

    v.jobs.forEach((j) => {
      const daysLeft = Math.ceil((new Date(j.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      tgMessage += `  • ${j.title} (เป้าหมาย: ${formatDate(j.date)} - อีก ${daysLeft} วัน)\n`;
      htmlBody += `<li style="margin-bottom: 4px;"><strong>${j.title}</strong>: วันเป้าหมาย ${formatDate(j.date)} (อีก ${daysLeft} วัน) ${j.odometer ? `| เลขไมล์เป้าหมาย: ${j.odometer.toLocaleString()} กม.` : ""}</li>`;
    });

    tgMessage += `\n`;
    htmlBody += `
        </ul>
      </div>
    `;
  });

  htmlBody += `
      <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
        ข้อความส่งจากระบบอัตโนมัติ Home Garage Manager
      </p>
    </div>
  `;

  // 3.6 Dispatch notifications
  if (emailEnabled) {
    const res = await sendEmailNotification(
      userEmail,
      "แจ้งเตือนกำหนดครบกำหนดดูแลรักษารถยนต์ (Home Garage Manager)",
      htmlBody
    );
    if (res.ok) emailSent = true;
    else console.error(`Error sending email to ${userEmail}:`, res.error);
  }

  if (telegramEnabled && telegramChatId) {
    const res = await sendTelegramNotification(telegramChatId, tgMessage);
    if (res.ok) telegramSent = true;
    else console.error(`Error sending Telegram to chat ${telegramChatId}:`, res.error);
  }

  return { emailSent, telegramSent, messageCount };
}
