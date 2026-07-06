import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { route, requireUser, ApiError } from "@/lib/api";
import { NextResponse } from "next/server";

/** POST /api/stripe/portal — ouvre le portail client Stripe (gérer/résilier). */
export async function POST() {
  return route(async () => {
    const user = await requireUser();
    const sub = await db.subscription.findUnique({ where: { userId: user.id } });
    if (!sub?.stripeCustomerId) throw new ApiError(400, "Aucun abonnement à gérer.");
    const session = await stripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return NextResponse.json({ url: session.url });
  });
}
