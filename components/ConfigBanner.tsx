import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function ConfigBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>
        <p className="font-medium">ยังไม่ได้เชื่อมต่อ Supabase</p>
        <p className="text-muted-foreground">
          แอปกำลังทำงานในโหมดตัวอย่าง (ข้อมูลว่าง) กรุณาตั้งค่า environment variables แล้ว
          redeploy — ดูวิธีที่หน้า{" "}
          <Link href="/settings" className="font-medium underline">
            ตั้งค่า
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
