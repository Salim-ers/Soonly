import type { ReminderCategory, Channel, Plan } from "@prisma/client";

export type CategoryMeta = { id: ReminderCategory; label: string; icon: string; color: string };

/** Catégories de vie — `icon` = nom d'icône lucide-react. */
export const CATEGORIES: CategoryMeta[] = [
  { id: "ADMIN", label: "Administration", icon: "IdCard", color: "#0D3B46" },
  { id: "SANTE", label: "Santé", icon: "HeartPulse", color: "#B4664A" },
  { id: "MAISON", label: "Maison", icon: "House", color: "#7A8B6F" },
  { id: "VEHICULE", label: "Véhicule", icon: "Car", color: "#56788A" },
  { id: "ASSURANCE", label: "Assurances", icon: "ShieldCheck", color: "#2BA39A" },
  { id: "BANQUE", label: "Banque", icon: "CreditCard", color: "#37474F" },
  { id: "ABONNEMENT", label: "Abonnements", icon: "RefreshCw", color: "#B45309" },
  { id: "FAMILLE", label: "Famille", icon: "Users", color: "#C9A45D" },
  { id: "ANIMAUX", label: "Animaux", icon: "PawPrint", color: "#8A6F5C" },
  { id: "VOYAGE", label: "Voyages", icon: "Plane", color: "#4E8AA8" },
  { id: "TRAVAIL", label: "Travail personnel", icon: "Briefcase", color: "#5B6B74" },
  { id: "LOISIRS", label: "Loisirs", icon: "Ticket", color: "#C77B4F" },
  { id: "GARANTIE", label: "Garanties", icon: "Award", color: "#2F7A5B" },
  { id: "IMPOTS", label: "Impôts", icon: "Landmark", color: "#46606E" },
  { id: "AUTRE", label: "Autre", icon: "Tag", color: "#90A0A8" },
];

export const categoryMeta = (id: ReminderCategory): CategoryMeta =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export type ChannelMeta = { id: Channel; label: string; icon: string; plusOnly: boolean };
export const CHANNELS: ChannelMeta[] = [
  { id: "EMAIL", label: "Email", icon: "Mail", plusOnly: false },
  { id: "PUSH", label: "Notification", icon: "Bell", plusOnly: false },
  { id: "SMS", label: "SMS", icon: "MessageSquare", plusOnly: true },
  { id: "WHATSAPP", label: "WhatsApp", icon: "MessageCircle", plusOnly: true },
];

export const PLANS: Record<Plan, { name: string; price: string; priceValue: number; tagline: string }> = {
  ESSENTIEL: { name: "Essentiel", price: "9,99 €", priceValue: 9.99, tagline: "Des rappels simples pour toutes vos dates importantes." },
  PLUS: { name: "Plus", price: "14,99 €", priceValue: 14.99, tagline: "Vos documents au coffre, vos rappels par SMS et WhatsApp." },
};

/** Modèles d'échéances prêts à l'emploi. */
export type Template = {
  title: string;
  category: ReminderCategory;
  offsetDays: number;
  rules: number[]; // en jours (J-x)
  recurrence: "NONE" | "YEARLY" | "MONTHLY";
  suggestDocument?: string;
};

export const TEMPLATES: Template[] = [
  { title: "Passeport à renouveler", category: "ADMIN", offsetDays: 180, rules: [90, 30, 7], recurrence: "NONE", suggestDocument: "Passeport" },
  { title: "Carte d'identité à renouveler", category: "ADMIN", offsetDays: 120, rules: [60, 30, 7], recurrence: "NONE", suggestDocument: "Carte d'identité" },
  { title: "Contrôle technique", category: "VEHICULE", offsetDays: 60, rules: [30, 7, 1], recurrence: "NONE", suggestDocument: "Carte grise" },
  { title: "Résilier un abonnement", category: "ABONNEMENT", offsetDays: 21, rules: [7, 3, 1], recurrence: "NONE" },
  { title: "Fin d'essai gratuit", category: "ABONNEMENT", offsetDays: 7, rules: [3, 1], recurrence: "NONE" },
  { title: "Rendez-vous médical", category: "SANTE", offsetDays: 14, rules: [7, 1], recurrence: "NONE" },
  { title: "Entretien chaudière", category: "MAISON", offsetDays: 45, rules: [30, 7], recurrence: "YEARLY", suggestDocument: "Certificat d'entretien" },
  { title: "Assurance habitation", category: "ASSURANCE", offsetDays: 75, rules: [30, 14], recurrence: "YEARLY", suggestDocument: "Attestation" },
  { title: "Assurance auto", category: "ASSURANCE", offsetDays: 75, rules: [30, 14], recurrence: "YEARLY", suggestDocument: "Attestation" },
  { title: "Garantie électroménager", category: "GARANTIE", offsetDays: 300, rules: [60, 14], recurrence: "NONE", suggestDocument: "Facture" },
  { title: "Vaccin animal", category: "ANIMAUX", offsetDays: 30, rules: [14, 3], recurrence: "YEARLY", suggestDocument: "Carnet de santé" },
  { title: "Rentrée scolaire", category: "FAMILLE", offsetDays: 56, rules: [30, 7], recurrence: "YEARLY" },
  { title: "Déclaration d'impôts", category: "IMPOTS", offsetDays: 60, rules: [30, 14, 3], recurrence: "YEARLY", suggestDocument: "Avis d'imposition" },
  { title: "Renouvellement mutuelle", category: "SANTE", offsetDays: 90, rules: [30, 14], recurrence: "YEARLY", suggestDocument: "Contrat" },
];
