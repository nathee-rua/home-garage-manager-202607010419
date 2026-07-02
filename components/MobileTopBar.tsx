"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
      {/* Left Section: Hamburger Drawer & Logo */}
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              title="เมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800">
            <div className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-6">
              <Logo className="h-7 w-7 text-amber-600" />
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900 dark:text-white">โฮมการาจ</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Home Garage Manager</p>
              </div>
            </div>
            <nav className="space-y-1 py-4 pr-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-r-lg pl-5 pr-3 py-2.5 text-sm font-medium transition-all border-l-2",
                      active
                        ? "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-600 font-bold shadow-sm"
                        : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5", active ? "text-amber-600" : "text-slate-400 dark:text-slate-500")} />
                    <span>{item.labelTh}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <Logo className="h-6 w-6 text-amber-600" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">โฮมการาจ</p>
          </div>
        </Link>
      </div>

      {/* Right Section: Settings & Theme Switcher */}
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
