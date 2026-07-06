import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanCta = { label: string; href?: string; onClickAttr?: Record<string, string>; variant?: "ghost" | "sand" | "primary" | "disabled" };

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 py-2 text-[14px] text-ink-2">
      <Check className="mt-0.5 h-[17px] w-[17px] flex-none text-teal-soft" />
      <span>{children}</span>
    </li>
  );
}

export function PricingCards({
  essentielCta = { label: "Choisir Essentiel", href: "/signup", variant: "ghost" },
  plusCta = { label: "Choisir Plus", href: "/signup", variant: "sand" },
}: {
  essentielCta?: PlanCta;
  plusCta?: PlanCta;
}) {
  return (
    <div className="mx-auto grid max-w-[840px] gap-5 md:grid-cols-2">
      <div className="flex flex-col rounded-xl border border-line bg-surface p-8">
        <h3 className="text-[19px] font-semibold tracking-[-0.008em]">Essentiel</h3>
        <p className="mt-1.5 text-[13.5px] text-ink-2">Des rappels simples pour toutes vos dates importantes.</p>
        <div className="mb-1 mt-5 flex items-baseline gap-1.5">
          <b className="disp text-[42px] font-[560] text-teal">9,99 €</b>
          <span className="text-[14px] text-ink-3">/ mois</span>
        </div>
        <p className="mb-5 text-[12.5px] text-ink-3">7 jours d'essai gratuit, sans engagement.</p>
        <ul className="mb-6 flex-1 list-none">
          <Feature>Échéances et catégories <b className="font-semibold text-ink">illimitées</b></Feature>
          <Feature>Rappels <b className="font-semibold text-ink">email</b> et <b className="font-semibold text-ink">notifications push</b></Feature>
          <Feature>Rappels personnalisables (J-90 → jour J) et récurrences</Feature>
          <Feature>Calendrier personnel et vue Urgent / Bientôt / Plus tard</Feature>
          <Feature>Modèles d'échéances prêts à l'emploi</Feature>
          <Feature>Synchronisation multi-appareils</Feature>
        </ul>
        <PlanButton cta={essentielCta} />
      </div>

      <div className="relative flex flex-col rounded-xl border border-teal bg-surface p-8 shadow-m">
        <span className="absolute -top-3.5 left-7 inline-flex h-[26px] items-center rounded-full bg-sand px-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#3C2E10]">
          Recommandé
        </span>
        <h3 className="text-[19px] font-semibold tracking-[-0.008em]">Plus</h3>
        <p className="mt-1.5 text-[13.5px] text-ink-2">Vos documents au coffre, vos rappels par SMS et WhatsApp.</p>
        <div className="mb-1 mt-5 flex items-baseline gap-1.5">
          <b className="disp text-[42px] font-[560] text-teal">14,99 €</b>
          <span className="text-[14px] text-ink-3">/ mois</span>
        </div>
        <p className="mb-5 text-[12.5px] text-ink-3">7 jours d'essai gratuit, sans engagement.</p>
        <ul className="mb-6 flex-1 list-none">
          <Feature><b className="font-semibold text-ink">Tout Essentiel</b>, sans exception</Feature>
          <Feature><b className="font-semibold text-ink">Coffre documents</b> sécurisé : PDF, photos, images</Feature>
          <Feature>Rappels <b className="font-semibold text-ink">SMS</b>, emails avancés et <b className="font-semibold text-ink">WhatsApp</b></Feature>
          <Feature>Documents reliés aux échéances, alertes d'expiration</Feature>
          <Feature>Import de documents et intégrations avancées</Feature>
          <Feature>Export, tags et checklist des papiers importants</Feature>
        </ul>
        <PlanButton cta={plusCta} />
      </div>
    </div>
  );
}

function PlanButton({ cta }: { cta: PlanCta }) {
  const cls = cn(
    "btn w-full",
    cta.variant === "ghost" && "btn-ghost",
    cta.variant === "sand" && "btn-sand",
    cta.variant === "disabled" && "btn-ghost pointer-events-none opacity-60"
  );
  if (cta.href) return <Link href={cta.href} className={cls}>{cta.label}</Link>;
  return <button className={cls} {...cta.onClickAttr}>{cta.label}</button>;
}
