import { db } from "@/lib/db";
import type { ExternalEvent } from "@prisma/client";

/**
 * Connecteur Doctolib — conçu SANS scraping et SANS contournement des CGU.
 *
 * Soonly ne se connecte pas au compte Doctolib de l'utilisateur et ne récupère
 * jamais de données à l'insu du fournisseur. Trois modes autorisés :
 *
 *  1) Depuis l'agenda : si le rendez-vous a déjà été ajouté par l'utilisateur à
 *     son Google/Apple/Outlook Agenda (Doctolib propose ce bouton), Soonly le
 *     détecte comme un ExternalEvent « santé » et propose de le protéger.
 *
 *  2) Depuis l'email : si l'utilisateur a connecté sa boîte mail, l'email de
 *     confirmation Doctolib apparaît dans les candidats — validation manuelle.
 *
 *  3) Ajout manuel express : un raccourci « Rendez-vous santé » pré-rempli.
 *
 *  4) API officielle : si un partenariat/API Doctolib devient disponible,
 *     l'interface est prête à l'accueillir (statut « official-pending »).
 */

const DOCTOLIB_HINTS = /doctolib|dr\.?\s|docteur|cabinet|médecin|dentiste|consultation|rendez-vous/i;

/** Repère, parmi les événements agenda importés, ceux qui ressemblent à un RDV santé. */
export async function detectHealthEventsFromCalendar(userId: string): Promise<ExternalEvent[]> {
  const events = await db.externalEvent.findMany({
    where: { userId, startsAt: { gte: new Date() }, importedReminderId: null },
    orderBy: { startsAt: "asc" },
    take: 50,
  });
  return events.filter(
    (e) => DOCTOLIB_HINTS.test(e.title) || (e.location ? DOCTOLIB_HINTS.test(e.location) : false)
  );
}

/** Gabarit d'ajout manuel « Rendez-vous santé ». */
export const MANUAL_HEALTH_TEMPLATE = {
  title: "Rendez-vous médical",
  category: "SANTE" as const,
  rules: [7, 1],
  recurrence: "NONE" as const,
};
