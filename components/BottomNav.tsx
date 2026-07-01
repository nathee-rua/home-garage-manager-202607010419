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
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card md:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate px-1">{item.labelTh}</span>
          </Link>
        );
      })}
    </nav>
  );
}
