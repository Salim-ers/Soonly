import { db } from "./db";
import { env, featureConfigured } from "./env";
import { getUserPlan, planAllows } from "./permissions";
import { formatDue } from "./dates";
import type { Channel, Reminder, ReminderRule, User } from "@prisma/client";
import { Resend } from "resend";
import webpush from "web-push";

/**
 * Service d'envoi de notifications multi-canal.
 *
 * Principes :
 *  - Aucun document n'est jamais transmis par SMS/WhatsApp — uniquement titre + date.
 *  - Le consentement par canal (RGPD) et le plan sont vérifiés avant tout envoi.
 *  - Si un provider n'est pas configuré, l'envoi est journalisé en SKIPPED
 *    avec une raison explicite. Jamais de faux « succès ».
 */

type SendResult = { ok: boolean; providerMessageId?: string; error?: string; skipped?: boolean };

function emailBody(user: User, reminder: Reminder, ruleLabel: string) {
  const when = formatDue(reminder.dueAt, user.timezone, !reminder.allDay);
  const subject = `Rappel Soonly — ${reminder.title} (${when})`;
  const text =
    `Bonjour ${user.name ?? ""},\n\n` +
    `Voici un rappel : « ${reminder.title} » arrive le ${when}.\n` +
    (reminder.description ? `\nNote : ${reminder.description}\n` : "") +
    `\nVous recevez ce message car vous avez programmé un rappel ${ruleLabel} dans Soonly.\n` +
    `Gérer mes rappels : ${env.NEXT_PUBLIC_APP_URL}/reminders\n`;
  return { subject, text };
}

/** Message sobre pour SMS/WhatsApp — respecte l'option « masquer les titres sensibles ». */
function shortMessage(user: User, reminder: Reminder): string {
  const when = formatDue(reminder.dueAt, user.timezone, !reminder.allDay);
  if (user.hideSensitive) return `Soonly : une échéance approche (${when}). Détails dans l'app.`;
  return `Soonly : « ${reminder.title} » — ${when}.`;
}

async function sendEmail(user: User, reminder: Reminder, ruleLabel: string): Promise<SendResult> {
  if (!featureConfigured.email()) return { ok: false, skipped: true, error: "Resend non configuré (RESEND_API_KEY)" };
  if (!user.email) return { ok: false, skipped: true, error: "Utilisateur sans email" };
  const resend = new Resend(env.RESEND_API_KEY);
  const { subject, text } = emailBody(user, reminder, ruleLabel);
  const res = await resend.emails.send({ from: env.EMAIL_FROM, to: user.email, subject, text });
  if (res.error) return { ok: false, error: res.error.message };
  return { ok: true, providerMessageId: res.data?.id };
}

async function sendSms(user: User, reminder: Reminder): Promise<SendResult> {
  if (!featureConfigured.sms()) return { ok: false, skipped: true, error: "Twilio non configuré" };
  if (!user.phone || !user.phoneVerifiedAt) return { ok: false, skipped: true, error: "Numéro non vérifié" };
  // Import dynamique : garde le bundle léger et évite d'exiger twilio si non utilisé.
  const twilio = (await import("twilio")).default;
  const client = twilio(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!);
  const msg = await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER,
    to: user.phone,
    body: shortMessage(user, reminder),
  });
  return { ok: true, providerMessageId: msg.sid };
}

async function sendWhatsapp(user: User, reminder: Reminder): Promise<SendResult> {
  if (!featureConfigured.whatsapp()) return { ok: false, skipped: true, error: "WhatsApp non configuré" };
  if (!user.phone || !user.phoneVerifiedAt) return { ok: false, skipped: true, error: "Numéro non vérifié" };
  if (!user.consentWhatsapp) return { ok: false, skipped: true, error: "Consentement WhatsApp manquant" };
  // WhatsApp Business Cloud API (Meta). Nécessite un template approuvé pour les messages sortants.
  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_FROM}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_PROVIDER_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: user.phone.replace(/\D/g, ""),
      type: "text",
      text: { body: shortMessage(user, reminder) },
    }),
  });
  if (!res.ok) return { ok: false, error: `WhatsApp API ${res.status}` };
  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  return { ok: true, providerMessageId: data.messages?.[0]?.id };
}

