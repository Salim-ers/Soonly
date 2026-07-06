import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { featureConfigured } from "@/lib/env";
import { buildAuthUrl } from "@/lib/integrations/microsoft-calendar";
import { signState } from "@/lib/oauth-state";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  if (!featureConfigured.microsoftCalendar()) {
    return NextResponse.redirect(new URL("/integrations?error=microsoft_not_configured", process.env.NEXT_PUBLIC_APP_URL));
  }
  return NextResponse.redirect(buildAuthUrl(signState(user.id)));
}
