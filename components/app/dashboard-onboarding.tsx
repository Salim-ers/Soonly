"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, BellRing, ShieldCheck, Link2, ArrowRight, Plus } from "lucide-react";
import { TEMPLATES } from "@/lib/constants";
import { CategoryTile } from "@/components/app/category-icon";
import { QuickAddButton } from "@/components/app/quick-add";
import { RevealGroup, revealItem, Reveal } from "@/components/motion/reveal";

const STEPS = [
  { icon: CalendarPlus, title: "Ajoutez une date", text: "Un modèle ou une saisie express en moins de 20 secondes." },
  { icon: BellRing, title: "Choisissez les rappels", text: "J-30, J-7, J-1… par email, notification, SMS ou WhatsApp." },
  { icon: ShieldCheck, title: "On vous prévient", text: "Au bon moment, sur le bon canal. Vous n'oubliez plus rien." },
];

function hint(days: number): string {
  if (days < 31) return `≈ dans ${days} j`;
  return `≈ dans ${Math.round(days / 30)} mois`;
}

export function DashboardOnboarding({ plan }: { plan: "ESSENTIEL" | "PLUS" }) {
  return (
    <div className="mt-8 flex flex-col gap-9">
      {/* Démarrage en un clic */}
      <section>
        <div className="mb-3.5 flex items-baseline justify-between gap-3">
          <h2 className="text-[17px] font-semibold tracking-[-0.008em]">Commencez en un clic</h2>
          <span className="text-[12.5px] text-ink-3">Un modèle pré-rempli, à ajuster</span>
        </div>
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.slice(0, 9).map((t) => (
            <motion.div key={t.title} variants={revealItem}>
              <QuickAddButton
                plan={plan}
                template={t.title}
                className="group flex w-full items-center gap-3.5 rounded-[18px] border border-line bg-surface p-4 text-left shadow-s transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-m"
              >
                <CategoryTile category={t.category} size={42} />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] tracking-[-0.005em]">{t.title}</b>
                  <span className="text-[12px] text-ink-3">{hint(t.offsetDays)}</span>
                </span>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-3 transition-colors group-hover:bg-teal group-hover:text-on-teal">
                  <Plus className="h-[15px] w-[15px]" />
                </span>
              </QuickAddButton>
            </motion.div>
          ))}
        </RevealGroup>
      </section>

      {/* Comment ça marche */}
      <Reveal>
        <section>
          <h2 className="mb-3.5 text-[17px] font-semibold tracking-[-0.008em]">Comment ça marche</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative overflow-hidden rounded-[18px] border border-line bg-surface p-5 shadow-s">
                <span className="disp absolute right-4 top-3 text-[40px] font-[560] leading-none text-teal/8">{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-teal-wash text-teal [&_svg]:h-[21px] [&_svg]:w-[21px]"><s.icon /></span>
                <b className="mt-4 block text-[14.5px] tracking-[-0.005em]">{s.title}</b>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Reliez vos comptes */}
      <Reveal>
        <Link
          href="/integrations"
          className="group relative flex items-center justify-between gap-5 overflow-hidden rounded-[20px] border border-line bg-teal p-6 text-on-teal shadow-l sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[15px] bg-white/15 [&_svg]:h-[23px] [&_svg]:w-[23px]"><Link2 /></span>
            <div>
              <b className="block text-[16px] tracking-[-0.006em]">Reliez votre agenda et vos mails</b>
              <p className="mt-1 max-w-[52ch] text-[13.5px] leading-relaxed opacity-85">Google Agenda, Outlook, Gmail… Soonly repère vos échéances automatiquement — factures, rendez-vous, renouvellements.</p>
            </div>
          </div>
          <span className="relative flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5"><ArrowRight className="h-5 w-5" /></span>
        </Link>
      </Reveal>
    </div>
  );
}
