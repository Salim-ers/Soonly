import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyState } from "@/lib/oauth-state";
import { exchangeCode, persistAccount } from "@/lib/integrations/microsoft-calendar";

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
    await persistAccount(userId, tokens);
    return back("connected=microsoft");
  } catch (e) {
    console.error("[microsoft callback]", e);
    return back("error=microsoft_exchange");
  }
}
