import Stripe from "stripe";
import { env, featureConfigured } from "./env";
import type { Plan } from "@prisma/client";

let _stripe: Stripe | null = null;

/** Instance Stripe (lève si la clé n'est pas configurée). */
export function stripe(): Stripe {
  if (!featureConfigured.stripe()) {
    throw new Error("Stripe non configuré (STRIPE_SECRET_KEY / STRIPE_PRICE_ESSENTIEL / STRIPE_PRICE_PLUS).");
  }
  if (!_stripe) _stripe = new Stripe(env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });
  return _stripe;
}

export const PRICE_BY_PLAN: Record<Plan, string | undefined> = {
  ESSENTIEL: env.STRIPE_PRICE_ESSENTIEL,
  PLUS: env.STRIPE_PRICE_PLUS,
};

export function planForPriceId(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === env.STRIPE_PRICE_PLUS) return "PLUS";
  if (priceId === env.STRIPE_PRICE_ESSENTIEL) return "ESSENTIEL";
  return null;
}

export const PLAN_LABELS: Record<Plan, string> = {
  ESSENTIEL: "Soonly Essentiel",
  PLUS: "Soonly Plus",
};
