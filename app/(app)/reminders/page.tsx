import { Suspense } from "react";
import { getSessionUser, getActiveReminders, toClient } from "@/lib/queries";
import { PageHeader } from "@/components/app/ui";
import { ReminderList } from "@/components/app/reminder-list";
import { QuickAddAuto, QuickAddButton } from "@/components/app/quick-add";
import { EmptyState } from "@/components/app/empty-state";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const { user, plan } = await getSessionUser();
  const reminders = await getActiveReminders(user.id);

  return (
    <>
      <Suspense><QuickAddAuto plan={plan} /></Suspense>
      <PageHeader
        title="Vos rappels"
        subtitle={reminders.length ? `${reminders.length} échéance${reminders.length > 1 ? "s" : ""} active${reminders.length > 1 ? "s" : ""}.` : undefined}
        action={<QuickAddButton plan={plan} className="btn btn-lg"><Plus className="h-[18px] w-[18px]" /> Ajouter</QuickAddButton>}
      />
      {reminders.length ? (
        <ReminderList reminders={reminders.map(toClient)} />
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
