import type { ProviderKind } from "@prisma/client";
import { featureConfigured } from "@/lib/env";

/**
 * Registre des intégrations Soonly.
 *
 * Chaque connecteur déclare de façon transparente :
 *   - `reads`   : ce que Soonly lit chez le fournisseur
 *   - `writes`  : ce que Soonly écrit (souvent rien)
 *   - `why`     : pourquoi c'est utile pour l'utilisateur
 *   - `disconnect` : comment couper la connexion
 *   - `scopes`  : périmètre OAuth minimal demandé
 *   - `status`  : available | beta | official-pending
 *   - `requiresKeys` : la clé serveur nécessaire est-elle configurée ?
 *
 * Aucun connecteur ne pratique de scraping ni ne contourne des CGU.
 */
export type IntegrationDef = {
  provider: ProviderKind;
  name: string;
  category: "calendar" | "mail" | "health" | "file";
  tagline: string;
  reads: string[];
  writes: string[];
  why: string;
  disconnect: string;
  scopes: string[];
  status: "available" | "beta" | "official-pending";
  consentRequired: boolean;
  /** Renseigné à l'exécution : la config serveur est-elle présente ? */
  requiresKeys: () => boolean;
};

export const INTEGRATIONS: IntegrationDef[] = [
  {
    provider: "GOOGLE_CALENDAR",
    name: "Google Agenda",
    category: "calendar",
    tagline: "Importez vos événements et synchronisez vos rappels.",
    reads: ["Événements à venir (titre, date, lieu)"],
    writes: ["Optionnel : un agenda « Soonly » où sont poussés vos rappels"],
    why: "Un rendez-vous déjà dans votre agenda peut devenir un rappel protégé, sans double saisie.",
    disconnect: "Révoquez l'accès dans Réglages › Intégrations, ou depuis votre compte Google.",
    scopes: ["https://www.googleapis.com/auth/calendar.events.readonly", "https://www.googleapis.com/auth/calendar.app.created"],
    status: "available",
    consentRequired: true,
    requiresKeys: () => featureConfigured.googleCalendar(),
  },
  {
    provider: "MICROSOFT_CALENDAR",
    name: "Outlook Agenda",
    category: "calendar",
    tagline: "Vos événements Microsoft, transformés en rappels.",
    reads: ["Événements à venir (titre, date, lieu)"],
    writes: ["Optionnel : synchronisation des rappels Soonly"],
    why: "Idéal si votre vie s'organise dans Outlook ou Microsoft 365.",
    disconnect: "Révoquez l'accès dans Réglages › Intégrations, ou sur account.microsoft.com.",
    scopes: ["Calendars.Read", "offline_access"],
    status: "available",
    consentRequired: true,
    requiresKeys: () => featureConfigured.microsoftCalendar(),
  },
  {
    provider: "APPLE_ICS",
    name: "Apple Calendar / iPhone",
    category: "calendar",
    tagline: "Abonnez votre iPhone au calendrier Soonly.",
    reads: ["Rien — Soonly ne lit pas l'agenda de votre iPhone depuis le web."],
    writes: ["Un flux ICS « Soonly » que vous ajoutez à Apple Calendar (lecture seule)"],
    why: "Vos rappels Soonly apparaissent dans l'app Calendrier d'iOS, toujours à jour.",
    disconnect: "Supprimez le calendrier abonné dans Réglages iOS › Calendrier › Comptes.",
    scopes: [],
    status: "available",
    consentRequired: false,
    requiresKeys: () => true, // ICS ne dépend d'aucune clé externe
  },
  {
    provider: "GMAIL",
    name: "Gmail",
    category: "mail",
    tagline: "Retrouvez les échéances cachées dans vos emails.",
    reads: ["Uniquement les emails correspondant à des échéances (confirmations, factures, fins d'essai) — après votre accord"],
    writes: ["Rien"],
    why: "Une facture annuelle ou une fin d'essai enfouie dans la boîte mail devient un rappel — vous validez chaque proposition.",
    disconnect: "Révoquez l'accès dans Réglages › Intégrations, ou dans les autorisations de votre compte Google.",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    status: "beta",
    consentRequired: true,
    requiresKeys: () => featureConfigured.googleCalendar(),
  },
  {
    provider: "OUTLOOK_MAIL",
    name: "Outlook Mail",
    category: "mail",
    tagline: "Détectez les échéances dans votre courrier Outlook.",
    reads: ["Uniquement les emails liés à des échéances — après votre accord"],
    writes: ["Rien"],
    why: "Mêmes bénéfices que Gmail, pour les boîtes Microsoft.",
    disconnect: "Révoquez l'accès dans Réglages › Intégrations.",
    scopes: ["Mail.Read", "offline_access"],
    status: "beta",
    consentRequired: true,
    requiresKeys: () => featureConfigured.microsoftCalendar(),
  },
  {
    provider: "DOCTOLIB",
    name: "Doctolib",
    category: "health",
    tagline: "Vos rendez-vous santé, sans jamais contourner Doctolib.",
    reads: [
      "Un rendez-vous déjà ajouté à votre Google/Apple/Outlook Agenda",
      "Ou un email de confirmation, si vous connectez votre boîte mail",
    ],
    writes: ["Rien"],
    why: "Soonly ne se connecte pas en votre nom à Doctolib et ne récupère rien sans autorisation : il réutilise ce que vous avez déjà (agenda ou email) ou un ajout manuel express.",
    disconnect: "Déconnectez l'agenda ou la boîte mail concernée ; l'ajout manuel ne nécessite aucune connexion.",
    scopes: [],
    status: "official-pending",
    consentRequired: true,
    requiresKeys: () => true,
  },
];

export const getIntegration = (p: ProviderKind) => INTEGRATIONS.find((i) => i.provider === p);
