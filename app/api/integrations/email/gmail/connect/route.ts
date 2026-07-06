import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { env, featureConfigured } from "@/lib/env";
import { signState } from "@/lib/oauth-state";

/**
 * GET /api/integrations/email/gmail/connect
 * Réutilise l'OAuth Google avec le scope gmail.readonly ajouté.
 * (Le callback Google gère l'échange ; le scope mail est inclus ici.)
 */
export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.redirect(new URL("/login", env.NEXT_PUBLIC_APP_URL));
  if (!featureConfigured.googleCalendar()) {
    return NextResponse.redirect(new URL("/integrations?error=gmail_not_configured", env.NEXT_PUBLIC_APP_URL));
  }
  const redirect = `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CALENDAR_CLIENT_ID!,
    redirect_uri: redirect,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/gmail.readonly openid email",
    state: signState(user.id),
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
