import { getSessionUser } from "@/lib/queries";
import { db } from "@/lib/db";
import { INTEGRATIONS } from "@/lib/integrations/provider-registry";
import { PageHeader } from "@/components/app/ui";
import { ConnectButton, SyncButton, DisconnectButton, AppleSubscribe } from "@/components/integrations/actions";
import { Calendar, Mail, HeartPulse, Check, CircleAlert, ArrowDownToLine, ArrowUpFromLine, ShieldQuestion } from "lucide-react";
import type { ProviderKind } from "@prisma/client";

export const dynamic = "force-dynamic";

const CONNECT_URL: Partial<Record<ProviderKind, string>> = {
  GOOGLE_CALENDAR: "/api/integrations/google/connect",
  MICROSOFT_CALENDAR: "/api/integrations/microsoft/connect",
  GMAIL: "/api/integrations/email/gmail/connect",
  OUTLOOK_MAIL: "/api/integrations/email/outlook/connect",
};
const SYNC_URL: Partial<Record<ProviderKind, string>> = {
  GOOGLE_CALENDAR: "/api/integrations/google/sync",
  MICROSOFT_CALENDAR: "/api/integrations/microsoft/sync",
};

const CAT_ICON = { calendar: Calendar, mail: Mail, health: HeartPulse, file: ArrowDownToLine };
const CAT_TITLE = { calendar: "Agendas", mail: "Boîtes mail", health: "Santé", file: "Fichiers" };

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  const { user } = await getSessionUser();
  const sp = await searchParams;
  const accounts = await db.connectedAccount.findMany({ where: { userId: user.id } });
  const connectedSet = new Set(accounts.map((a) => a.provider));

  const groups = ["calendar", "mail", "health"] as const;

  return (
    <>
      <PageHeader title="Intégrations" subtitle="Connectez vos sources — toujours par connexion officielle et avec votre consentement." />

      {sp.connected && <Banner tone="ok" text={`Connexion réussie (${sp.connected}). Vous pouvez maintenant synchroniser vos événements.`} />}
      {sp.error && <Banner tone="err" text={bannerError(sp.error)} />}

      <div className="flex flex-col gap-8">
        {groups.map((g) => {
          const items = INTEGRATIONS.filter((i) => i.category === g);
          const CatIcon = CAT_ICON[g];
          return (
            <section key={g}>
              <div className="mb-3 flex items-center gap-2.5">
                <CatIcon className="h-[18px] w-[18px] text-teal" />
                <h2 className="text-[16px] font-semibold tracking-[-0.006em]">{CAT_TITLE[g]}</h2>
              </div>
              <div className="grid gap-3.5 md:grid-cols-2">
                {items.map((it) => {
                  const connected = connectedSet.has(it.provider);
                  const configured = it.requiresKeys();
                  return (
                    <div key={it.provider} className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-s">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <b className="text-[15.5px] tracking-[-0.006em]">{it.name}</b>
                            <StatusBadge status={it.status} connected={connected} />
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{it.tagline}</p>
                        </div>
                      </div>

                      <div className="my-3.5 flex flex-col gap-1.5 rounded-[11px] bg-surface-2 p-3">
                        {it.reads.map((r, i) => <Line key={"r" + i} icon={<ArrowDownToLine className="h-[13px] w-[13px] text-teal-soft" />} text={r} />)}
                        {it.writes.map((w, i) => <Line key={"w" + i} icon={<ArrowUpFromLine className="h-[13px] w-[13px] text-sand-deep" />} text={w} />)}
                      </div>

                      {!configured ? (
                        <p className="mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3"><CircleAlert className="h-4 w-4" /> Connexion bientôt disponible</p>
                      ) : it.provider === "APPLE_ICS" ? (
                        <div className="mt-auto"><AppleSubscribe /></div>
                      ) : connected ? (
                        <div className="mt-auto flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-tint px-2.5 py-1 text-[12px] font-bold text-ok"><Check className="h-[14px] w-[14px]" /> Connecté</span>
                          {SYNC_URL[it.provider] && <SyncButton path={SYNC_URL[it.provider]!} />}
                          <DisconnectButton provider={it.provider} />
                        </div>
                      ) : (
                        <div className="mt-auto"><ConnectButton href={CONNECT_URL[it.provider] ?? "#"} /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Doctolib — encart de transparence */}
        <section>
          <div className="mb-3 flex items-center gap-2.5"><HeartPulse className="h-[18px] w-[18px] text-teal" /><h2 className="text-[16px] font-semibold tracking-[-0.006em]">Doctolib</h2></div>
          <div className="rounded-xl border border-line bg-surface p-6 shadow-s">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-wash text-teal"><ShieldQuestion className="h-5 w-5" /></span>
              <div>
                <b className="text-[15px] tracking-[-0.006em]">Vos rendez-vous santé, sans contourner Doctolib</b>
                <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-2">
                  Soonly ne se connecte pas à votre compte Doctolib. Ajoutez votre rendez-vous à un agenda connecté (Google, Apple, Outlook) : Soonly le repère et vous propose de le protéger. Vous pouvez aussi le saisir en deux clics via « Rendez-vous santé ». Si une connexion officielle devient disponible, elle apparaîtra ici.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function StatusBadge({ status, connected }: { status: string; connected: boolean }) {
  if (connected) return null;
  if (status === "beta") return <span className="badge bg-sand-tint text-sand-ink h-[22px] px-2 text-[10.5px]">Bêta</span>;
  if (status === "official-pending") return <span className="badge bg-bg-deep text-ink-2 h-[22px] px-2 text-[10px]">Officiel à venir</span>;
  return <span className="badge bg-ok-tint text-ok h-[22px] px-2 text-[10.5px]">Disponible</span>;
}
function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-2 text-[12.5px] text-ink-2">{icon}<span>{text}</span></div>;
}
function Banner({ tone, text }: { tone: "ok" | "err"; text: string }) {
  return <div className={`mb-5 rounded-xl border px-4 py-3 text-[13.5px] font-medium ${tone === "ok" ? "border-ok/30 bg-ok-tint text-ok" : "border-danger/30 bg-danger-tint text-danger"}`}>{text}</div>;
}
function bannerError(code: string) {
  const map: Record<string, string> = {
    invalid_state: "La connexion a expiré. Merci de réessayer.",
    google_exchange: "La connexion à Google a échoué. Réessayez.",
    microsoft_exchange: "La connexion à Microsoft a échoué. Réessayez.",
    google_not_configured: "L'intégration Google n'est pas encore configurée côté serveur.",
    microsoft_not_configured: "L'intégration Microsoft n'est pas encore configurée côté serveur.",
  };
  return map[code] ?? "Une erreur est survenue lors de la connexion.";
}
