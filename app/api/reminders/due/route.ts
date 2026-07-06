import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { collectDueRules, markFired, advanceIfRecurring } from "@/lib/reminders";
import { dispatch } from "@/lib/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/reminders/due — appelé par Vercel Cron (voir vercel.json).
 * Protégé par CRON_SECRET (header Authorization: Bearer <secret>).
 * Parcourt les rappels dont l'heure de tir tombe dans la fenêtre et envoie.
 */
export async function GET(req: NextRequest) {
  if (env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  }

  const due = await collectDueRules(new Date(), 30);
  const userCache = new Map<string, Awaited<ReturnType<typeof db.user.findUnique>>>();
  let sent = 0, skipped = 0, failed = 0;

  for (const item of due) {
    let user = userCache.get(item.reminder.userId);
    if (user === undefined) {
      user = await db.user.findUnique({ where: { id: item.reminder.userId } });
      userCache.set(item.reminder.userId, user);
    }
    if (!user) continue;

    const res = await dispatch(user, item.reminder, item.rule);
    if (res.ok) sent++;
    else if (res.skipped) skipped++;
    else failed++;

    await markFired(item.rule.id, item.occurrenceAt);
  }

  // Fait avancer les échéances récurrentes déjà passées.
  const passedRecurring = await db.reminder.findMany({
    where: { status: "ACTIVE", recurrence: { not: "NONE" }, dueAt: { lt: new Date() } },
  });
  for (const r of passedRecurring) await advanceIfRecurring(r);

  return NextResponse.json({ processed: due.length, sent, skipped, failed });
}
