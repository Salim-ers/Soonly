import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { dispatch } from "@/lib/notifications";
import { channelEnum } from "@/lib/validations";
import { z } from "zod";

/**
 * POST /api/integrations/notifications/test
 * Envoie un rappel de test sur le canal demandé (respecte consentement + plan).
 */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const { channel } = z.object({ channel: channelEnum }).parse(await req.json());

    // Rappel factice non persisté durablement : on crée un rappel « test » éphémère.
    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        title: "Test de notification Soonly",
        category: "AUTRE",
        dueAt: new Date(Date.now() + 24 * 3600 * 1000),
        status: "ARCHIVED",
        source: "MANUAL",
      },
    });

    const res = await dispatch(user, reminder, {
      id: "test", reminderId: reminder.id, offsetValue: 1, offsetUnit: "DAY",
      channel, enabled: true, lastFiredFor: null,
    });

    await db.reminder.delete({ where: { id: reminder.id } }).catch(() => {});
    if (res.skipped) throw new ApiError(400, res.error ?? "Canal indisponible.");
    if (!res.ok) throw new ApiError(502, res.error ?? "Échec d'envoi.");
    return ok({ sent: true });
  });
}
