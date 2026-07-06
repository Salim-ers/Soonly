import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe, PRICE_BY_PLAN } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";
import { route, requireUser, ApiError } from "@/lib/api";
import { NextResponse } from "next/server";

/** POST /api/stripe/checkout — crée une session Checkout (essai 7 jours). */
export async function POST(req: NextRequest) {
  return route(async () => {
    const user = await requireUser();
    const { plan } = checkoutSchema.parse(await req.json());
    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId) throw new ApiError(503, "Tarification Stripe non configurée.");

    let sub = await db.subscription.findUnique({ where: { userId: user.id } });
    let customerId = sub?.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      sub = await db.subscription.upsert({
        where: { userId: user.id },
        create: { userId: user.id, plan, status: "INCOMPLETE", stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7, metadata: { userId: user.id, plan } },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  });
}
