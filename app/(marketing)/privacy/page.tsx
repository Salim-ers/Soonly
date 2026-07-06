import type { Metadata } from "next";
import { ShieldCheck, Link2, MessageSquare, Download, Trash2, Server } from "lucide-react";

export const metadata: Metadata = { title: "Confidentialité & sécurité" };

const BLOCKS = [
  { icon: <ShieldCheck />, t: "Cloisonnement strict", d: "Chaque utilisateur ne voit que ses propres données. Les documents sont privés, chiffrés, jamais exposés publiquement, et accessibles uniquement après authentification." },
  { icon: <MessageSquare />, t: "Notifications sobres", d: "Les rappels SMS et WhatsApp ne contiennent jamais de document : uniquement un titre et une date. L'option « masquer les titres sensibles » envoie un message neutre." },
  { icon: <Link2 />, t: "Consentement par source", d: "Chaque canal (email, notification, SMS, WhatsApp) et chaque intégration (agenda, boîte mail) s'active avec votre accord explicite et se coupe en un geste." },
  { icon: <Download />, t: "Export à tout moment", d: "Récupérez l'ensemble de vos échéances, documents et journaux d'envoi en un clic, dans un format ouvert." },
  { icon: <Trash2 />, t: "Suppression définitive", d: "Supprimez un document, une connexion ou l'intégralité de votre compte. La suppression est effective et irréversible." },
  { icon: <Server />, t: "Chiffrement & hébergement européen", d: "Données chiffrées en transit et au repos ; tokens d'intégration chiffrés (AES-256-GCM) et jamais exposés côté client. Hébergement dans l'Union européenne." },
];

export default function PrivacyPage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[860px] px-5 sm:px-7">
        <span className="kicker">Confidentialité & sécurité</span>
        <h1 className="disp mt-3.5 text-[clamp(30px,4vw,46px)] font-[560] leading-[1.1] text-teal">Vos données vous appartiennent. Point.</h1>
        <p className="mt-4 max-w-[60ch] text-[16.5px] text-ink-2">
          Soonly gère des rappels utiles et des documents sensibles. Voici, en clair, comment vos informations sont protégées et comment vous gardez le contrôle.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {BLOCKS.map((b) => (
            <div key={b.t} className="rounded-xl border border-line bg-surface p-6 shadow-s">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-wash text-teal [&_svg]:h-5 [&_svg]:w-5">{b.icon}</span>
              <b className="block text-[16px] tracking-[-0.005em]">{b.t}</b>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
