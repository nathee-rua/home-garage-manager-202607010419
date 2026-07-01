import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as THB currency. */
export function formatTHB(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format an ISO date string as a Thai-locale date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Number of whole days from today until the given date (negative = past). */
export function daysUntil(date: string | null | undefined, today = new Date()): number | null {
  if (!date) return null;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((t1.getTime() - t0.getTime()) / (1000 * 60 * 60 * 24));
}
