import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";
import { planFromSubscription } from "./permissions";
import { zoneFor, daysUntil } from "./dates";
import type { Reminder, ReminderRule, Document, User, Plan } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import type { ClientReminder } from "@/types";

export type SessionUser = { user: User; plan: Plan; trialDaysLeft: number | null };

/** Récupère l'utilisateur connecté (redirige vers /login sinon) + son plan. */
export async function getSessionUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } });
  if (!user) redirect("/login");
  const plan = planFromSubscription(user.subscription);
  let trialDaysLeft: number | null = null;
  if (user.subscription?.status === "TRIALING" && user.subscription.currentPeriodEnd) {
    trialDaysLeft = Math.max(0, differenceInCalendarDays(user.subscription.currentPeriodEnd, new Date()));
  }
  return { user, plan, trialDaysLeft };
}

export type ReminderWithRules = Reminder & { rules: ReminderRule[]; document: Document | null };

export async function getActiveReminders(userId: string): Promise<ReminderWithRules[]> {
  return db.reminder.findMany({
    where: { userId, status: "ACTIVE" },
    include: { rules: true, document: true },
    orderBy: { dueAt: "asc" },
  });
}

export type Dashboard = {
  reminders: ReminderWithRules[];
  zones: Record<"late" | "today" | "week" | "month" | "later", ReminderWithRules[]>;
  score: number;
  tips: Array<{ points: number; text: string }>;
  stats: { protected: number; urgent: number; docsToCheck: number };
  nextFire: { title: string; at: Date } | null;
};

export async function getDashboard(userId: string): Promise<Dashboard> {
  // Requêtes indépendantes lancées en parallèle (1 aller-retour au lieu de 3).
  const [reminders, documents, user] = await Promise.all([
    getActiveReminders(userId),
    db.document.findMany({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, select: { phoneVerifiedAt: true } }),
  ]);

  const zones: Dashboard["zones"] = { late: [], today: [], week: [], month: [], later: [] };
  for (const r of reminders) zones[zoneFor(r.dueAt)].push(r);

  // Score de tranquillité (rassurant, jamais anxiogène).
  let score = 100;
  const tips: Dashboard["tips"] = [];
  const noRule = reminders.filter((r) => r.rules.length === 0);
  if (noRule.length) { score -= 2 * noRule.length; tips.push({ points: 2 * noRule.length, text: `Ajouter un rappel à « ${noRule[0].title} »` }); }
  const expired = documents.filter((d) => d.expirationDate && daysUntil(d.expirationDate) < 0);
  if (expired.length) { score -= 2 * expired.length; tips.push({ points: 2 * expired.length, text: `Remplacer un document expiré (${expired[0].title})` }); }
  if (user && !user.phoneVerifiedAt) { score -= 4; tips.push({ points: 4, text: "Vérifier votre numéro de téléphone" }); }
  score = Math.max(0, Math.min(100, score));

  const stats = {
    protected: reminders.filter((r) => r.rules.length > 0).length,
    urgent: zones.late.length + zones.today.length + zones.week.length,
    docsToCheck: expired.length,
  };

  // Prochain tir de rappel (approximation : échéance la plus proche avec règle).
  const withRule = reminders.filter((r) => r.rules.length > 0);
  const nextFire = withRule.length ? { title: withRule[0].title, at: withRule[0].dueAt } : null;

  return { reminders, zones, score, tips, stats, nextFire };
}

export function toClient(r: ReminderWithRules): ClientReminder {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    dueAt: r.dueAt.toISOString(),
    allDay: r.allDay,
    recurrence: r.recurrence,
    hasDocument: !!r.document,
    status: r.status,
    rules: r.rules.map((x) => ({ offsetValue: x.offsetValue, offsetUnit: x.offsetUnit, channel: x.channel })),
  };
}
