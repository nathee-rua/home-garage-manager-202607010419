import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <p className="text-lg font-medium">ไม่พบหน้าที่ต้องการ</p>
      <p className="text-sm text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link href="/">กลับหน้าแรก</Link>
      </Button>
    </div>
  );
}
