"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, animate, useReducedMotion } from "framer-motion";
import { ShieldCheck, TriangleAlert, FileWarning, BellRing, Sparkles, Sun, Sunrise, Moon, ArrowUpRight } from "lucide-react";
import { QuickAddButton } from "@/components/app/quick-add";

const EASE = [0.22, 1, 0.36, 1] as const;

type Stats = { protected: number; urgent: number; docsToCheck: number };
type NextFire = { title: string; at: string } | null;

export function DashboardHero({
  greeting, name, dateLabel, isEmpty, score, scoreLabel, stats, nextFire, tip, plan,
}: {
  greeting: string; name: string; dateLabel: string; isEmpty: boolean;
  score: number; scoreLabel: string; stats: Stats; nextFire: NextFire; tip?: string;
  plan: "ESSENTIEL" | "PLUS";
}) {
  const TimeIcon = greeting === "Bonjour" ? Sunrise : greeting === "Bonsoir" || greeting === "Bonne nuit" ? Moon : Sun;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
        className="mb-5 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.11em] text-ink-3">
            <TimeIcon className="h-[15px] w-[15px] text-sand-deep" /> {dateLabel}
          </div>
          <h1 className="disp text-[clamp(26px,3vw,38px)] font-[560] leading-[1.04] text-teal">
            {greeting}, {name}
          </h1>
        </div>
        <QuickAddButton plan={plan} className="btn btn-lg">
          <Sparkles className="h-[18px] w-[18px]" /> Nouvelle échéance
        </QuickAddButton>
      </motion.div>

      {isEmpty ? (
        <EmptyHero plan={plan} />
      ) : (
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
          <HeroCard delay={0.05}>
            <div className="flex items-center gap-6">
              <Gauge score={score} />
              <div className="min-w-0">
                <b className="block text-[17px] tracking-[-0.006em]">{scoreLabel}</b>
                <p className="mt-1 text-[13.5px] text-ink-2">
                  {stats.protected} échéance{stats.protected > 1 ? "s" : ""} protégée{stats.protected > 1 ? "s" : ""} par un rappel.
                </p>
                {tip && (
                  <Link href="/reminders" className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sand-tint px-3 py-1.5 text-[12.5px] font-semibold text-sand-ink transition-colors hover:bg-sand/40">
                    <ArrowUpRight className="h-[14px] w-[14px]" /> {tip}
                  </Link>
                )}
              </div>
            </div>
          </HeroCard>
          <div className="grid grid-cols-2 gap-3.5">
            <Stat delay={0.1} icon={<ShieldCheck />} value={stats.protected} label="Protégées" tone="ok" />
            <Stat delay={0.16} icon={<TriangleAlert />} value={stats.urgent} label="À surveiller" tone="urgent" />
            <Stat delay={0.22} icon={<FileWarning />} value={stats.docsToCheck} label="Docs à vérifier" tone="neutral" />
            <NextTile delay={0.28} nextFire={nextFire} />
          </div>
        </div>
      )}
    </div>
  );
}

function HeroCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay, ease: EASE }}
      className="relative overflow-hidden rounded-[22px] border border-line bg-surface p-6 shadow-l"
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-teal-soft/10 blur-3xl" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function useCountUp(target: number) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setV(target); return; }
    const controls = animate(0, target, { duration: 1, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => controls.stop();
  }, [target, reduced]);
  return v;
}

function Gauge({ score }: { score: number }) {
  const reduced = useReducedMotion();
  const display = useCountUp(score);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative h-[132px] w-[132px] flex-none">
      <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="rgb(var(--c-teal-tint))" strokeWidth="10" />
        <motion.circle
          cx="66" cy="66" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.15, ease: EASE }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgb(var(--c-teal))" />
            <stop offset="1" stopColor="rgb(var(--c-teal-soft))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="disp text-[34px] leading-none text-teal tabular-nums">
          {display}<span className="text-[17px]">%</span>
        </b>
        <span className="mt-1 text-[9.5px] font-bold tracking-[0.11em] text-ink-3">TRANQUILLITÉ</span>
      </div>
    </div>
  );
}

const TONES = {
  ok: "bg-ok-tint text-ok",
  urgent: "bg-urgent-tint text-urgent",
  neutral: "bg-teal-wash text-teal",
} as const;

function Stat({ icon, value, label, tone, delay }: { icon: React.ReactNode; value: number; label: string; tone: keyof typeof TONES; delay: number }) {
  const display = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: EASE }}
      className="flex flex-col justify-between rounded-[18px] border border-line bg-surface p-4 shadow-s"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${TONES[tone]} [&_svg]:h-[18px] [&_svg]:w-[18px]`}>{icon}</span>
      <div className="mt-4">
        <b className="disp text-[27px] leading-none text-teal tabular-nums">{display}</b>
        <span className="mt-1 block text-[12px] font-medium text-ink-3">{label}</span>
      </div>
    </motion.div>
  );
}

function NextTile({ nextFire, delay }: { nextFire: NextFire; delay: number }) {
  const rel = nextFire ? relativeDay(nextFire.at) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: EASE }}
      className="flex flex-col justify-between rounded-[18px] border border-line bg-teal p-4 text-on-teal shadow-s"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white/15 [&_svg]:h-[18px] [&_svg]:w-[18px]"><BellRing /></span>
      <div className="mt-4 min-w-0">
        {nextFire ? (
          <>
            <b className="block truncate text-[14.5px] leading-tight">{nextFire.title}</b>
            <span className="mt-1 block text-[12px] font-medium opacity-80">Prochain rappel · {rel}</span>
          </>
        ) : (
          <>
            <b className="block text-[14.5px] leading-tight">Aucun rappel prévu</b>
            <span className="mt-1 block text-[12px] font-medium opacity-80">Tout est calme</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function relativeDay(iso: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "demain";
  if (days < 31) return `dans ${days} j`;
  const months = Math.round(days / 30);
  return `dans ${months} mois`;
}

function EmptyHero({ plan }: { plan: "ESSENTIEL" | "PLUS" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
      className="relative overflow-hidden rounded-[24px] border border-line bg-surface p-8 shadow-l sm:p-10"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-soft/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-sand/10 blur-3xl" />
      <div className="relative max-w-[56ch]">
        <span className="badge bg-teal-tint text-teal">Bienvenue</span>
        <h2 className="disp mt-3.5 text-[clamp(23px,2.6vw,32px)] font-[560] leading-[1.1] text-teal">Votre tête, enfin tranquille.</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          Ajoutez une date importante — passeport, contrôle technique, fin d'essai, assurance… — et Soonly vous prévient au bon moment, sur le bon canal. Commencez en un clic ci-dessous.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <QuickAddButton plan={plan} className="btn btn-lg">
            <Sparkles className="h-[18px] w-[18px]" /> Protéger ma première date
          </QuickAddButton>
          <Link href="/integrations" className="btn btn-ghost btn-lg">Relier mon agenda</Link>
        </div>
      </div>
    </motion.div>
  );
}
