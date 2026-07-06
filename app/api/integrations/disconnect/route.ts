import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, requireUser, ok } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["GOOGLE_CALENDAR", "MICROSOFT_CALENDAR", "GMAIL", "OUTLOOK_MAIL"]),
});

/**
 * POST /api/integrations/disconnect
 * Supprime le compte connecté et les événements importés associés.
 * (La révocation côté fournisseur reste possible depuis leurs consoles.)
 */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const { provider } = schema.parse(await req.json());
    // Gmail/Outlook mail partagent l'auth Google/Microsoft ; on cible le calendrier correspondant.
    const target = provider === "GMAIL" ? "GOOGLE_CALENDAR" : provider === "OUTLOOK_MAIL" ? "MICROSOFT_CALENDAR" : provider;
    await db.connectedAccount.deleteMany({ where: { userId: user.id, provider: target } });
    await db.externalEvent.deleteMany({ where: { userId: user.id, provider: target } });
    return ok({ disconnected: provider });
  });
}
