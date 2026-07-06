import { z } from "zod";

/**
 * Validation centralisée de l'environnement.
 * Les variables réellement requises pour démarrer sont marquées `min(1)`.
 * Les intégrations optionnelles restent `optional()` : leur absence désactive
 * proprement la fonctionnalité concernée (voir `lib/notifications`, `lib/storage`).
 */
const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET est requis"),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  ENCRYPTION_KEY: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ESSENTIEL: z.string().optional(),
  STRIPE_PRICE_PLUS: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Soonly <rappels@soonly.app>"),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  WHATSAPP_PROVIDER_TOKEN: z.string().optional(),
  WHATSAPP_FROM: z.string().optional(),

  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:contact@soonly.app"),

  STORAGE_BUCKET: z.string().default("soonly-documents"),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),

  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_TENANT: z.string().default("common"),

  CRON_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Configuration d'environnement invalide :\n${issues}`);
}

export const env = parsed.data;

/** Indique si une intégration/canal est configuré côté serveur. */
export const featureConfigured = {
  stripe: () => Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ESSENTIEL && env.STRIPE_PRICE_PLUS),
  stripeWebhook: () => Boolean(env.STRIPE_WEBHOOK_SECRET),
  email: () => Boolean(env.RESEND_API_KEY),
  sms: () => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER),
  whatsapp: () => Boolean(env.WHATSAPP_PROVIDER_TOKEN && env.WHATSAPP_FROM),
  push: () => Boolean(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
  storage: () => Boolean(env.STORAGE_ENDPOINT && env.STORAGE_ACCESS_KEY_ID && env.STORAGE_SECRET_ACCESS_KEY),
  googleCalendar: () => Boolean(env.GOOGLE_CALENDAR_CLIENT_ID && env.GOOGLE_CALENDAR_CLIENT_SECRET),
  microsoftCalendar: () => Boolean(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET),
  encryption: () => Boolean(env.ENCRYPTION_KEY),
};
