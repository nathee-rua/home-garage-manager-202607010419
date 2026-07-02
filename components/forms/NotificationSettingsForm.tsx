"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, Mail, Send, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { saveUserSettings, sendTestNotification } from "@/app/actions";
import type { UserSettings } from "@/lib/types";

interface NotificationSettingsFormProps {
  settings: UserSettings | null;
}

export function NotificationSettingsForm({ settings }: NotificationSettingsFormProps) {
  const [emailEnabled, setEmailEnabled] = useState(settings?.email_enabled ?? true);
  const [telegramEnabled, setTelegramEnabled] = useState(settings?.telegram_enabled ?? false);
  const [telegramChatId, setTelegramChatId] = useState(settings?.telegram_chat_id ?? "");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(settings?.notify_days_before ?? 7);

  const [isPending, startTransition] = useTransition();
  const [isTesting, startTestTransition] = useTransition();

  const handleSave = () => {
    const fd = new FormData();
    fd.set("email_enabled", emailEnabled ? "true" : "false");
    fd.set("telegram_enabled", telegramEnabled ? "true" : "false");
    fd.set("telegram_chat_id", telegramChatId);
    fd.set("notify_days_before", String(notifyDaysBefore));

    startTransition(async () => {
      const res = await saveUserSettings(fd);
      if (res.ok) {
        toast.success("บันทึกการตั้งค่าแจ้งเตือนเรียบร้อยแล้ว");
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  };

  const handleTest = () => {
    startTestTransition(async () => {
      const res = await sendTestNotification();
      if (res.ok) {
        toast.success("ส่งการแจ้งเตือนทดสอบสำเร็จแล้ว! โปรดตรวจสอบกล่องข้อความและ Telegram ของคุณ");
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาดในการส่งข้อความทดสอบ");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email Notification Control */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <div className="mt-0.5">
            <Checkbox
              id="sett-email"
              checked={emailEnabled}
              onCheckedChange={(v) => setEmailEnabled(v === true)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sett-email" className="font-semibold text-sm cursor-pointer flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" /> ส่งการแจ้งเตือนผ่าน Email / Email alerts
            </Label>
            <p className="text-xs text-muted-foreground">
              ส่งสรุปรายการตรวจเช็กและต่ออายุภาษีทางอีเมลที่คุณลงทะเบียนไว้
            </p>
          </div>
        </div>

        {/* Telegram Notification Control */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <div className="mt-0.5">
            <Checkbox
              id="sett-telegram"
              checked={telegramEnabled}
              onCheckedChange={(v) => setTelegramEnabled(v === true)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sett-telegram" className="font-semibold text-sm cursor-pointer flex items-center gap-1.5">
              <Send className="h-4 w-4 text-blue-500" /> ส่งการแจ้งเตือนผ่าน Telegram Bot / Telegram alerts
            </Label>
            <p className="text-xs text-muted-foreground">
              แจ้งเตือนข้อความสรุปตรงเข้าแอป Telegram บนมือถือ/คอมพิวเตอร์ของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
        {/* Days Before input */}
        <div className="space-y-2">
          <Label htmlFor="notify_days_before" className="font-semibold">แจ้งเตือนล่วงหน้า (วัน) / Notify Days Before</Label>
          <Input
            id="notify_days_before"
            type="number"
            min={1}
            max={60}
            value={notifyDaysBefore}
            onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
            placeholder="7"
          />
          <p className="text-xs text-muted-foreground">
            กำหนดให้แจ้งเตือนรายการล่วงหน้าก่อนถึงวันครบกำหนดจริงเป็นเวลาตามจำนวนวันที่ระบุ (แนะนำ: 7 วัน)
          </p>
        </div>

        {/* Telegram Chat ID Input with Instructions */}
        <div className="space-y-2">
          <Label htmlFor="telegram_chat_id" className="font-semibold flex items-center gap-1.5">
            Telegram Chat ID
          </Label>
          <Input
            id="telegram_chat_id"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="1234567890"
            disabled={!telegramEnabled}
          />
          <div className="rounded bg-slate-50 p-2.5 text-xs text-muted-foreground space-y-1 border">
            <span className="font-semibold flex items-center gap-1"><Info className="h-3 w-3" /> วิธีขอเลข Telegram Chat ID:</span>
            <ol className="list-decimal list-inside space-y-0.5 ml-1">
              <li>เปิดแอป Telegram ค้นหาบอตชื่อ <code>@userinfobot</code> หรือพิมพ์ข้อความหาบอตใดๆ ที่แชร์ข้อมูลแชทของคุณ</li>
              <li>ส่งข้อความไปหา หรือกดปุ่ม <code>/start</code></li>
              <li>บอตจะส่งเลข <b>ID: 1234567890</b> กลับมา ให้คัดลอกตัวเลขนั้นมาวางในช่องด้านบน</li>
              <li>* ตรวจสอบให้มั่นใจว่าได้เริ่มกดเริ่มคุย (Start) กับบอตของ Home Garage Manager แล้ว</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={isTesting || isPending || (!emailEnabled && (!telegramEnabled || !telegramChatId))}
        >
          {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          ทดสอบส่งข้อความ / Test Alert
        </Button>
        <Button onClick={handleSave} disabled={isPending || isTesting}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          บันทึกการตั้งค่า
        </Button>
      </div>
    </div>
  );
}
