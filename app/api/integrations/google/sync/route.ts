import { db } from "@/lib/db";
import { route, requireUser, ok, ApiError } from "@/lib/api";
import { syncEvents } from "@/lib/integrations/google-calendar";

/** POST /api/integrations/google/sync — importe les événements comme candidats. */
export async function POST() {
  return route(async () => {
    const user = await requireUser();
    const account = await db.connectedAccount.findUnique({
      where: { userId_provider: { userId: user.id, provider: "GOOGLE_CALENDAR" } },
    });
    if (!account) throw new ApiError(400, "Google Agenda n'est pas connecté.");
    const count = await syncEvents(account);
    return ok({ synced: count });
  });
}
