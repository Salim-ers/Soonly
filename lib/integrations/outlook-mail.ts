import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { ConnectedAccount } from "@prisma/client";
import type { MailCandidate } from "./gmail";

/**
 * Connecteur Outlook Mail (Microsoft Graph, lecture seule, consentement explicite).
 * Même philosophie que Gmail : recherche ciblée + validation manuelle.
 */
const GRAPH = "https://graph.microsoft.com/v1.0/me/messages";

const QUERIES: Array<{ label: string; search: string }> = [
  { label: "Fins d'essai gratuit", search: "essai OR trial" },
  { label: "Confirmations de rendez-vous", search: "rendez-vous OR confirmation OR appointment" },
  { label: "Factures & échéances", search: "facture OR échéance OR invoice" },
  { label: "Abonnements", search: "abonnement OR renouvellement OR subscription" },
];

async function accessToken(account: ConnectedAccount): Promise<string> {
  if (!account.accessTokenEncrypted) throw new Error("Compte Outlook Mail non connecté.");
  return decrypt(account.accessTokenEncrypted);
}

export async function findCandidates(account: ConnectedAccount, max = 20): Promise<MailCandidate[]> {
  const token = await accessToken(account);
  const out: MailCandidate[] = [];
  for (const { label, search } of QUERIES) {
    const url = `${GRAPH}?$search="${encodeURIComponent(search)}"&$top=5&$select=id,subject,from,receivedDateTime,bodyPreview`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: "eventual" } });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      value?: Array<{ id: string; subject?: string; bodyPreview?: string; receivedDateTime?: string; from?: { emailAddress?: { address?: string } } }>;
    };
    for (const m of data.value ?? []) {
      out.push({
        externalId: m.id,
        from: m.from?.emailAddress?.address ?? "",
        subject: m.subject ?? "",
        date: new Date(m.receivedDateTime ?? Date.now()),
        snippet: m.bodyPreview ?? "",
        category: label,
      });
      if (out.length >= max) break;
    }
  }
  await db.connectedAccount.update({ where: { id: account.id }, data: { lastSyncedAt: new Date() } });
  return out;
}
