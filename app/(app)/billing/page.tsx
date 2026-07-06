import { getSessionUser } from "@/lib/queries";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/ui";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { UpgradeButton, ManageButton } from "@/components/billing/actions";
import { ShieldCheck, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Essai en cours", ACTIVE: "Actif", PAST_DUE: "Paiement en retard",
  CANCELED: "Résilié", INCOMPLETE: "En attente", UNPAID: "Impayé",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { user, plan } = await getSessionUser();
  const sp = await searchParams;
  const sub = await db.subscription.findUnique({ where: { userId: user.id } });
  const isPlus = plan === "PLUS";
  const active = sub && ["TRIALING", "ACTIVE", "PAST_DUE"].includes(sub.status);

  return (
    <>
      <PageHeader title="Abonnement" subtitle="Gérez votre offre Soonly." />

      {sp.checkout === "success" && <div className="mb-5 rounded-xl border border-ok/30 bg-ok-tint px-4 py-3 text-[13.5px] font-medium text-ok">Merci ! Votre abonnement est en cours d'activation.</div>}
      {sp.checkout === "cancel" && <div className="mb-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13.5px] text-ink-2">Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.</div>}

      {active ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-teal bg-surface p-6 shadow-s">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-sand"><ShieldCheck className="h-6 w-6" /></span>
            <div>
              <b className="text-[17px] tracking-[-0.006em]">Soonly {isPlus ? "Plus" : "Essentiel"}</b>
              <p className="text-[13.5px] text-ink-2">
                {STATUS_LABEL[sub!.status]}
                {sub!.currentPeriodEnd && ` · ${sub!.cancelAtPeriodEnd ? "se termine" : "renouvellement"} le ${format(sub!.currentPeriodEnd, "d MMMM yyyy", { locale: fr })}`}
              </p>
            </div>
          </div>
          <ManageButton />
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-line bg-surface-2 p-5 text-[14px] text-ink-2">
          Vous n'avez pas encore d'abonnement actif. Choisissez une offre ci-dessous — 7 jours d'essai gratuit, sans engagement.
        </div>
      )}

      {isPlus ? (
        <div className="rounded-xl border border-line bg-surface p-6 shadow-s">
          <b className="text-[15.5px] tracking-[-0.006em]">Votre offre Plus inclut</b>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {["Coffre documents chiffré", "Rappels SMS & WhatsApp", "Emails avancés", "Alertes de documents expirés", "Intégrations avancées", "Export & tags"].map((f) => (
              <span key={f} className="flex items-center gap-2 text-[13.5px] text-ink-2"><Check className="h-[16px] w-[16px] text-teal-soft" /> {f}</span>
            ))}
          </div>
        </div>
      ) : (
        <PricingCards
          essentielCta={{ label: active ? "Offre actuelle" : "Détails ci-dessous", variant: "disabled" }}
          plusCta={{ label: "Détails ci-dessous", variant: "disabled" }}
        />
      )}

      {/* CTA clients réels (les boutons Stripe passent par le client) */}
      {!isPlus && (
        <div className="mx-auto mt-8 max-w-[840px]">
          <h3 className="mb-3 text-center text-[15px] font-semibold tracking-[-0.006em]">Choisir une offre</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-4"><UpgradeButton plan="ESSENTIEL" label={active ? "Offre actuelle" : "Commencer avec Essentiel — 9,99 €"} variant="ghost" /></div>
            <div className="rounded-xl border border-teal bg-surface p-4"><UpgradeButton plan="PLUS" label="Passer à Plus — 14,99 €" variant="sand" /></div>
          </div>
          <p className="mt-3 text-center text-[12.5px] text-ink-3">Paiement sécurisé Stripe · 7 jours d'essai · résiliation en un clic.</p>
        </div>
      )}
    </>
  );
}
