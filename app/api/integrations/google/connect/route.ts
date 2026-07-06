import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { featureConfigured } from "@/lib/env";
import { buildAuthUrl } from "@/lib/integrations/google-calendar";
import { signState } from "@/lib/oauth-state";

/** GET /api/integrations/google/connect — redirige vers le consentement Google. */
export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  if (!featureConfigured.googleCalendar()) {
    return NextResponse.redirect(new URL("/integrations?error=google_not_configured", process.env.NEXT_PUBLIC_APP_URL));
  }
  return NextResponse.redirect(buildAuthUrl(signState(user.id)));
}
