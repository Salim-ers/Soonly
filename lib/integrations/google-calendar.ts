import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encrypt, decrypt } from "@/lib/encryption";
import type { ConnectedAccount, Reminder } from "@prisma/client";

/**
 * Connecteur Google Agenda — implémentation de référence.
 *
 * Flux OAuth 2.0 (Authorization Code) :
 *   connect → Google → callback (échange code↔tokens) → tokens chiffrés en base.
 * Les tokens ne sont JAMAIS renvoyés au client. Le refresh token permet de
 * rafraîchir l'access token expiré côté serveur.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.app.created",
  "openid",
  "email",
];

function redirectUri() {
  return `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;
}

/** URL de consentement Google (state = anti-CSRF signé côté appelant). */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CALENDAR_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: SCOPES.join(" "),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  id_token?: string;
};

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CALENDAR_CLIENT_ID!,
      client_secret: env.GOOGLE_CALENDAR_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange ${res.status}`);
  return res.json();
}

/** Persiste (ou met à jour) le compte connecté avec tokens chiffrés. */
export async function persistAccount(userId: string, tokens: TokenResponse, accountEmail?: string) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db.connectedAccount.upsert({
    where: { userId_provider: { userId, provider: "GOOGLE_CALENDAR" } },
    create: {
      userId,
      provider: "GOOGLE_CALENDAR",
      providerAccountId: accountEmail ?? "google",
      accessTokenEncrypted: encrypt(tokens.access_token),
      refreshTokenEncrypted: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expiresAt,
      scopes: tokens.scope.split(" "),
      status: "CONNECTED",
      meta: accountEmail ? { email: accountEmail } : undefined,
    },
    update: {
      accessTokenEncrypted: encrypt(tokens.access_token),
      ...(tokens.refresh_token ? { refreshTokenEncrypted: encrypt(tokens.refresh_token) } : {}),
      expiresAt,
      scopes: tokens.scope.split(" "),
      status: "CONNECTED",
    },
  });
}

/** Renvoie un access token valide, en le rafraîchissant si nécessaire. */
async function freshAccessToken(account: ConnectedAccount): Promise<string> {
  if (account.accessTokenEncrypted && account.expiresAt && account.expiresAt.getTime() - Date.now() > 60_000) {
    return decrypt(account.accessTokenEncrypted);
  }
  if (!account.refreshTokenEncrypted) throw new Error("Refresh token indisponible — reconnectez Google Agenda.");
  const refresh = decrypt(account.refreshTokenEncrypted);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CALENDAR_CLIENT_ID!,
      client_secret: env.GOOGLE_CALENDAR_CLIENT_SECRET!,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    await db.connectedAccount.update({ where: { id: account.id }, data: { status: "EXPIRED" } });
    throw new Error("Échec du rafraîchissement du token Google.");
  }
  const tokens = (await res.json()) as TokenResponse;
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db.connectedAccount.update({
    where: { id: account.id },
    data: { accessTokenEncrypted: encrypt(tokens.access_token), expiresAt, status: "CONNECTED" },
  });
  return tokens.access_token;
}

export type CalendarEvent = { id: string; title: string; start: Date; end?: Date; location?: string };

/** Liste les prochains événements (fenêtre par défaut : 120 jours). */
export async function listUpcomingEvents(account: ConnectedAccount, days = 120): Promise<CalendarEvent[]> {
  const token = await freshAccessToken(account);
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  const url = `${API}/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
    timeMin
  )}&timeMax=${encodeURIComponent(timeMax)}&maxResults=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Google events ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{ id: string; summary?: string; location?: string; start?: { date?: string; dateTime?: string }; end?: { date?: string; dateTime?: string } }>;
  };
  return (data.items ?? [])
    .filter((e) => e.start?.date || e.start?.dateTime)
    .map((e) => ({
      id: e.id,
      title: e.summary ?? "(Sans titre)",
      start: new Date(e.start!.dateTime ?? e.start!.date!),
      end: e.end?.dateTime || e.end?.date ? new Date(e.end!.dateTime ?? e.end!.date!) : undefined,
      location: e.location,
    }));
}

/**
 * Synchronise : enregistre les événements comme ExternalEvent (candidats),
 * sans créer de rappel automatiquement. L'utilisateur importe ensuite ceux
 * qu'il veut depuis la page Intégrations.
 */
export async function syncEvents(account: ConnectedAccount): Promise<number> {
  const events = await listUpcomingEvents(account);
  let count = 0;
  for (const ev of events) {
    await db.externalEvent.upsert({
      where: { userId_provider_externalId: { userId: account.userId, provider: "GOOGLE_CALENDAR", externalId: ev.id } },
      create: {
        userId: account.userId,
        provider: "GOOGLE_CALENDAR",
        externalId: ev.id,
        title: ev.title,
        startsAt: ev.start,
        endsAt: ev.end,
        location: ev.location,
      },
      update: { title: ev.title, startsAt: ev.start, endsAt: ev.end, location: ev.location },
    });
    count++;
  }
  await db.connectedAccount.update({ where: { id: account.id }, data: { lastSyncedAt: new Date() } });
  return count;
}

/** Crée (une fois) l'agenda « Soonly » et retourne son id, mémorisé dans meta. */
export async function ensureSoonlyCalendar(account: ConnectedAccount): Promise<string> {
  const meta = (account.meta as { soonlyCalendarId?: string } | null) ?? {};
  if (meta.soonlyCalendarId) return meta.soonlyCalendarId;
  const token = await freshAccessToken(account);
  const res = await fetch(`${API}/calendars`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ summary: "Soonly", description: "Rappels protégés par Soonly" }),
  });
  if (!res.ok) throw new Error(`Création agenda Soonly ${res.status}`);
  const cal = (await res.json()) as { id: string };
  await db.connectedAccount.update({
    where: { id: account.id },
    data: { meta: { ...meta, soonlyCalendarId: cal.id } },
  });
  return cal.id;
}

/** Pousse un rappel Soonly vers l'agenda Soonly de l'utilisateur (opt-in). */
export async function pushReminder(account: ConnectedAccount, reminder: Reminder): Promise<void> {
  const calendarId = await ensureSoonlyCalendar(account);
  const token = await freshAccessToken(account);
  const start = reminder.dueAt.toISOString();
  const end = new Date(reminder.dueAt.getTime() + 30 * 60_000).toISOString();
  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: reminder.title,
      description: reminder.description ?? "Rappel Soonly",
      start: reminder.allDay ? { date: start.slice(0, 10) } : { dateTime: start },
      end: reminder.allDay ? { date: end.slice(0, 10) } : { dateTime: end },
    }),
  });
  if (!res.ok) throw new Error(`Push agenda Soonly ${res.status}`);
}
