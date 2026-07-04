"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Car, Wrench, AlertTriangle, CalendarClock, Receipt, Store, Settings, Search } from "lucide-react";

interface MenuItem {
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

const MENU_ITEMS: MenuItem[] = [
  { title: "แดชบอร์ด / Dashboard", subtitle: "ภาพรวมการบำรุงรักษารถทั้งหมด", href: "/", icon: LayoutDashboard },
  { title: "รถของฉัน / Vehicles", subtitle: "จัดการประวัติการใช้น้ำมันและเลขไมล์ของรถแต่ละคัน", href: "/vehicles", icon: Car },
  { title: "การบำรุงรักษา / Maintenance", subtitle: "ประวัติการเข้าเช็คระยะ เปลี่ยนน้ำมันเครื่อง", href: "/maintenance", icon: Wrench },
  { title: "การซ่อมแซม / Repairs", subtitle: "บันทึกการซ่อมแซม อะไหล่ และค่าใช้จ่ายจริง", href: "/repairs", icon: AlertTriangle },
  { title: "ต่ออายุ / Renewals", subtitle: "แจ้งเตือนการต่อภาษี พ.ร.บ. และประกันภัย", href: "/renewals", icon: CalendarClock },
  { title: "ค่าใช้จ่าย / Expenses", subtitle: "สรุปรายจ่ายตามรถ หมวด และรายเดือนพร้อมสถิติ", href: "/expenses", icon: Receipt },
  { title: "ร้านและศูนย์บริการ / Providers", subtitle: "รายชื่อศูนย์บริการอู่ซ่อมรถแนะนำ", href: "/providers", icon: Store },
  { title: "ตั้งค่าระบบ / Settings", subtitle: "กำหนดค่าระบบ การแจ้งเตือนอีเมลและบอต", href: "/settings", icon: Settings },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shortcutKey, setShortcutKey] = useState("Ctrl+K");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    setShortcutKey(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigateTo = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigateTo(filteredItems[selectedIndex].href);
      }
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/40 backdrop-blur-sm transition-all"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800/80 h-12">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder={`ค้นหาหน้าเว็บ หรือพิมพ์คำสั่ง... (${shortcutKey} เพื่อเปิด/ปิด, Esc เพื่อปิด)`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none border-none"
          />
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2 space-y-0.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.href}
                  onClick={() => navigateTo(item.href)}
                  data-active={active}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    active
                      ? "bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    active ? "bg-amber-500/10 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  {active && (
                    <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      Enter ↵
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground p-4 text-center">ไม่พบคำสั่งหรือหน้าที่ค้นหา</p>
          )}
        </div>
      </div>
    </div>
  );
}
