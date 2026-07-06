import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { env, featureConfigured } from "@/lib/env";
import { hashCode, randomOtp } from "@/lib/encryption";
import { phoneStartSchema } from "@/lib/validations";
import { route, ok, ApiError } from "@/lib/api";

/**
 * POST /api/auth/phone — génère un code OTP et l'envoie par SMS.
 * La vérification effective se fait via le provider Auth.js « phone »
 * (signIn("phone", { phone, code })). Ici on ne fait qu'émettre le code.
 */
export async function POST(req: NextRequest) {
  return route(async () => {
    const { phone } = phoneStartSchema.parse(await req.json());
    const code = randomOtp();
    await db.phoneOtp.create({
      data: { phone, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 10 * 60_000) },
    });

    if (featureConfigured.sms()) {
      const twilio = (await import("twilio")).default;
      const client = twilio(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!);
      await client.messages.create({
        from: env.TWILIO_PHONE_NUMBER,
        to: phone,
        body: `Votre code Soonly : ${code}. Valable 10 minutes.`,
      });
      return ok({ sent: true });
    }

    // SMS non configuré : en développement, on renvoie le code pour tester le flux.
    if (env.NODE_ENV !== "production") return ok({ sent: false, devCode: code });
    throw new ApiError(503, "L'envoi de SMS n'est pas configuré.");
  });
}
