import {
  LayoutDashboard,
  Car,
  Wrench,
  AlertTriangle,
  CalendarClock,
  Receipt,
  Store,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelTh: string;
  labelEn: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", labelTh: "แดชบอร์ด", labelEn: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", labelTh: "รถของฉัน", labelEn: "Vehicles", icon: Car },
  { href: "/maintenance", labelTh: "การบำรุงรักษา", labelEn: "Maintenance", icon: Wrench },
  { href: "/repairs", labelTh: "การซ่อม", labelEn: "Repairs", icon: AlertTriangle },
  { href: "/renewals", labelTh: "ต่ออายุ", labelEn: "Renewals", icon: CalendarClock },
  { href: "/expenses", labelTh: "ค่าใช้จ่าย", labelEn: "Expenses", icon: Receipt },
  { href: "/providers", labelTh: "ร้าน/ศูนย์บริการ", labelEn: "Providers", icon: Store },
  { href: "/settings", labelTh: "ตั้งค่า", labelEn: "Settings", icon: Settings },
];

// Items shown in the compact mobile bottom nav (5 max).
export const bottomNavItems: NavItem[] = navItems.filter((i) =>
  ["/", "/vehicles", "/maintenance", "/renewals", "/expenses"].includes(i.href)
);
