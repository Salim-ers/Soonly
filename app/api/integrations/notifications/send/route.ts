import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok } from "@/lib/api";
import { pushSubscribeSchema } from "@/lib/validations";

/**
 * POST /api/integrations/notifications/send
 * Enregistre l'abonnement Web Push de l'appareil courant (PWA).
 */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const sub = pushSubscribeSchema.parse(await req.json());
    await db.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: { userId: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    await db.user.update({ where: { id: user.id }, data: { consentPush: true } });
    return ok({ subscribed: true });
  });
}
