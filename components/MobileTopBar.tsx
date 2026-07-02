import Link from "next/link";
import { Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileTopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
        <Logo className="h-6 w-6 text-amber-600" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">โฮมการาจ</p>
        </div>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link 
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          title="ตั้งค่า"
        >
          <Settings className="h-4.5 w-4.5" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
