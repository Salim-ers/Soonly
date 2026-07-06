import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildCalendar } from "@/lib/integrations/ics";
import { subscribeToken } from "@/lib/integrations/apple-calendar";

/**
 * GET /api/integrations/apple/ics?u=<userId>&t=<token>
 * Flux ICS lecture seule, authentifié par un jeton opaque propre à l'utilisateur.
 * Consommé par Apple Calendar / Google Agenda en abonnement webcal.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("u");
  const token = url.searchParams.get("t");
  if (!userId || !token || token !== subscribeToken(userId)) {
    return new NextResponse("Accès refusé.", { status: 403 });
  }
  const reminders = await db.reminder.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { dueAt: "asc" },
    take: 500,
  });
  const ics = buildCalendar(reminders, "Soonly");
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="soonly.ics"',
      "Cache-Control": "private, max-age=900",
    },
  });
}
