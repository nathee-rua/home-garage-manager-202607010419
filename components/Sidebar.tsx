"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white md:flex md:flex-col">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-6 hover:opacity-85 transition-opacity">
        <Logo className="h-7 w-7 text-amber-600" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">โฮมการาจ</p>
          <p className="text-[10px] font-medium text-slate-400">Home Garage Manager</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 py-4 pr-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-r-lg pl-5 pr-3 py-2.5 text-sm font-medium transition-all border-l-2",
                active
                  ? "bg-amber-500/10 text-amber-800 border-amber-600 font-bold shadow-sm"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", active ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span>{item.labelTh}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/80 p-4 text-[10px] font-medium text-slate-400">
        เวอร์ชัน 1.0 · Household Garage Manager
      </div>
    </aside>
  );
}
