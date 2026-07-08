import { db } from "./db";
import type { Plan } from "@prisma/client";

/** Fonctionnalités soumises au plan. */
export type Feature =
  | "documents"
  | "sms"
  | "whatsapp"
  | "advancedIntegrations"
  | "advancedEmail";

const PLUS_ONLY: Feature[] = ["documents", "sms", "whatsapp", "advancedIntegrations", "advancedEmail"];

export function planAllows(plan: Plan, feature: Feature): boolean {
  if (plan === "PLUS") return true;
  return !PLUS_ONLY.includes(feature);
}

/** Déduit le plan d'un objet abonnement déjà chargé (aucune requête). */
export function planFromSubscription(sub: { status: string; plan: Plan } | null | undefined): Plan {
  if (!sub) return "ESSENTIEL";
  if (!["TRIALING", "ACTIVE", "PAST_DUE"].includes(sub.status)) return "ESSENTIEL";
  return sub.plan;
}

/** Renvoie le plan effectif d'un utilisateur (par défaut ESSENTIEL). */
export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return planFromSubscription(sub);
}

export class PlanError extends Error {
  feature: Feature;
  constructor(feature: Feature) {
    super(`Fonctionnalité réservée à Soonly Plus : ${feature}`);
    this.feature = feature;
    this.name = "PlanError";
  }
}

/** Lève une PlanError si l'utilisateur n'a pas le droit d'utiliser la fonctionnalité. */
export async function assertFeature(userId: string, feature: Feature): Promise<void> {
  const plan = await getUserPlan(userId);
  if (!planAllows(plan, feature)) throw new PlanError(feature);
}
