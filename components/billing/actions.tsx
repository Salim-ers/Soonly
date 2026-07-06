"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

async function redirectTo(path: string, body?: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (data.url) window.location.href = data.url;
  else alert(data.error ?? "Action indisponible. Vérifiez la configuration Stripe.");
}

export function UpgradeButton({ plan, label, variant = "primary" }: { plan: "ESSENTIEL" | "PLUS"; label: string; variant?: "primary" | "sand" | "ghost" }) {
  const [busy, setBusy] = useState(false);
  const cls = variant === "sand" ? "btn btn-sand w-full" : variant === "ghost" ? "btn btn-ghost w-full" : "btn w-full";
  return (
    <button className={cls} disabled={busy} onClick={async () => { setBusy(true); await redirectTo("/api/stripe/checkout", { plan }); setBusy(false); }}>
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
    </button>
  );
}

export function ManageButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button className="btn btn-ghost" disabled={busy} onClick={async () => { setBusy(true); await redirectTo("/api/stripe/portal"); setBusy(false); }}>
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gérer mon abonnement"}
    </button>
  );
}
