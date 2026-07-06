import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { ConnectedAccount } from "@prisma/client";

/**
 * Connecteur Gmail (lecture seule, consentement explicite).
 *
 * Soonly ne lit JAMAIS toute la boîte : il interroge Gmail avec des requêtes
 * ciblées sur des échéances probables (confirmations, factures, fins d'essai),
 * puis renvoie des *candidats* que l'utilisateur valide un par un avant qu'un
 * rappel ne soit créé. Rien n'est importé automatiquement.
 *
 * (L'OAuth Gmail réutilise la brique Google ; le scope gmail.readonly est
 * demandé séparément lors de la connexion de la boîte.)
 */

const API = "https://gmail.googleapis.com/gmail/v1/users/me";

/** Requêtes Gmail ciblant les emails porteurs d'échéances. */
export const CANDIDATE_QUERIES: Array<{ label: string; q: string }> = [
  { label: "Fins d'essai gratuit", q: 'subject:(essai OR trial OR "free trial") newer_than:1y' },
  { label: "Confirmations de rendez-vous", q: 'subject:(rendez-vous OR "rdv" OR confirmation OR appointment) newer_than:6m' },
  { label: "Factures & échéances", q: 'subject:(facture OR échéance OR "à régler" OR invoice) newer_than:1y' },
  { label: "Abonnements", q: 'subject:(abonnement OR renouvellement OR "renew" OR subscription) newer_than:1y' },
  { label: "Assurances & contrats", q: 'subject:(assurance OR contrat OR attestation OR garantie) newer_than:1y' },
];

async function accessToken(account: ConnectedAccount): Promise<string> {
  if (!account.accessTokenEncrypted) throw new Error("Compte Gmail non connecté.");
  // Le rafraîchissement partage la logique de google-calendar ; ici on suppose un token valide,
  // sinon l'appel renverra 401 et l'utilisateur sera invité à reconnecter.
  return decrypt(account.accessTokenEncrypted);
}

export type MailCandidate = {
  externalId: string;
  from: string;
  subject: string;
  date: Date;
  snippet: string;
  category: string;
};

/** Renvoie une liste de candidats (emails susceptibles de cacher une échéance). */
export async function findCandidates(account: ConnectedAccount, max = 20): Promise<MailCandidate[]> {
  const token = await accessToken(account);
  const out: MailCandidate[] = [];

  for (const { label, q } of CANDIDATE_QUERIES) {
    const listRes = await fetch(`${API}/messages?maxResults=5&q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!listRes.ok) continue;
    const list = (await listRes.json()) as { messages?: Array<{ id: string }> };
    for (const m of list.messages ?? []) {
      const msgRes = await fetch(`${API}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!msgRes.ok) continue;
      const msg = (await msgRes.json()) as {
        id: string; snippet?: string; internalDate?: string;
        payload?: { headers?: Array<{ name: string; value: string }> };
      };
      const h = (n: string) => msg.payload?.headers?.find((x) => x.name === n)?.value ?? "";
      out.push({
        externalId: msg.id,
        from: h("From"),
        subject: h("Subject"),
        date: new Date(Number(msg.internalDate ?? Date.now())),
        snippet: msg.snippet ?? "",
        category: label,
      });
      if (out.length >= max) return out;
    }
  }
  await db.connectedAccount.update({ where: { id: account.id }, data: { lastSyncedAt: new Date() } });
  return out;
}
