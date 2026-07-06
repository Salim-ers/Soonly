"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, Link2, Unlink, Copy, Check } from "lucide-react";

async function post(path: string, body?: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return res.json().catch(() => ({}));
}

export function ConnectButton({ href, label = "Connecter" }: { href: string; label?: string }) {
  return <a href={href} className="btn h-9 rounded-[10px] px-3.5 text-[13px]"><Link2 className="h-4 w-4" /> {label}</a>;
}

export function SyncButton({ path }: { path: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <button
      onClick={async () => { setBusy(true); const r = await post(path); setBusy(false); setMsg(r.synced != null ? `${r.synced} événement(s)` : r.error ?? "Terminé"); router.refresh(); }}
      className="btn btn-ghost h-9 rounded-[10px] px-3.5 text-[13px]">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {msg ?? "Synchroniser"}
    </button>
  );
}

export function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => { setBusy(true); await post("/api/integrations/disconnect", { provider }); setBusy(false); router.refresh(); }}
      className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line px-3.5 text-[13px] font-semibold text-ink-2 hover:border-danger hover:text-danger">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />} Déconnecter
    </button>
  );
}

export function AppleSubscribe() {
  const [urls, setUrls] = useState<{ httpsUrl: string; webcalUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  async function load() {
    const res = await fetch("/api/integrations/apple/subscribe");
    setUrls(await res.json());
  }
  return (
    <div className="mt-1">
      {!urls ? (
        <button onClick={load} className="btn h-9 rounded-[10px] px-3.5 text-[13px]"><Link2 className="h-4 w-4" /> Obtenir mon lien d'abonnement</button>
      ) : (
        <div className="flex flex-col gap-2">
          <a href={urls.webcalUrl} className="btn btn-sand h-9 rounded-[10px] px-3.5 text-[13px]">Ajouter à Apple Calendar</a>
          <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-[12px] text-ink-2">{urls.httpsUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(urls.httpsUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex h-7 w-7 items-center justify-center rounded-[8px] text-ink-2 hover:bg-teal-wash hover:text-teal">
              {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
