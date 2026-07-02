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
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b px-6 hover:opacity-85 transition-opacity">
        <Logo className="h-7 w-7 text-primary" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">โฮมการาจ</p>
          <p className="text-[11px] text-muted-foreground">Home Garage Manager</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.labelTh}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-[11px] leading-relaxed text-muted-foreground">
        เวอร์ชัน 1.0 · ใช้ในครัวเรือน
      </div>
    </aside>
  );
}
