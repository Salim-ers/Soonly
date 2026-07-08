"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Loader2, Lock } from "lucide-react";
import { CATEGORIES, CHANNELS, TEMPLATES } from "@/lib/constants";
import type { Channel, OffsetUnit } from "@prisma/client";

const RULE_PRESETS: { label: string; value: number; unit: OffsetUnit }[] = [
  { label: "J-90", value: 90, unit: "DAY" }, { label: "J-60", value: 60, unit: "DAY" },
  { label: "J-30", value: 30, unit: "DAY" }, { label: "J-14", value: 14, unit: "DAY" },
  { label: "J-7", value: 7, unit: "DAY" }, { label: "J-3", value: 3, unit: "DAY" },
  { label: "J-1", value: 1, unit: "DAY" }, { label: "Le jour même", value: 0, unit: "DAY" },
];

export function QuickAddButton({ plan, className, children, template }: { plan: "ESSENTIEL" | "PLUS"; className?: string; children: React.ReactNode; template?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>{children}</button>
      <QuickAddDialog plan={plan} open={open} onClose={() => setOpen(false)} initialTemplate={template} />
    </>
  );
}

/** Ouvre automatiquement le dialogue si l'URL contient ?new=1. */
export function QuickAddAuto({ plan }: { plan: "ESSENTIEL" | "PLUS" }) {
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);
  return <QuickAddDialog plan={plan} open={open} onClose={() => { setOpen(false); router.replace(window.location.pathname); }} />;
}

function QuickAddDialog({ plan, open, onClose, initialTemplate }: { plan: "ESSENTIEL" | "PLUS"; open: boolean; onClose: () => void; initialTemplate?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("ADMIN");
  const [recurrence, setRecurrence] = useState<"NONE" | "MONTHLY" | "YEARLY">("NONE");
  const [rules, setRules] = useState<Set<number>>(new Set([30, 7, 1]));
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["EMAIL", "PUSH"]));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { reset(); return; }
    if (initialTemplate) applyTemplate(initialTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  function reset() {
    setTitle(""); setDate(""); setTime(""); setCategory("ADMIN"); setRecurrence("NONE");
    setRules(new Set([30, 7, 1])); setChannels(new Set(["EMAIL", "PUSH"])); setNotes(""); setError(null);
  }

  function applyTemplate(name: string) {
    const t = TEMPLATES.find((x) => x.title === name); if (!t) return;
    setTitle(t.title); setCategory(t.category); setRecurrence(t.recurrence);
    setRules(new Set(t.rules));
    const d = new Date(); d.setDate(d.getDate() + t.offsetDays);
    setDate(d.toISOString().slice(0, 10));
  }

  function toggleChannel(ch: Channel) {
    const cm = CHANNELS.find((c) => c.id === ch)!;
    if (cm.plusOnly && plan !== "PLUS") { setError(`Les rappels ${cm.label} sont inclus dans Soonly Plus.`); return; }
    setChannels((prev) => { const n = new Set(prev); n.has(ch) ? n.delete(ch) : n.add(ch); return n; });
  }

  async function submit() {
    setError(null);
    if (!title.trim()) return setError("Donnez un titre à votre échéance.");
    if (!date) return setError("Choisissez une date.");
    if (channels.size === 0) return setError("Ajoutez au moins un canal de rappel.");
    if (rules.size === 0) return setError("Choisissez au moins un moment de rappel (J-7, J-1…).");

    const dueAt = new Date(date + (time ? `T${time}` : "T09:00")).toISOString();
    const ruleObjs = [...rules].flatMap((v) => [...channels].map((channel) => ({ offsetValue: v, offsetUnit: "DAY" as OffsetUnit, channel, enabled: true })));

    setSaving(true);
    const res = await fetch("/api/reminders/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: notes.trim() || undefined, category, dueAt, allDay: !time, recurrence, rules: ruleObjs }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); return setError(d.error ?? "Enregistrement impossible."); }
    onClose(); router.refresh();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-teal-deep/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 max-h-[92vh] w-full overflow-auto rounded-t-[22px] bg-surface p-6 shadow-l sm:max-h-[86vh] sm:w-[560px] sm:rounded-[24px] sm:p-7"
            initial={{ y: 40, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="disp text-[20px] font-[560] text-teal">Ajouter une date importante</h3>
                <p className="mt-1 text-[13px] text-ink-3">Moins de vingt secondes, promis.</p>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-[11px] text-ink-2 hover:bg-teal-wash"><X className="h-5 w-5" /></button>
            </div>

            <div className="mb-4">
              <span className="kicker text-[10.5px]">Modèles</span>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {TEMPLATES.slice(0, 8).map((t) => (
                  <button key={t.title} onClick={() => applyTemplate(t.title)} className="h-[34px] whitespace-nowrap rounded-[11px] border border-line bg-surface px-3.5 text-[12.5px] font-semibold text-ink-2 hover:border-line-strong">{t.title}</button>
                ))}
              </div>
            </div>

            <Field label="Titre">
              <input className="inp" placeholder="Ex. : Contrôle technique de la voiture" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Date"><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label="Heure — optionnel"><input type="time" className="inp" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Catégorie">
                <select className="inp" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Récurrence">
                <select className="inp" value={recurrence} onChange={(e) => setRecurrence(e.target.value as "NONE" | "MONTHLY" | "YEARLY")}>
                  <option value="NONE">Aucune</option><option value="MONTHLY">Mensuelle</option><option value="YEARLY">Annuelle</option>
                </select>
              </Field>
            </div>
            <Field label="Rappels">
              <div className="flex flex-wrap gap-2">
                {RULE_PRESETS.map((r) => {
                  const on = rules.has(r.value);
                  return <button key={r.label} onClick={() => setRules((p) => { const n = new Set(p); n.has(r.value) ? n.delete(r.value) : n.add(r.value); return n; })}
                    className={`h-[38px] rounded-[11px] border px-[15px] text-[13.5px] font-semibold ${on ? "border-teal bg-teal-wash text-teal" : "border-line bg-surface text-ink-2"}`}>{r.label}</button>;
                })}
              </div>
            </Field>
            <Field label="Canaux de rappel">
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((ch) => {
                  const on = channels.has(ch.id);
                  const locked = ch.plusOnly && plan !== "PLUS";
                  return (
                    <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                      className={`inline-flex h-[38px] items-center gap-1.5 rounded-[11px] border px-[15px] text-[13.5px] font-semibold ${on ? "border-teal bg-teal text-[#EFF6F5]" : "border-line bg-surface text-ink-2"}`}>
                      {locked && <Lock className="h-[15px] w-[15px]" />}{ch.label}
                      {ch.plusOnly && <span className="rounded bg-sand px-1.5 text-[9.5px] font-bold uppercase text-[#3C2E10]">Plus</span>}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Notes — optionnel">
              <textarea className="inp min-h-[80px] py-3 leading-relaxed" placeholder="Numéro de dossier, adresse, personne à contacter…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            {error && <p className="mb-3 text-[13px] font-medium text-danger">{error}</p>}
            <button className="btn btn-lg w-full" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-[18px] w-[18px]" /> Protéger cette échéance</>}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4"><label className="field-label">{label}</label>{children}</div>;
}
