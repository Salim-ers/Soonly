"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, UploadCloud, Loader2, FileText } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function UploadButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>{children}</button>
      <UploadDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function UploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ADMIN");
  const [expiration, setExpiration] = useState("");
  const [linkReminder, setLinkReminder] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!file) return setError("Choisissez un fichier (PDF ou image).");
    if (!title.trim()) return setError("Donnez un titre au document.");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("meta", JSON.stringify({ title: title.trim(), category, expirationDate: expiration || undefined, createLinkedReminder: linkReminder && !!expiration, tags: [] }));
    setBusy(true);
    const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); return setError(d.error ?? "Envoi impossible."); }
    onClose(); router.refresh();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-teal-deep/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] w-full overflow-auto rounded-t-[22px] bg-surface p-6 shadow-l sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:p-7"
            initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 30, opacity: 0 }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}>
            <div className="mb-4 flex items-start justify-between">
              <div><h3 className="disp text-[20px] font-[560] text-teal">Ajouter un document</h3><p className="mt-1 text-[13px] text-ink-3">PDF ou image, jusqu'à 15 Mo. Stockage privé et chiffré.</p></div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-[11px] text-ink-2 hover:bg-teal-wash"><X className="h-5 w-5" /></button>
            </div>

            <div onClick={() => fileRef.current?.click()} className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-4 py-8 text-center hover:border-teal-soft">
              {file ? <><FileText className="h-7 w-7 text-teal" /><b className="text-[14px]">{file.name}</b><span className="text-[12px] text-ink-3">{(file.size / 1024 / 1024).toFixed(1)} Mo</span></>
                : <><UploadCloud className="h-7 w-7 text-ink-3" /><b className="text-[14px]">Choisir un fichier</b><span className="text-[12px] text-ink-3">PDF, JPG, PNG, WEBP</span></>}
              <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); } }} />
            </div>

            <div className="mb-4"><label className="field-label">Titre</label><input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Passeport" /></div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="mb-4"><label className="field-label">Catégorie</label><select className="inp" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
              <div className="mb-4"><label className="field-label">Expiration — optionnel</label><input type="date" className="inp" value={expiration} onChange={(e) => setExpiration(e.target.value)} /></div>
            </div>
            {expiration && (
              <label className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-[11px] border border-line bg-surface-2 px-3.5 py-3 text-[13.5px]">
                <input type="checkbox" checked={linkReminder} onChange={(e) => setLinkReminder(e.target.checked)} className="h-4 w-4 accent-teal" />
                Créer automatiquement des rappels avant l'expiration
              </label>
            )}
            {error && <p className="mb-3 text-[13px] font-medium text-danger">{error}</p>}
            <button className="btn btn-lg w-full" onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer au coffre"}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
