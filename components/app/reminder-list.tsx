"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Check, RefreshCw, Trash2, Paperclip, AlertTriangle, Loader2 } from "lucide-react";
import { categoryMeta, CHANNELS } from "@/lib/constants";
import type { ClientReminder } from "@/types";

function daysUntil(iso: string) {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}
function badge(iso: string) {
  const n = daysUntil(iso);
  if (n < 0) return { cls: "bg-danger-tint text-danger", label: "Dépassée", dot: false };
  if (n === 0) return { cls: "bg-urgent-tint text-urgent", label: "Aujourd'hui", dot: true };
  if (n === 1) return { cls: "bg-urgent-tint text-urgent", label: "Demain", dot: true };
  if (n <= 7) return { cls: "bg-sand-tint text-sand-ink", label: `J-${n}`, dot: false };
  if (n <= 30) return { cls: "bg-teal-tint text-teal", label: `J-${n}`, dot: false };
  return { cls: "bg-bg-deep text-ink-2", label: `J-${n}`, dot: false };
}
const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export function ReminderList({ reminders, onOpenDetail }: { reminders: ClientReminder[]; onOpenDetail?: (r: ClientReminder) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(path: string, body: unknown, id: string) {
    setBusy(id);
    await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(null);
    router.refresh();
  }
  const done = (r: ClientReminder) => act("/api/reminders/update", { id: r.id, status: "DONE" }, r.id);
  const snooze = (r: ClientReminder) => {
    const next = new Date(r.dueAt); next.setDate(next.getDate() + 7);
    act("/api/reminders/update", { id: r.id, dueAt: next.toISOString() }, r.id);
  };
  const remove = (r: ClientReminder) => act("/api/reminders/delete", { id: r.id }, r.id);

  return (
    <div className="flex flex-col gap-2.5">
      {reminders.map((r) => {
        const meta = categoryMeta(r.category);
        const Icon = (Icons as Record<string, Icons.LucideIcon>)[meta.icon] ?? Icons.Tag;
        const b = badge(r.dueAt);
        const incomplete = r.rules.length === 0;
        return (
          <div key={r.id} onClick={() => onOpenDetail?.(r)}
            className="group flex cursor-pointer items-center gap-4 rounded-lg border border-line bg-surface px-4 py-3.5 transition-shadow hover:border-line-strong hover:shadow-m">
            <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] text-white" style={{ background: meta.color }}>
              <Icon className="h-[19px] w-[19px]" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[15px] font-semibold tracking-[-0.006em]">{r.title}</b>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
                <span>{meta.label}</span><span className="h-[3px] w-[3px] rounded-full bg-line-strong" />
                <span>{fmt(r.dueAt)}</span>
                {r.rules.length > 0 && (
                  <><span className="h-[3px] w-[3px] rounded-full bg-line-strong" />
                    <span className="inline-flex gap-1.5">
                      {[...new Set(r.rules.map((x) => x.channel))].map((ch) => {
                        const cm = CHANNELS.find((c) => c.id === ch);
                        const CI = (Icons as Record<string, Icons.LucideIcon>)[cm?.icon ?? "Bell"] ?? Icons.Bell;
                        return <CI key={ch} className="h-[14px] w-[14px]" />;
                      })}
                    </span></>
                )}
                {r.hasDocument && <><span className="h-[3px] w-[3px] rounded-full bg-line-strong" /><span className="inline-flex items-center gap-1 font-semibold text-teal"><Paperclip className="h-[13px] w-[13px]" />Document</span></>}
                {incomplete && <><span className="h-[3px] w-[3px] rounded-full bg-line-strong" /><span className="inline-flex items-center gap-1 font-semibold text-urgent"><AlertTriangle className="h-[13px] w-[13px]" />Ajouter un rappel</span></>}
              </div>
            </div>
            <div className="flex flex-none items-center gap-3">
              <div className="hidden gap-0.5 group-hover:flex" onClick={(e) => e.stopPropagation()}>
                {busy === r.id ? <span className="flex h-[34px] w-[34px] items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-ink-3" /></span> : <>
                  <button onClick={() => done(r)} title="Terminé" className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-ink-2 transition-colors hover:bg-teal-wash hover:text-teal"><Check className="h-[17px] w-[17px]" /></button>
                  <button onClick={() => snooze(r)} title="Reporter +7 j" className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-ink-2 transition-colors hover:bg-teal-wash hover:text-teal"><RefreshCw className="h-[17px] w-[17px]" /></button>
                  <button onClick={() => remove(r)} title="Supprimer" className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-ink-2 transition-colors hover:bg-danger-tint hover:text-danger"><Trash2 className="h-[17px] w-[17px]" /></button>
                </>}
              </div>
              <span className={`badge ${b.cls}`}>{b.dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{b.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
