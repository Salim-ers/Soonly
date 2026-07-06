"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download, Trash2 } from "lucide-react";

type Prefs = { name: string; consentEmail: boolean; consentPush: boolean; consentSms: boolean; consentWhatsapp: boolean; hideSensitive: boolean; phoneVerified: boolean; plan: "ESSENTIEL" | "PLUS" };

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-t border-line py-3.5 first:border-t-0 ${disabled ? "opacity-55" : ""}`}>
      <div><b className="block text-[14px] tracking-[-0.005em]">{label}</b>{hint && <span className="text-[12.5px] text-ink-3">{hint}</span>}</div>
      <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative h-[26px] w-[46px] flex-none rounded-full transition-colors ${checked ? "bg-teal" : "bg-line-strong"}`}>
        <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[23px]" : "left-[3px]"}`} />
      </button>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: Prefs }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(patch: Partial<Prefs>) {
    const next = { ...p, ...patch };
    setP(next);
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  async function del() {
    if (!confirm("Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.")) return;
    await fetch("/api/account/delete", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Profil">
        <label className="field-label">Nom affiché</label>
        <div className="flex gap-2">
          <input className="inp" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} onBlur={() => save({ name: p.name })} />
        </div>
        <p className="mt-2 text-[12.5px] text-ink-3">{saving ? "Enregistrement…" : saved ? "Enregistré ✓" : "Les modifications sont enregistrées automatiquement."}</p>
      </Card>

      <Card title="Canaux de rappel">
        <Toggle label="Email" hint="Rappels et liens de connexion" checked={p.consentEmail} onChange={(v) => save({ consentEmail: v })} />
        <Toggle label="Notifications push" hint="Sur cet appareil et vos appareils installés" checked={p.consentPush} onChange={(v) => save({ consentPush: v })} />
        <Toggle label="SMS" hint={p.plan === "PLUS" ? (p.phoneVerified ? "Numéro vérifié" : "Vérifiez votre numéro pour activer") : "Inclus dans Soonly Plus"} checked={p.consentSms} onChange={(v) => save({ consentSms: v })} disabled={p.plan !== "PLUS"} />
        <Toggle label="WhatsApp" hint={p.plan === "PLUS" ? "Consentement explicite requis" : "Inclus dans Soonly Plus"} checked={p.consentWhatsapp} onChange={(v) => save({ consentWhatsapp: v })} disabled={p.plan !== "PLUS"} />
      </Card>

      <Card title="Confidentialité">
        <Toggle label="Masquer les titres sensibles" hint="Les SMS/WhatsApp deviennent neutres : « une échéance approche »" checked={p.hideSensitive} onChange={(v) => save({ hideSensitive: v })} />
      </Card>

      <Card title="Vos données">
        <div className="flex flex-wrap gap-2.5">
          <a href="/api/account/export" className="btn btn-ghost h-10"><Download className="h-[17px] w-[17px]" /> Exporter mes données</a>
          <button onClick={del} className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-danger/40 bg-danger-tint px-4 text-[14px] font-semibold text-danger hover:bg-danger/15"><Trash2 className="h-[17px] w-[17px]" /> Supprimer mon compte</button>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-s">
      <h2 className="mb-3 text-[15.5px] font-semibold tracking-[-0.006em]">{title}</h2>
      {children}
    </div>
  );
}
