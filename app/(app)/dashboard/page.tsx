import { Suspense } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { getSessionUser, getDashboard, toClient } from "@/lib/queries";
import { Timeline } from "@/components/app/ui";
import { ReminderList } from "@/components/app/reminder-list";
import { QuickAddAuto } from "@/components/app/quick-add";
import { DashboardHero } from "@/components/app/dashboard-hero";
import { DashboardOnboarding } from "@/components/app/dashboard-onboarding";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

const ZONE_META: Record<string, { title: string; hint: string }> = {
  late: { title: "En retard", hint: "À traiter en priorité" },
  today: { title: "Aujourd'hui et demain", hint: "Ça se joue maintenant" },
  week: { title: "Cette semaine", hint: "Dans les 7 jours" },
  month: { title: "Ce mois-ci", hint: "Dans les 30 jours" },
  later: { title: "Plus tard", hint: "Rien d'urgent" },
};

function greetingFor(hour: number): string {
  if (hour < 6) return "Bonne nuit";
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  if (hour < 22) return "Bonsoir";
  return "Bonne nuit";
}

export default async function DashboardPage() {
  const { user, plan } = await getSessionUser();
  const dash = await getDashboard(user.id);

  const tz = user.timezone || "Europe/Paris";
  const now = new Date();
  const greeting = greetingFor(Number(formatInTimeZone(now, tz, "H")));
  const dateLabel = formatInTimeZone(now, tz, "EEEE d MMMM", { locale: fr });
  const name = (user.name ?? user.email?.split("@")[0] ?? "").split(" ")[0] || "vous";
  const isEmpty = dash.reminders.length === 0;
  const scoreLabel =
    dash.score >= 90 ? "Tout est sous contrôle" : dash.score >= 70 ? "Presque au complet" : "Quelques points à sécuriser";

  return (
    <>
      <Suspense><QuickAddAuto plan={plan} /></Suspense>

      <DashboardHero
        greeting={greeting}
        name={name}
        dateLabel={dateLabel}
        isEmpty={isEmpty}
        score={dash.score}
        scoreLabel={scoreLabel}
        stats={dash.stats}
        nextFire={dash.nextFire ? { title: dash.nextFire.title, at: dash.nextFire.at.toISOString() } : null}
        tip={dash.tips[0]?.text}
        plan={plan}
      />

      {isEmpty ? (
        <DashboardOnboarding plan={plan} />
      ) : (
        <>
          <Reveal className="mt-6"><Timeline reminders={dash.reminders} /></Reveal>
          <div className="mt-7 flex flex-col gap-7">
            {(["late", "today", "week", "month", "later"] as const).map((z) => {
              const list = dash.zones[z];
              if (!list.length) return null;
              return (
                <Reveal key={z}>
                  <section>
                    <div className="mb-3 flex items-baseline gap-3">
                      <h2 className="text-[16px] font-semibold tracking-[-0.006em] text-ink">{ZONE_META[z].title}</h2>
                      <span className="text-[12.5px] text-ink-3">{ZONE_META[z].hint} · {list.length}</span>
                    </div>
                    <ReminderList reminders={list.map(toClient)} />
                  </section>
                </Reveal>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
