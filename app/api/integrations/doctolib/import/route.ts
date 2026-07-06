import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok } from "@/lib/api";
import { detectHealthEventsFromCalendar, MANUAL_HEALTH_TEMPLATE } from "@/lib/integrations/doctolib";
import { z } from "zod";

/**
 * Doctolib — sans scraping.
 *   GET  : liste les rendez-vous santé détectés dans les agendas déjà connectés.
 *   POST : protège un rendez-vous détecté (crée un rappel), ou l'ajout manuel.
 */
export async function GET() {
  return route(async () => {
    const user = await requireUser();
    const events = await detectHealthEventsFromCalendar(user.id);
    return ok({ candidates: events, manualTemplate: MANUAL_HEALTH_TEMPLATE });
  });
}

const bodySchema = z.object({
  externalEventId: z.string().optional(),
  title: z.string().min(1).max(140).optional(),
  dueAt: z.coerce.date().optional(),
  rules: z.array(z.number().int().min(0).max(365)).default([7, 1]),
});

export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const body = bodySchema.parse(await req.json());

    let title = body.title ?? MANUAL_HEALTH_TEMPLATE.title;
    let dueAt = body.dueAt;
    let externalSourceId: string | undefined;

    if (body.externalEventId) {
      const ev = await db.externalEvent.findFirst({ where: { id: body.externalEventId, userId: user.id } });
      if (ev) {
        title = ev.title;
        dueAt = ev.startsAt;
        externalSourceId = ev.externalId;
      }
    }
    if (!dueAt) dueAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        title,
        category: "SANTE",
        dueAt,
        source: "DOCTOLIB",
        externalSourceId,
        rules: { create: body.rules.map((d) => ({ offsetValue: d, offsetUnit: "DAY" as const, channel: "EMAIL" as const })) },
      },
    });

    if (body.externalEventId) {
      await db.externalEvent.update({ where: { id: body.externalEventId }, data: { importedReminderId: reminder.id } });
    }
    return ok({ reminder });
  });
}
