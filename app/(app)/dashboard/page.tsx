import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, TriangleAlert, FileWarning, ArrowUpRight, Sparkles } from "lucide-react";
import { getSessionUser, getDashboard, toClient } from "@/lib/queries";
import { PageHeader, TranquilityGauge, Timeline } from "@/components/app/ui";
import { ReminderList } from "@/components/app/reminder-list";
import { QuickAddAuto, QuickAddButton } from "@/components/app/quick-add";
import { EmptyState } from "@/components/app/empty-state";

export const dynamic = "force-dynamic";

const ZONE_META: Record<string, { title: string; hint: string }> = {
  late: { title: "En retard", hint: "À traiter en priorité" },
  today: { title: "Aujourd'hui et demain", hint: "Ça se joue maintenant" },
  week: { title: "Cette semaine", hint: "Dans les 7 jours" },
  month: { title: "Ce mois-ci", hint: "Dans les 30 jours" },
  later: { title: "Plus tard", hint: "Rien d'urgent" },
};

export default async function DashboardPage() {
  const { user, plan } = await getSessionUser();
  const dash = await getDashboard(user.id);
  const name = (user.name ?? user.email?.split("@")[0] ?? "").split(" ")[0];
  const isEmpty = dash.reminders.length === 0;

  const scoreLabel = dash.score >= 90 ? "Tout est sous contrôle" : dash.score >= 70 ? "Presque au complet" : "Quelques points à sécuriser";

  return (
    <>
      <Suspense><QuickAddAuto plan={plan} /></Suspense>
      <PageHeader
        title={name ? `Bonjour, ${name}` : "Bonjour"}
        subtitle={isEmpty ? "Ajoutez votre première date importante pour commencer." : "Voici où en sont vos échéances."}
        action={<QuickAddButton plan={plan} className="btn btn-lg"><Sparkles className="h-[18px] w-[18px]" /> Nouvelle échéance</QuickAddButton>}
      />

      {isEmpty ? (
        <EmptyState
          title="Votre espace est prêt"
          description="Rien à retenir dans votre tête : ajoutez une date (passeport, contrôle technique, fin d'essai…) et Soonly s'occupe de vous prévenir au bon moment."
          cta={{ label: "Protéger ma première date", href: "/reminders?new=1" }}
        />
      ) : (
        <>
          {/* Bandeau score + stats */}
          <div className="mb-3.5 grid gap-3.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex items-center gap-5 rounded-lg border border-line bg-surface p-6 shadow-s">
              <TranquilityGauge score={dash.score} />
              <div className="min-w-0">
                <b className="block text-[16.5px] tracking-[-0.006em]">{scoreLabel}</b>
                <p className="mt-1 text-[13.5px] text-ink-2">{dash.stats.protected} échéance{dash.stats.protected > 1 ? "s" : ""} protégée{dash.stats.protected > 1 ? "s" : ""} par un rappel.</p>
                {dash.tips.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {dash.tips.slice(0, 2).map((t, i) => (
                      <Link key={i} href="/reminders" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sand-tint px-3 py-1 text-[12.5px] font-semibold text-sand-ink hover:bg-sand/40">
                        <ArrowUpRight className="h-[14px] w-[14px]" /> {t.text} <span className="opacity-70">+{t.points}%</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3.5">
              <Stat icon={<ShieldCheck />} value={dash.stats.protected} label="Protégées" tone="ok" />
              <Stat icon={<TriangleAlert />} value={dash.stats.urgent} label="À surveiller" tone="urgent" />
              <Stat icon={<FileWarning />} value={dash.stats.docsToCheck} label="Docs à vérifier" tone="neutral" />
            </div>
          </div>

          <div className="mb-6"><Timeline reminders={dash.reminders} /></div>

          {/* Zones */}
          <div className="flex flex-col gap-7">
            {(["late", "today", "week", "month", "later"] as const).map((z) => {
              const list = dash.zones[z];
              if (!list.length) return null;
              return (
                <section key={z}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="text-[16px] font-semibold tracking-[-0.006em] text-ink">{ZONE_META[z].title}</h2>
                    <span className="text-[12.5px] text-ink-3">{ZONE_META[z].hint} · {list.length}</span>
                  </div>
                  <ReminderList reminders={list.map(toClient)} />
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: "ok" | "urgent" | "neutral" }) {
  const tones = {
    ok: "bg-ok-tint text-ok",
    urgent: "bg-urgent-tint text-urgent",
    neutral: "bg-teal-wash text-teal",
  } as const;
  return (
    <div className="flex flex-col justify-between rounded-lg border border-line bg-surface p-4 shadow-s">
      <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${tones[tone]} [&_svg]:h-[18px] [&_svg]:w-[18px]`}>{icon}</span>
      <div className="mt-3"><b className="disp text-[26px] leading-none text-teal">{value}</b><span className="mt-1 block text-[12px] font-medium text-ink-3">{label}</span></div>
    </div>
  );
}
