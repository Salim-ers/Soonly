import { route, requireUser, ok } from "@/lib/api";
import { icsFeedUrl, webcalUrl } from "@/lib/integrations/apple-calendar";

/** GET /api/integrations/apple/subscribe — renvoie les URLs d'abonnement de l'utilisateur. */
export async function GET() {
  return route(async () => {
    const user = await requireUser();
    return ok({ httpsUrl: icsFeedUrl(user.id), webcalUrl: webcalUrl(user.id) });
  });
}
