import { CheckCircle2, XCircle, Bell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSupabaseServiceKey,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function present(v: string) {
  return v.length > 0 && v !== "placeholder";
}

function EnvRow({ name, ok, hint }: { name: string; ok: boolean; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-3 last:border-0">
      <div>
        <p className="font-mono text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {ok ? (
        <Badge variant="success">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> ตั้งค่าแล้ว
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3.5 w-3.5" /> ยังไม่ได้ตั้งค่า
        </Badge>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const service = getSupabaseServiceKey();
  const resend = process.env.RESEND_API_KEY ?? "";
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <PageHeader title="ตั้งค่า" subtitle="Settings · สถานะการเชื่อมต่อและการแจ้งเตือน" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถานะ Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <EnvRow
            name="NEXT_PUBLIC_SUPABASE_URL"
            ok={present(url) && url.startsWith("http")}
            hint="URL ของโปรเจกต์ Supabase (Settings → API)"
          />
          <EnvRow
            name="NEXT_PUBLIC_SUPABASE_ANON_KEY"
            ok={present(anon) && anon.length > 10}
            hint="Anon public key สำหรับฝั่ง browser"
          />
          <EnvRow
            name="SUPABASE_SERVICE_ROLE_KEY"
            ok={present(service) && service.length > 10}
            hint="Service role key สำหรับ server actions"
          />
          <EnvRow
            name="RESEND_API_KEY"
            ok={present(resend)}
            hint="สำหรับส่งอีเมลแจ้งเตือน (ตัวเลือกเสริม)"
          />
          <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
            {configured ? (
              <p className="flex items-center gap-2 font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> เชื่อมต่อ Supabase สำเร็จ — แอปพร้อมใช้งาน
              </p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">วิธีตั้งค่า Supabase</p>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  <li>สร้างโปรเจกต์ที่ supabase.com</li>
                  <li>
                    เปิด SQL Editor แล้วรันไฟล์ <code>supabase/schema.sql</code>
                  </li>
                  <li>
                    สร้าง Storage bucket ชื่อ <code>attachments</code> (public)
                  </li>
                  <li>คัดลอก URL, anon key, service role key จาก Settings → API</li>
                  <li>ตั้งค่า Environment Variables ใน Vercel แล้ว redeploy</li>
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> การแจ้งเตือน (Notifications)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            การแจ้งเตือนทางอีเมลผ่าน Resend เป็นฟีเจอร์ที่วางโครงไว้สำหรับเวอร์ชันถัดไป
            (v2). เมื่อกำหนดค่า <code>RESEND_API_KEY</code> แล้ว
            สามารถต่อยอดเป็น cron job รายวันเพื่อส่งสรุปรายการที่ใกล้ถึงกำหนด/เกินกำหนดได้
          </p>
          <Badge variant="secondary">เร็วๆ นี้ / Coming soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
