import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyState } from "@/lib/oauth-state";
import { exchangeCode, persistAccount } from "@/lib/integrations/google-calendar";

/** GET /api/integrations/google/callback — échange le code et stocke les tokens chiffrés. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const back = (q: string) => NextResponse.redirect(new URL(`/integrations?${q}`, env.NEXT_PUBLIC_APP_URL));

  if (!code || !state) return back("error=missing_params");
  const userId = verifyState(state);
  if (!userId) return back("error=invalid_state");

  try {
    const tokens = await exchangeCode(code);
    // Récupère l'email du compte via l'id_token (best-effort).
    let email: string | undefined;
    if (tokens.id_token) {
      const [, payload] = tokens.id_token.split(".");
      email = JSON.parse(Buffer.from(payload, "base64url").toString()).email;
    }
    await persistAccount(userId, tokens, email);
    return back("connected=google");
  } catch (e) {
    console.error("[google callback]", e);
    return back("error=google_exchange");
  }
}
