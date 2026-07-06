import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encrypt, decrypt } from "@/lib/encryption";
import type { ConnectedAccount } from "@prisma/client";
import type { CalendarEvent } from "./google-calendar";

/**
 * Connecteur Outlook / Microsoft 365 via Microsoft Graph (OAuth 2.0).
 * Même principe que Google : tokens chiffrés, lecture d'événements,
 * import à l'initiative de l'utilisateur.
 */
const tenant = () => env.MICROSOFT_TENANT || "common";
const AUTH_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize`;
const TOKEN_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`;
const GRAPH = "https://graph.microsoft.com/v1.0";
const SCOPES = ["Calendars.Read", "offline_access", "openid", "email"];

const redirectUri = () => `${env.NEXT_PUBLIC_APP_URL}/api/integrations/microsoft/callback`;

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri(),
    response_mode: "query",
    scope: SCOPES.join(" "),
    state,
  });
  return `${AUTH_URL()}?${params.toString()}`;
}

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number; scope: string };

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID!,
      client_secret: env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      scope: SCOPES.join(" "),
    }),
  });
  if (!res.ok) throw new Error(`Microsoft token exchange ${res.status}`);
  return res.json();
}

export async function persistAccount(userId: string, tokens: TokenResponse, accountEmail?: string) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db.connectedAccount.upsert({
    where: { userId_provider: { userId, provider: "MICROSOFT_CALENDAR" } },
    create: {
      userId, provider: "MICROSOFT_CALENDAR", providerAccountId: accountEmail ?? "microsoft",
      accessTokenEncrypted: encrypt(tokens.access_token),
      refreshTokenEncrypted: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expiresAt, scopes: tokens.scope.split(" "), status: "CONNECTED",
      meta: accountEmail ? { email: accountEmail } : undefined,
    },
    update: {
      accessTokenEncrypted: encrypt(tokens.access_token),
      ...(tokens.refresh_token ? { refreshTokenEncrypted: encrypt(tokens.refresh_token) } : {}),
      expiresAt, scopes: tokens.scope.split(" "), status: "CONNECTED",
    },
  });
}

async function freshAccessToken(account: ConnectedAccount): Promise<string> {
  if (account.accessTokenEncrypted && account.expiresAt && account.expiresAt.getTime() - Date.now() > 60_000) {
    return decrypt(account.accessTokenEncrypted);
  }
  if (!account.refreshTokenEncrypted) throw new Error("Refresh token indisponible — reconnectez Outlook.");
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID!, client_secret: env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: decrypt(account.refreshTokenEncrypted), grant_type: "refresh_token", scope: SCOPES.join(" "),
    }),
  });
  if (!res.ok) {
    await db.connectedAccount.update({ where: { id: account.id }, data: { status: "EXPIRED" } });
    throw new Error("Échec du rafraîchissement du token Microsoft.");
  }
  const tokens = (await res.json()) as TokenResponse;
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db.connectedAccount.update({ where: { id: account.id }, data: { accessTokenEncrypted: encrypt(tokens.access_token), expiresAt } });
  return tokens.access_token;
}

export async function listUpcomingEvents(account: ConnectedAccount, days = 120): Promise<CalendarEvent[]> {
  const token = await freshAccessToken(account);
  const start = new Date().toISOString();
  const end = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  const url = `${GRAPH}/me/calendarView?startDateTime=${start}&endDateTime=${end}&$orderby=start/dateTime&$top=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="UTC"' } });
  if (!res.ok) throw new Error(`Graph events ${res.status}`);
  const data = (await res.json()) as { value?: Array<{ id: string; subject?: string; location?: { displayName?: string }; start: { dateTime: string }; end?: { dateTime: string } }> };
  return (data.value ?? []).map((e) => ({
    id: e.id, title: e.subject ?? "(Sans titre)",
    start: new Date(e.start.dateTime + "Z"), end: e.end ? new Date(e.end.dateTime + "Z") : undefined,
    location: e.location?.displayName,
  }));
}

export async function syncEvents(account: ConnectedAccount): Promise<number> {
  const events = await listUpcomingEvents(account);
  for (const ev of events) {
    await db.externalEvent.upsert({
      where: { userId_provider_externalId: { userId: account.userId, provider: "MICROSOFT_CALENDAR", externalId: ev.id } },
      create: { userId: account.userId, provider: "MICROSOFT_CALENDAR", externalId: ev.id, title: ev.title, startsAt: ev.start, endsAt: ev.end, location: ev.location },
      update: { title: ev.title, startsAt: ev.start, endsAt: ev.end, location: ev.location },
    });
  }
  await db.connectedAccount.update({ where: { id: account.id }, data: { lastSyncedAt: new Date() } });
  return events.length;
}
