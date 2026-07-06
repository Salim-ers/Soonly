import type { Reminder } from "@prisma/client";

/**
 * Génération d'un flux ICS (RFC 5545) — utilisé pour :
 *   - le calendrier « Soonly » abonnable (webcal) sur Apple Calendar / iPhone ;
 *   - les liens « Ajouter à mon agenda » ;
 *   - l'import d'un fichier .ics.
 * Aucune dépendance externe : le format est simple et stable.
 */

function fold(line: string): string {
  // RFC 5545 : lignes repliées à 75 octets.
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let s = line;
  while (s.length > 73) {
    chunks.push(s.slice(0, 73));
    s = " " + s.slice(73);
  }
  chunks.push(s);
  return chunks.join("\r\n");
}

function escapeText(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDate(d: Date, allDay: boolean): string {
  if (allDay) return d.toISOString().slice(0, 10).replace(/-/g, "");
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

const RECUR: Record<string, string | null> = {
  NONE: null, WEEKLY: "FREQ=WEEKLY", MONTHLY: "FREQ=MONTHLY", YEARLY: "FREQ=YEARLY",
};

export function reminderToVEvent(r: Reminder, domain = "soonly.app"): string {
  const dtstamp = toIcsDate(new Date(), false);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${r.id}@${domain}`,
    `DTSTAMP:${dtstamp}`,
    r.allDay
      ? `DTSTART;VALUE=DATE:${toIcsDate(r.dueAt, true)}`
      : `DTSTART:${toIcsDate(r.dueAt, false)}`,
    `SUMMARY:${escapeText(r.title)}`,
    r.description ? `DESCRIPTION:${escapeText(r.description)}` : null,
    RECUR[r.recurrence] ? `RRULE:${RECUR[r.recurrence]}` : null,
    "END:VEVENT",
  ].filter(Boolean) as string[];
  return lines.map(fold).join("\r\n");
}

export function buildCalendar(reminders: Reminder[], name = "Soonly"): string {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Soonly//Rappels//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-WR-TIMEZONE:Europe/Paris",
  ].map(fold).join("\r\n");
  const body = reminders.map((r) => reminderToVEvent(r)).join("\r\n");
  return [header, body, "END:VCALENDAR"].join("\r\n") + "\r\n";
}

/** Lien « Ajouter à Google Agenda » pour un rappel donné. */
export function googleAddLink(r: Reminder): string {
  const start = toIcsDate(r.dueAt, r.allDay);
  const end = toIcsDate(new Date(r.dueAt.getTime() + 30 * 60_000), r.allDay);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: r.title,
    dates: `${start}/${end}`,
    details: r.description ?? "Rappel Soonly",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
