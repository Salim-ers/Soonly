"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FolderLock, Tag, Bell, CreditCard, Plus, User, Sparkles, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FolderLock },
  { href: "/reminders", label: "Rappels", icon: Bell },
  { href: "/integrations", label: "Intégrations", icon: Tag },
  { href: "/billing", label: "Abonnement", icon: CreditCard },
];

export function Sidebar({
  plan,
  trialDaysLeft,
  userName,
}: {
  plan: "ESSENTIEL" | "PLUS";
  trialDaysLeft: number | null;
  userName: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 z-40 hidden h-screen flex-col border-r border-line bg-surface px-4 pb-4 pt-6 md:flex md:w-[262px]">
      <div className="px-2.5 pb-5"><Link href="/dashboard"><Wordmark size={32} withTagline /></Link></div>
      <Link href="/reminders?new=1" className="btn mb-4 w-full justify-start px-3.5">
        <Plus className="h-[19px] w-[19px]" /> Nouvelle échéance
      </Link>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href;
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} className={cn(
              "relative flex h-[42px] items-center gap-3 rounded-[11px] px-3 text-[14px] font-semibold transition-colors",
              active ? "bg-teal-tint text-teal" : "text-ink-2 hover:bg-teal-wash hover:text-teal"
            )}>
              {active && <span className="absolute -left-4 bottom-2 top-2 w-[3px] rounded-r bg-teal" />}
              <Icon className="h-[19px] w-[19px]" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2.5">
        {plan === "ESSENTIEL" ? (
          <div className="rounded-[13px] border border-line bg-surface-2 p-3.5">
            <b className="flex items-center gap-2 text-[13px]"><Sparkles className="h-4 w-4 text-sand-deep" />
              {trialDaysLeft != null ? `Essai — ${trialDaysLeft} j restants` : "Offre Essentiel"}</b>
            <p className="my-2 text-[12px] leading-snug text-ink-2">Passez à Plus pour le coffre documents et les rappels SMS / WhatsApp.</p>
            <Link href="/billing" className="btn btn-sand h-9 w-full rounded-[10px] text-[13px]">Passer à Plus</Link>
          </div>
        ) : (
          <div className="rounded-[13px] border border-line bg-surface-2 p-3.5">
            <b className="flex items-center gap-2 text-[13px]"><ShieldCheck className="h-4 w-4 text-teal-soft" /> Soonly Plus actif</b>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-2">Coffre documents, SMS et WhatsApp inclus.</p>
          </div>
        )}
        <Link href="/settings" className="flex items-center gap-3 rounded-[12px] px-2.5 py-2.5 transition-colors hover:bg-teal-wash">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal text-[13px] font-bold text-sand">{initials(userName)}</span>
          <div className="min-w-0"><b className="block truncate text-[13.5px] leading-tight">{userName}</b>
            <span className="text-[11.5px] text-ink-3">{plan === "PLUS" ? "Soonly Plus" : "Soonly Essentiel"}</span></div>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendrier", icon: Calendar },
    { href: "/documents", label: "Documents", icon: FolderLock },
    { href: "/settings", label: "Profil", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-surface/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
      {items.slice(0, 2).map((n) => <Bn key={n.href} {...n} active={pathname === n.href} />)}
      <Link href="/reminders?new=1" className="relative flex flex-col items-center" aria-label="Ajouter">
        <span className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-bg bg-teal text-sand shadow-l"><Plus className="h-6 w-6" /></span>
        <span className="mt-7 text-[10.5px] font-semibold text-ink-3">Ajouter</span>
      </Link>
      {items.slice(2).map((n) => <Bn key={n.href} {...n} active={pathname === n.href} />)}
    </nav>
  );
}

function Bn({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link href={href} className={cn("flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-semibold", active ? "text-teal" : "text-ink-3")}>
      <Icon className="h-[21px] w-[21px]" /> {label}
    </Link>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "S";
}
