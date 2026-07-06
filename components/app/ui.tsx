import { zoneFor, daysUntil } from "@/lib/dates";
import { Clock } from "lucide-react";
import type { ReminderWithRules } from "@/lib/queries";


/** Badge J-x coloré selon la proximité. */
export function DueBadge({ date }: { date: Date }) {
  const n = daysUntil(date);
  const zone = zoneFor(date);
  const map = {
    late: ["bg-danger-tint text-danger", "Dépassée"],
    today: ["bg-urgent-tint text-urgent", n === 0 ? "Aujourd'hui" : n === 1 ? "Demain" : `J-${n}`],
    week: ["bg-sand-tint text-sand-ink", `J-${n}`],
    month: ["bg-teal-tint text-teal", `J-${n}`],
    later: ["bg-bg-deep text-ink-2", `J-${n}`],
  } as const;
  const [cls, label] = map[zone];
  return <span className={`badge ${cls}`}>{zone === "today" && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{label}</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="disp text-[clamp(24px,2.6vw,32px)] font-[560] leading-[1.1] text-teal">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Jauge circulaire du score de tranquillité. */
export function TranquilityGauge({ score }: { score: number }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[118px] w-[118px] flex-none">
      <svg width="118" height="118" viewBox="0 0 118 118" className="-rotate-90">
        <circle cx="59" cy="59" r={r} fill="none" stroke="#EAEEEF" strokeWidth="9" />
        <circle cx="59" cy="59" r={r} fill="none" stroke="url(#gg)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
        <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0D3B46" /><stop offset="1" stopColor="#2BA39A" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="disp text-[31px] leading-none text-teal">{score}<span className="text-[16px]">%</span></b>
        <span className="mt-0.5 text-[10.5px] font-bold tracking-[0.08em] text-ink-3">TRANQUILLITÉ</span>
      </div>
    </div>
  );
}

/** Fil du temps — points lumineux positionnés sur une échelle segmentée. */
function tlPos(n: number) {
  if (n <= 0) return 2;
  if (n <= 7) return 2 + (n / 7) * 32;
  if (n <= 30) return 34 + ((n - 7) / 23) * 32;
  return 66 + Math.min((n - 30) / 90, 1) * 32;
}
const DOT_COLORS: Record<string, string> = { late: "#A8590E", today: "#A8590E", week: "#B98F4A", month: "#2BA39A", later: "#0D3B46" };

export function Timeline({ reminders }: { reminders: ReminderWithRules[] }) {
  const items = reminders.filter((r) => daysUntil(r.dueAt) >= 0).slice(0, 9);
  const zones = ["Aujourd'hui", "Cette semaine", "Ce mois-ci", "Plus tard"];
  const lefts = [2, 34, 66, 98];
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-6 shadow-s">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-[15.5px] font-semibold tracking-[-0.005em]"><Clock className="h-[17px] w-[17px] text-sand-deep" /> Votre fil du temps</h3>
        <span className="text-[12.5px] text-ink-3">{items.length} à venir</span>
      </div>
      {/* Desktop : horizontal */}
      <div className="relative hidden min-h-[150px] md:block">
        <div className="absolute left-0 right-0 top-[76px] h-0.5 rounded bg-gradient-to-r from-teal via-teal-soft to-sand opacity-90" />
        <div className="absolute left-0 top-[64px] h-[26px] w-0.5 bg-teal" />
        {items.map((r, i) => {
          const n = daysUntil(r.dueAt);
          const x = tlPos(n);
          return (
            <span key={r.id} className="group absolute top-[76px] h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-surface" style={{ left: `${x}%`, background: DOT_COLORS[zoneFor(r.dueAt)] }} title={r.title}>
              {i % 2 === 0 && (
                <span className="pointer-events-none absolute bottom-6 left-1/2 w-[120px] -translate-x-1/2 text-center">
                  <b className="block truncate text-[11.5px] font-semibold">{r.title}</b>
                </span>
              )}
            </span>
          );
        })}
        {zones.map((z, i) => (
          <span key={z} className="absolute top-[110px] -translate-x-1/2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.09em] text-ink-3" style={{ left: `${lefts[i]}%` }}>{z}</span>
        ))}
      </div>
      {/* Mobile : vertical */}
      <div className="relative mt-2 pl-6 md:hidden">
        <span className="absolute bottom-1.5 left-[7px] top-1.5 w-0.5 rounded bg-gradient-to-b from-teal via-teal-soft to-sand" />
        {items.length ? items.map((r) => (
          <div key={r.id} className="relative flex items-center gap-2.5 py-2">
            <span className="absolute -left-6 h-[13px] w-[13px] rounded-full border-[2.5px] border-surface" style={{ background: DOT_COLORS[zoneFor(r.dueAt)] }} />
            <b className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{r.title}</b>
            <DueBadge date={r.dueAt} />
          </div>
        )) : <p className="text-[13px] text-ink-3">Ajoutez une échéance pour voir votre fil du temps.</p>}
      </div>
    </div>
  );
}
