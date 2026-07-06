import { addWeeks, addMonths, addYears, subMinutes, subHours, subDays, subWeeks, isBefore, isAfter, differenceInCalendarDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { OffsetUnit, Recurrence } from "@prisma/client";

/** Décale une date « échéance » d'un offset de règle (J-x, H-x…). */
export function applyOffset(dueAt: Date, value: number, unit: OffsetUnit): Date {
  switch (unit) {
    case "MINUTE": return subMinutes(dueAt, value);
    case "HOUR": return subHours(dueAt, value);
    case "DAY": return subDays(dueAt, value);
    case "WEEK": return subWeeks(dueAt, value);
    default: return subDays(dueAt, value);
  }
}

/** Avance une date selon la récurrence (pour recalculer la prochaine occurrence). */
export function nextOccurrence(dueAt: Date, recurrence: Recurrence): Date {
  switch (recurrence) {
    case "WEEKLY": return addWeeks(dueAt, 1);
    case "MONTHLY": return addMonths(dueAt, 1);
    case "YEARLY": return addYears(dueAt, 1);
    default: return dueAt;
  }
}

/**
 * Ramène une échéance récurrente passée à sa prochaine occurrence future.
 * (Utile quand un modèle est appliqué avec une date « dans le passé ».)
 */
export function rollForward(dueAt: Date, recurrence: Recurrence, now = new Date()): Date {
  if (recurrence === "NONE") return dueAt;
  let d = new Date(dueAt);
  let guard = 0;
  while (isBefore(d, now) && guard < 1200) {
    d = nextOccurrence(d, recurrence);
    guard++;
  }
  return d;
}

export function daysUntil(date: Date, now = new Date()): number {
  return differenceInCalendarDays(date, now);
}

export const isPast = (d: Date, now = new Date()) => isBefore(d, now);
export const isFuture = (d: Date, now = new Date()) => isAfter(d, now);

/** Zone d'affichage pour le regroupement dashboard. */
export type Zone = "late" | "today" | "week" | "month" | "later";
export function zoneFor(date: Date, now = new Date()): Zone {
  const n = daysUntil(date, now);
  if (n < 0) return "late";
  if (n === 0) return "today";
  if (n <= 7) return "week";
  if (n <= 30) return "month";
  return "later";
}

export function formatDue(date: Date, timezone = "Europe/Paris", withTime = false): string {
  return formatInTimeZone(date, timezone, withTime ? "d MMM yyyy 'à' HH:mm" : "d MMM yyyy");
}

export function toUserZone(date: Date, timezone = "Europe/Paris"): Date {
  return toZonedTime(date, timezone);
}
