import { env } from "@/lib/env";

/**
 * Apple Calendar / iPhone.
 *
 * Important : une application web Next.js ne peut PAS accéder directement à
 * l'agenda d'un iPhone (cela nécessite une app native iOS et EventKit).
 * Soonly ne prétend donc jamais lire l'agenda iOS depuis le navigateur.
 *
 * À la place :
 *   - Soonly publie un flux ICS « Soonly » en lecture seule (voir /api/integrations/apple/ics) ;
 *   - l'utilisateur s'y abonne via une URL webcal:// (Réglages iOS › Calendrier) ;
 *   - ses rappels Soonly apparaissent alors dans l'app Calendrier, toujours à jour.
 *
 * Une future app iOS native pourra ajouter une couche EventKit pour un accès
 * bidirectionnel ; l'architecture (ExternalEvent, source APPLE_ICS) est déjà prête.
 */

/** Jeton d'abonnement opaque, propre à l'utilisateur (non devinable). */
export function subscribeToken(userId: string): string {
  // Dérivé de l'id + secret serveur, tronqué. Régénérable si compromis.
  const crypto = require("node:crypto") as typeof import("node:crypto");
  return crypto.createHash("sha256").update(userId + (env.AUTH_SECRET ?? "")).digest("hex").slice(0, 40);
}

export function icsFeedUrl(userId: string): string {
  const token = subscribeToken(userId);
  return `${env.NEXT_PUBLIC_APP_URL}/api/integrations/apple/ics?u=${userId}&t=${token}`;
}

/** URL webcal:// — ouvre directement la boîte de dialogue d'abonnement sur iOS/macOS. */
export function webcalUrl(userId: string): string {
  return icsFeedUrl(userId).replace(/^https?:/, "webcal:");
}
