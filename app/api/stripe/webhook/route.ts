import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { env, featureConfigured } from "@/lib/env";
import { stripe, planForPriceId } from "@/lib/stripe";
import type { SubscriptionStatus } from "@prisma/client";

export const runtime = "nodejs";

/** Corps brut requis pour vérifier la signature Stripe. */
const STATUS_MAP: Record<string, SubscriptionStatus> = {
  trialing: "TRIALING", active: "ACTIVE", past_due: "PAST_DUE",
  canceled: "CANCELED", incomplete: "INCOMPLETE", incomplete_expired: "INCOMPLETE", unpaid: "UNPAID",
};

export async function POST(req: NextRequest) {
  if (!featureConfigured.stripe() || !featureConfigured.stripeWebhook()) {
    return NextResponse.json({ error: "Webhook Stripe non configuré." }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signature absente." }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    return NextResponse.json({ error: `Signature invalide: ${(e as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription && s.customer) {
          const subscription = await stripe().subscriptions.retrieve(s.subscription as string);
          await upsertFromSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const priceId = sub.items.data[0]?.price?.id;
  const plan = planForPriceId(priceId) ?? "ESSENTIEL";
  const status = STATUS_MAP[sub.status] ?? "INCOMPLETE";
  const record = await db.subscription.findFirst({ where: { stripeCustomerId: customerId } });
  const userId = record?.userId ?? (sub.metadata?.userId as string | undefined);
  if (!userId) return;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId, plan, status, stripeCustomerId: customerId, stripeSubscriptionId: sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      plan, status, stripeSubscriptionId: sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}
