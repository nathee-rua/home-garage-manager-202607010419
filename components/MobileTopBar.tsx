import Link from "next/link";
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
      <ThemeToggle />
    </header>
  );
}
