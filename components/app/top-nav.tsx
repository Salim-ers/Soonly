"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { LayoutDashboard, Calendar, FolderLock, Bell, Tag, CreditCard, Plus } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SearchBar } from "@/components/app/search-bar";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FolderLock },
  { href: "/reminders", label: "Rappels", icon: Bell },
  { href: "/integrations", label: "Intégrations", icon: Tag },
  { href: "/billing", label: "Abonnement", icon: CreditCard },
];

const TILE = 34; // taille au repos (fine)
const PEAK = 1.5; // facteur de grossissement au survol
const SPRING = { stiffness: 200, damping: 18, mass: 0.4 } as const; // ressort soyeux

export function TopNav({ userName }: { userName: string }) {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden h-[84px] grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line bg-surface/60 px-6 backdrop-blur-2xl md:grid">
      <Link href="/dashboard" className="justify-self-start" aria-label="Soonly — tableau de bord">
        <Wordmark size={27} />
      </Link>

      {/* Dock magnétique façon macOS — capsule, icônes fluides + noms visibles */}
      <nav
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-1.5 justify-self-center rounded-[28px] border border-line bg-surface-2/70 px-3.5 py-2 shadow-l backdrop-blur-2xl"
        style={{ boxShadow: "0 10px 40px -12px rgba(13,59,70,0.28), inset 0 1px 0 rgba(255,255,255,0.14)" }}
      >
        <DockItem mouseX={mouseX} href="/reminders?new=1" label="Nouveau" Icon={Plus} accent />
        <span className="mx-1 h-8 w-px self-center bg-line" />
        {NAV.map((n) => (
          <DockItem key={n.href} mouseX={mouseX} href={n.href} label={n.label} Icon={n.icon} active={pathname === n.href} />
        ))}
      </nav>

      <div className="flex items-center justify-self-end gap-2.5">
        <SearchBar />
        <ThemeToggle variant="compact" />
        <Link
          href="/settings"
          aria-label="Profil et réglages"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal text-[13px] font-bold text-sand transition-transform hover:scale-105"
        >
          {initials(userName)}
        </Link>
      </div>
    </header>
  );
}

function DockItem({
  mouseX,
  href,
  label,
  Icon,
  active = false,
  accent = false,
}: {
  mouseX: MotionValue<number>;
  href: string;
  label: string;
  Icon: React.ElementType;
  active?: boolean;
  accent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const scaleSync = useTransform(distance, [-150, 0, 150], [1, PEAK, 1]);
  const scale = useSpring(scaleSync, SPRING);
  const liftSync = useTransform(distance, [-150, 0, 150], [0, -5, 0]);
  const lift = useSpring(liftSync, SPRING);

  return (
    <Link href={href} aria-label={label} className="group flex flex-col items-center gap-[7px] px-1.5">
      <div ref={ref} className="grid place-items-center" style={{ width: TILE, height: TILE }}>
        <motion.span
          style={{ scale, y: lift }}
          className={cn(
            "grid h-full w-full origin-center place-items-center rounded-[11px] shadow-s transition-colors duration-200",
            accent
              ? "bg-teal text-on-teal"
              : active
                ? "bg-teal-tint text-teal ring-1 ring-teal-soft/40"
                : "bg-surface text-ink-2 group-hover:text-teal",
          )}
        >
          <Icon className="h-[54%] w-[54%]" strokeWidth={2} />
        </motion.span>
      </div>
      <span
        className={cn(
          "text-[10.5px] font-medium leading-none tracking-[-0.01em] transition-colors",
          active ? "text-teal" : "text-ink-3 group-hover:text-ink-2",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "S";
}
