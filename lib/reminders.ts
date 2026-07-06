import { db } from "./db";
import { applyOffset, nextOccurrence } from "./dates";
import type { Reminder, ReminderRule } from "@prisma/client";
import { isWithinInterval } from "date-fns";

export type DueRule = {
  reminder: Reminder;
  rule: ReminderRule;
  fireAt: Date;
  occurrenceAt: Date;
};

/**
 * Calcule les prochaines heures d'envoi d'un rappel (échéance + règles).
 * Renvoie uniquement les tirs à venir, triés.
 */
export function upcomingFires(reminder: Reminder, rules: ReminderRule[], from = new Date()): DueRule[] {
  const out: DueRule[] = [];
  const occurrence = reminder.dueAt;
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const fireAt = applyOffset(occurrence, rule.offsetValue, rule.offsetUnit);
    if (fireAt >= from) out.push({ reminder, rule, fireAt, occurrenceAt: occurrence });
  }
  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

/**
 * Moteur de scan appelé par le cron (/api/reminders/due).
 * Sélectionne les règles dont l'heure de tir tombe dans la fenêtre [now - window, now],
 * en s'appuyant sur `lastFiredFor` pour ne jamais envoyer deux fois la même occurrence.
 */
export async function collectDueRules(now = new Date(), windowMinutes = 30): Promise<DueRule[]> {
  const windowStart = new Date(now.getTime() - windowMinutes * 60_000);

  // On borne le scan aux rappels actifs dont l'échéance est proche (perf).
  const horizon = new Date(now.getTime() + 400 * 24 * 3600 * 1000);
  const reminders = await db.reminder.findMany({
    where: { status: "ACTIVE", dueAt: { lte: horizon } },
    include: { rules: true },
  });

  const due: DueRule[] = [];
  for (const r of reminders) {
    for (const rule of r.rules) {
      if (!rule.enabled) continue;
      const fireAt = applyOffset(r.dueAt, rule.offsetValue, rule.offsetUnit);
      const inWindow = isWithinInterval(fireAt, { start: windowStart, end: now });
      if (!inWindow) continue;
      // Anti-doublon : cette occurrence a-t-elle déjà été traitée ?
      const already = rule.lastFiredFor && rule.lastFiredFor.getTime() === r.dueAt.getTime();
      if (already) continue;
      due.push({ reminder: r, rule, fireAt, occurrenceAt: r.dueAt });
    }
  }
  return due;
}

/** Marque une règle comme envoyée pour l'occurrence courante. */
export async function markFired(ruleId: string, occurrenceAt: Date): Promise<void> {
  await db.reminderRule.update({ where: { id: ruleId }, data: { lastFiredFor: occurrenceAt } });
}

/**
 * Fait avancer un rappel récurrent à l'occurrence suivante une fois passé,
 * et réinitialise les verrous de règles.
 */
export async function advanceIfRecurring(reminder: Reminder): Promise<void> {
  if (reminder.recurrence === "NONE") return;
  const next = nextOccurrence(reminder.dueAt, reminder.recurrence);
  await db.reminder.update({ where: { id: reminder.id }, data: { dueAt: next } });
  await db.reminderRule.updateMany({ where: { reminderId: reminder.id }, data: { lastFiredFor: null } });
}

/** Règles de rappel par défaut, cohérentes avec l'onboarding. */
export const DEFAULT_RULES: Array<{ offsetValue: number; offsetUnit: "DAY"; channel: "EMAIL" | "PUSH" }> = [
  { offsetValue: 30, offsetUnit: "DAY", channel: "EMAIL" },
  { offsetValue: 7, offsetUnit: "DAY", channel: "EMAIL" },
  { offsetValue: 1, offsetUnit: "DAY", channel: "PUSH" },
];
