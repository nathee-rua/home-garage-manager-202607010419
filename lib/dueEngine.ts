// Core scheduling logic for maintenance due dates / odometers.
import type { DueStatus } from "./types";

export interface ComputeNextDueInput {
  lastDate: string | Date | null | undefined;
  lastOdometer: number | null | undefined;
  intervalMonths: number | null | undefined;
  intervalKm: number | null | undefined;
}

export interface NextDue {
  nextDueDate: string | null; // ISO yyyy-mm-dd
  nextDueOdometer: number | null;
}

/**
 * Given the last service point and the rule intervals, compute the next due
 * date and next due odometer. Either dimension may be null if no interval set.
 */
export function computeNextDue(input: ComputeNextDueInput): NextDue {
  const { lastDate, lastOdometer, intervalMonths, intervalKm } = input;

  let nextDueDate: string | null = null;
  if (lastDate && intervalMonths && intervalMonths > 0) {
    const d = new Date(lastDate);
    if (!Number.isNaN(d.getTime())) {
      d.setMonth(d.getMonth() + intervalMonths);
      nextDueDate = toISODate(d);
    }
  }

  let nextDueOdometer: number | null = null;
  if (
    lastOdometer !== null &&
    lastOdometer !== undefined &&
    intervalKm &&
    intervalKm > 0
  ) {
    nextDueOdometer = lastOdometer + intervalKm;
  }

  return { nextDueDate, nextDueOdometer };
}

export interface ComputeStatusInput {
  nextDueDate: string | Date | null | undefined;
  nextDueOdometer: number | null | undefined;
  currentOdometer: number | null | undefined;
  today?: Date;
}

const DUE_SOON_DAYS = 14;
const DUE_SOON_KM = 500;

/**
 * Classify the due state:
 *  - overdue  : past the due date OR current odometer past the due odometer
 *  - due_soon : within 14 days OR within 500 km of the due point (yellow)
 *  - normal   : everything else (green)
 */
export function computeStatus(input: ComputeStatusInput): DueStatus {
  const { nextDueDate, nextDueOdometer, currentOdometer, today = new Date() } = input;

  let overdue = false;
  let dueSoon = false;

  // Date dimension
  if (nextDueDate) {
    const due = new Date(nextDueDate);
    if (!Number.isNaN(due.getTime())) {
      const days = daysBetween(today, due);
      if (days < 0) overdue = true;
      else if (days <= DUE_SOON_DAYS) dueSoon = true;
    }
  }

  // Odometer dimension
  if (
    nextDueOdometer !== null &&
    nextDueOdometer !== undefined &&
    currentOdometer !== null &&
    currentOdometer !== undefined
  ) {
    const remaining = nextDueOdometer - currentOdometer;
    if (remaining < 0) overdue = true;
    else if (remaining <= DUE_SOON_KM) dueSoon = true;
  }

  if (overdue) return "overdue";
  if (dueSoon) return "due_soon";
  return "normal";
}

/** Whole days from a to b (b - a), ignoring time-of-day. */
function daysBetween(a: Date, b: Date): number {
  const d0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d1 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24));
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
