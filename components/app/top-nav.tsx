"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
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

const BASE = 34; // taille au repos (fin, petit)
const PEAK = 58; // taille au survol (loupe)

export function TopNav({ userName }: { userName: string }) {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden h-[68px] items-center justify-between gap-4 border-b border-line bg-surface/65 px-5 backdrop-blur-xl md:flex">
      <Link href="/dashboard" className="flex-none" aria-label="Soonly — tableau de bord">
        <Wordmark size={27} />
      </Link>

      {/* Dock magnétique façon macOS — capsule fine, icônes qui grossissent au survol */}
      <motion.nav
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-end gap-2 rounded-full border border-line bg-surface-2/85 px-3 py-2 shadow-m backdrop-blur-xl"
      >
        <DockItem mouseX={mouseX} href="/reminders?new=1" label="Nouvelle échéance" Icon={Plus} accent />
        <span className="mb-1 h-6 w-px self-center bg-line" />
        {NAV.map((n) => (
          <DockItem key={n.href} mouseX={mouseX} href={n.href} label={n.label} Icon={n.icon} active={pathname === n.href} />
        ))}
      </motion.nav>

      <div className="flex flex-none items-center gap-2.5">
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
  const [hover, setHover] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const sizeSync = useTransform(distance, [-120, 0, 120], [BASE, PEAK, BASE]);
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 170, damping: 13 });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="relative flex items-center justify-center"
    >
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full transition-colors",
          accent
            ? "bg-teal text-on-teal shadow-s"
            : active
              ? "bg-teal-tint text-teal ring-1 ring-teal-soft/40"
              : "bg-surface text-ink-2 hover:text-teal",
        )}
      >
        <Icon className="h-1/2 w-1/2" strokeWidth={2} />
      </Link>

      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-teal px-2.5 py-1 text-[11px] font-semibold text-on-teal shadow-l"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "S";
}
