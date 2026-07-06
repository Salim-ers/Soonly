"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const FAQS: Array<[string, string]> = [
  ["Mes documents sont-ils en sécurité ?", "Oui. Vos documents restent dans un coffre privé chiffré, accessible uniquement par vous après authentification. Aucune URL publique, aucun partage, et vous pouvez tout supprimer définitivement à tout moment."],
  ["Que contient un rappel SMS ou WhatsApp ?", "Uniquement le titre de l'échéance et sa date — jamais vos documents ni leur contenu. Vous pouvez aussi activer l'option « masquer les titres sensibles » pour recevoir un message neutre."],
  ["Quelle est la différence entre Essentiel et Plus ?", "Essentiel couvre tous les rappels par email et notification, sans limite d'échéances. Plus ajoute le coffre documents, les rappels SMS et WhatsApp, les alertes de documents expirés et les intégrations avancées."],
  ["Comment fonctionne la connexion à mon agenda ?", "Vous autorisez Soonly à lire vos événements à venir via une connexion officielle (Google, Microsoft). Soonly vous propose de transformer certains événements en rappels : vous validez chacun. Vous pouvez déconnecter à tout moment."],
  ["Et pour l'iPhone / Apple Calendar ?", "Soonly publie un calendrier « Soonly » que vous ajoutez à l'app Calendrier d'iOS en un abonnement. Vos rappels y apparaissent, toujours à jour. Une application web ne peut pas lire directement l'agenda d'un iPhone — Soonly ne le prétend jamais."],
  ["Puis-je annuler quand je veux ?", "Oui. Les deux offres sont sans engagement : vous résiliez en un clic depuis le portail client, et votre compte reste actif jusqu'à la fin de la période payée."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[760px]">
      {FAQS.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="mb-3 overflow-hidden rounded-lg border border-line bg-surface">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-[22px] py-[19px] text-left text-[15.5px] font-semibold tracking-[-0.005em]"
              aria-expanded={isOpen}
            >
              {q}
              <ChevronDown className={`h-5 w-5 flex-none text-ink-3 transition-transform ${isOpen ? "rotate-180 text-teal" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <p className="max-w-[64ch] px-[22px] pb-5 text-[14.5px] leading-relaxed text-ink-2">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