async function sendPush(user: User, reminder: Reminder): Promise<SendResult> {
  if (!featureConfigured.push()) return { ok: false, skipped: true, error: "Web Push non configuré (VAPID)" };
  const subs = await db.pushSubscription.findMany({ where: { userId: user.id } });
  if (subs.length === 0) return { ok: false, skipped: true, error: "Aucun appareil abonné aux notifications" };

  webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
  const payload = JSON.stringify({
    title: "Soonly",
    body: shortMessage(user, reminder),
    url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  let anyOk = false;
  let lastId: string | undefined;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      anyOk = true;
      lastId = s.id;
    } catch (e: unknown) {
      // Abonnement expiré (410/404) : on le retire.
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
    }
  }
  return anyOk ? { ok: true, providerMessageId: lastId } : { ok: false, error: "Échec d'envoi push" };
}

const CONSENT: Record<Channel, keyof User> = {
  EMAIL: "consentEmail",
  PUSH: "consentPush",
  SMS: "consentSms",
  WHATSAPP: "consentWhatsapp",
};

const PLAN_FEATURE: Partial<Record<Channel, "sms" | "whatsapp">> = {
  SMS: "sms",
  WHATSAPP: "whatsapp",
};

/** Point d'entrée unique : envoie un rappel sur un canal et journalise le résultat. */
export async function dispatch(user: User, reminder: Reminder, rule: ReminderRule): Promise<SendResult> {
  const channel = rule.channel;

  // 1) Consentement.
  if (!user[CONSENT[channel]]) {
    return log(user.id, reminder.id, channel, "SKIPPED", undefined, "Consentement du canal désactivé");
  }
  // 2) Plan (SMS/WhatsApp = Plus).
  const feat = PLAN_FEATURE[channel];
  if (feat) {
    const plan = await getUserPlan(user.id);
    if (!planAllows(plan, feat)) {
      return log(user.id, reminder.id, channel, "SKIPPED", undefined, "Canal réservé à Soonly Plus");
    }
  }

  const label = ruleLabel(rule);
  let res: SendResult;
  try {
    if (channel === "EMAIL") res = await sendEmail(user, reminder, label);
    else if (channel === "SMS") res = await sendSms(user, reminder);
    else if (channel === "WHATSAPP") res = await sendWhatsapp(user, reminder);
    else res = await sendPush(user, reminder);
  } catch (e: unknown) {
    res = { ok: false, error: e instanceof Error ? e.message : "Erreur d'envoi" };
  }

  const status = res.skipped ? "SKIPPED" : res.ok ? "SENT" : "FAILED";
  return log(user.id, reminder.id, channel, status, res.providerMessageId, res.error, res);
}

export function ruleLabel(rule: ReminderRule): string {
  const unit = { MINUTE: "min", HOUR: "h", DAY: "j", WEEK: "sem" }[rule.offsetUnit];
  return rule.offsetValue === 0 ? "le jour même" : `J-${rule.offsetValue}${unit === "j" ? "" : ` (${rule.offsetValue}${unit})`}`;
}

async function log(
  userId: string,
  reminderId: string | null,
  channel: Channel,
  status: "SENT" | "FAILED" | "SKIPPED",
  providerMessageId?: string,
  error?: string,
  passthrough?: SendResult
): Promise<SendResult> {
  await db.notificationLog.create({
    data: { userId, reminderId: reminderId ?? undefined, channel, status, providerMessageId, error },
  });
  return passthrough ?? { ok: status === "SENT", providerMessageId, error, skipped: status === "SKIPPED" };
}
