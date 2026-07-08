import { Suspense } from "react";
import { getSessionUser, getActiveReminders, toClient } from "@/lib/queries";
import { categoryMeta } from "@/lib/constants";
import { PageHeader } from "@/components/app/ui";
import { ReminderList } from "@/components/app/reminder-list";
import { QuickAddAuto, QuickAddButton } from "@/components/app/quick-add";
import { EmptyState } from "@/components/app/empty-state";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RemindersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { user, plan } = await getSessionUser();
  const reminders = await getActiveReminders(user.id);
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const filtered = q
    ? reminders.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          categoryMeta(r.category).label.toLowerCase().includes(q),
      )
    : reminders;

  const count = filtered.length;
  const subtitle = q
    ? `${count} résultat${count > 1 ? "s" : ""} pour « ${q} »`
    : reminders.length
      ? `${reminders.length} échéance${reminders.length > 1 ? "s" : ""} active${reminders.length > 1 ? "s" : ""}.`
      : undefined;

  return (
    <>
      <Suspense><QuickAddAuto plan={plan} /></Suspense>
      <PageHeader
        title="Vos rappels"
        subtitle={subtitle}
        action={<QuickAddButton plan={plan} className="btn btn-lg"><Plus className="h-[18px] w-[18px]" /> Ajouter</QuickAddButton>}
      />
      {count ? (
        <ReminderList reminders={filtered.map(toClient)} />
      ) : q ? (
        <EmptyState
          title={`Aucun résultat pour « ${q} »`}
          description="Aucune échéance ne correspond à votre recherche. Essayez un autre mot-clé, une catégorie, ou effacez la recherche."
          cta={{ label: "Voir tous les rappels", href: "/reminders" }}
        />
      ) : (
        <EmptyState
          title="Aucun rappel pour l'instant"
          description="Créez votre première échéance : choisissez la date, les moments de rappel (J-30, J-7, J-1…) et les canaux. Soonly fait le reste."
          cta={{ label: "Créer une échéance", href: "/reminders?new=1" }}
        />
      )}
    </>
  );
}
