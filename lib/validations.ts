import { z } from "zod";

export const categoryEnum = z.enum([
  "ADMIN","SANTE","MAISON","VEHICULE","ASSURANCE","BANQUE","ABONNEMENT",
  "FAMILLE","ANIMAUX","VOYAGE","TRAVAIL","LOISIRS","GARANTIE","IMPOTS","AUTRE",
]);
export const channelEnum = z.enum(["EMAIL", "PUSH", "SMS", "WHATSAPP"]);
export const recurrenceEnum = z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY"]);
export const offsetUnitEnum = z.enum(["MINUTE", "HOUR", "DAY", "WEEK"]);
export const sourceEnum = z.enum([
  "MANUAL","GOOGLE_CALENDAR","MICROSOFT_CALENDAR","APPLE_ICS","GMAIL",
  "OUTLOOK_MAIL","DOCTOLIB","IMPORT_ICS","IMPORT_CSV","DOCUMENT",
]);

export const ruleSchema = z.object({
  offsetValue: z.number().int().min(0).max(365),
  offsetUnit: offsetUnitEnum.default("DAY"),
  channel: channelEnum.default("EMAIL"),
  enabled: z.boolean().default(true),
});

export const createReminderSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(140),
  description: z.string().trim().max(2000).optional(),
  category: categoryEnum.default("AUTRE"),
  dueAt: z.coerce.date(),
  allDay: z.boolean().default(true),
  timezone: z.string().default("Europe/Paris"),
  recurrence: recurrenceEnum.default("NONE"),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  source: sourceEnum.default("MANUAL"),
  externalSourceId: z.string().optional(),
  linkedDocumentId: z.string().optional(),
  rules: z.array(ruleSchema).max(8).default([]),
});

export const updateReminderSchema = createReminderSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "DONE", "ARCHIVED"]).optional(),
});

export const deleteReminderSchema = z.object({ id: z.string().min(1) });

export const documentMetaSchema = z.object({
  title: z.string().trim().min(1).max(140),
  category: categoryEnum.default("AUTRE"),
  expirationDate: z.coerce.date().optional(),
  tags: z.array(z.string().trim().max(40)).max(12).default([]),
  createLinkedReminder: z.boolean().default(false),
});

export const phoneStartSchema = z.object({
  phone: z.string().trim().regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro invalide"),
});
export const phoneVerifySchema = z.object({
  phone: z.string().trim().min(8),
  code: z.string().trim().length(6),
});

export const checkoutSchema = z.object({ plan: z.enum(["ESSENTIEL", "PLUS"]) });

export const importEventSchema = z.object({
  externalEventId: z.string().min(1),
  category: categoryEnum.default("SANTE"),
  rules: z.array(z.number().int().min(0).max(365)).default([7, 1]),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});
