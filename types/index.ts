import type { ReminderCategory, Channel, OffsetUnit, Recurrence } from "@prisma/client";

/** Forme sérialisée d'un rappel transmise aux composants client (dates en ISO). */
export type ClientReminder = {
  id: string;
  title: string;
  description: string | null;
  category: ReminderCategory;
  dueAt: string;
  allDay: boolean;
  recurrence: Recurrence;
  hasDocument: boolean;
  status: string;
  rules: { offsetValue: number; offsetUnit: OffsetUnit; channel: Channel }[];
};
