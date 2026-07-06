import { getSessionUser, getActiveReminders } from "@/lib/queries";
import { PageHeader } from "@/components/app/ui";
import { QuickAddButton } from "@/components/app/quick-add";
import { CategoryDot } from "@/components/app/category-icon";
import { EmptyState } from "@/components/app/empty-state";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function CalendarPage() {
  const { user, plan } = await getSessionUser();
  const reminders = await getActiveReminders(user.id);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = new Map<number, typeof reminders>();
  for (const r of reminders) {
    const d = r.dueAt;
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      byDay.set(day, [...(byDay.get(day) ?? []), r]);
    }
  }

  const cells: Array<number | null> = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <PageHeader
        title="Calendrier"
        subtitle={`${MONTHS[month]} ${year}`}
        action={<QuickAddButton plan={plan} className="btn btn-lg"><Plus className="h-[18px] w-[18px]" /> Ajouter</QuickAddButton>}
      />
      {reminders.length === 0 ? (
        <EmptyState title="Votre calendrier est vide" description="Ajoutez des échéances pour les voir apparaître ici, mois par mois." cta={{ label: "Ajouter une date", href: "/reminders?new=1" }} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-s">
          <div className="grid grid-cols-7 border-b border-line bg-surface-2">
            {DOW.map((d) => <div key={d} className="px-3 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-3">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const items = day ? byDay.get(day) ?? [] : [];
              const isToday = day === now.getDate();
              return (
                <div key={i} className={`min-h-[104px] border-b border-r border-line p-2 last:border-r-0 ${day ? "" : "bg-surface-2/50"}`}>
                  {day && (
                    <>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12.5px] font-semibold ${isToday ? "bg-teal text-white" : "text-ink-2"}`}>{day}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        {items.slice(0, 3).map((r) => (
                          <div key={r.id} className="flex items-center gap-1.5 rounded-[7px] bg-bg px-1.5 py-1">
                            <CategoryDot category={r.category} />
                            <span className="truncate text-[11.5px] font-medium text-ink">{r.title}</span>
                          </div>
                        ))}
                        {items.length > 3 && <span className="pl-1 text-[11px] text-ink-3">+{items.length - 3}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
