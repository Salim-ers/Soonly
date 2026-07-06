import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { env, featureConfigured } from "@/lib/env";
import { signState } from "@/lib/oauth-state";

/** GET /api/integrations/email/outlook/connect — OAuth Microsoft avec scope Mail.Read. */
export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.redirect(new URL("/login", env.NEXT_PUBLIC_APP_URL));
  if (!featureConfigured.microsoftCalendar()) {
    return NextResponse.redirect(new URL("/integrations?error=outlook_not_configured", env.NEXT_PUBLIC_APP_URL));
  }
  const tenant = env.MICROSOFT_TENANT || "common";
  const params = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/integrations/microsoft/callback`,
    scope: "Mail.Read offline_access openid email",
    state: signState(user.id),
  });
  return NextResponse.redirect(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`);
}
