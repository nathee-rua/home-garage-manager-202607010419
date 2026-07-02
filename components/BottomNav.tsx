"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200/80 bg-white/95 backdrop-blur-md pb-safe md:hidden dark:bg-slate-950/95 dark:border-slate-800">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-all relative border-t-2",
              active 
                ? "border-amber-600 text-amber-800 dark:text-amber-400 bg-amber-500/[0.04] font-bold" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500")} />
            <span className="truncate px-1">{item.labelTh}</span>
          </Link>
        );
      })}
    </nav>
  );
}
