"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Mail, FileText, RefreshCw, HeartPulse, Car, Bell, ShieldCheck } from "lucide-react";

type Source = {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  from: { x: number; y: number; r: number };
  badge: string;
  badgeClass: string;
};

/** Cartes venant de sources dispersées → elles convergent vers la timeline. */
const SOURCES: Source[] = [
  { icon: <Calendar />, label: "Contrôle technique", sub: "Google Agenda", color: "#56788A", from: { x: -150, y: -70, r: -12 }, badge: "J-7", badgeClass: "bg-sand-tint text-sand-ink" },
  { icon: <HeartPulse />, label: "Rendez-vous médical", sub: "Agenda iPhone", color: "#B4664A", from: { x: 160, y: -90, r: 10 }, badge: "Demain", badgeClass: "bg-urgent-tint text-urgent" },
  { icon: <RefreshCw />, label: "Fin d'essai gratuit", sub: "Email", color: "#B45309", from: { x: -180, y: 60, r: 8 }, badge: "Aujourd'hui", badgeClass: "bg-urgent-tint text-urgent" },
  { icon: <FileText />, label: "Passeport", sub: "Document PDF", color: "#0D3B46", from: { x: 175, y: 70, r: -9 }, badge: "J-30", badgeClass: "bg-teal-tint text-teal" },
  { icon: <ShieldCheck />, label: "Assurance habitation", sub: "Abonnement", color: "#2BA39A", from: { x: -120, y: 130, r: -6 }, badge: "J-30", badgeClass: "bg-teal-tint text-teal" },
  { icon: <Car />, label: "Garantie lave-linge", sub: "Facture", color: "#2F7A5B", from: { x: 130, y: 150, r: 11 }, badge: "J-60", badgeClass: "bg-bg-deep text-ink-2" },
];

export function HeroChaosToOrder() {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Anneau de temps */}
      <div className="pointer-events-none absolute inset-6 rounded-full border border-sand/50" />
      <span className="absolute right-[16%] top-[9%] h-3 w-3 rounded-full bg-sand" />

      {/* Cartes sources qui convergent vers le centre (la timeline) */}
      {SOURCES.map((s, i) => (
        <motion.div
          key={s.label}
          className="absolute left-1/2 top-1/2 w-[210px] -translate-x-1/2 -translate-y-1/2"
          initial={reduced ? false : { x: s.from.x, y: s.from.y, rotate: s.from.r, opacity: 0, scale: 0.92 }}
          animate={{ x: 0, y: -104 + i * 34, rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{ zIndex: 10 + i }}
        >
          <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-2.5 shadow-m">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-white [&_svg]:h-[18px] [&_svg]:w-[18px]" style={{ background: s.color }}>
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] font-semibold tracking-[-0.005em]">{s.label}</b>
              <span className="text-[11.5px] text-ink-3">{s.sub}</span>
            </div>
            <span className={`badge ${s.badgeClass} h-[22px] px-2 text-[11px]`}>{s.badge}</span>
          </div>
        </motion.div>
      ))}

      {/* Ligne verticale « timeline Soonly » qui apparaît sous les cartes */}
      <motion.div
        className="absolute left-1/2 top-[14%] w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-teal via-teal-soft to-sand"
        initial={reduced ? false : { height: 0, opacity: 0 }}
        animate={{ height: "72%", opacity: 0.9 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
      />

      {/* Toast rappel */}
      <motion.div
        className="absolute -bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-[15px] bg-teal px-4 py-3 text-[#EFF6F5] shadow-l"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-sand/20 text-sand [&_svg]:h-[17px] [&_svg]:w-[17px]">
          <Bell />
        </span>
        <div>
          <b className="block text-[12.5px] font-bold">Rappel envoyé</b>
          <span className="text-[11.5px] text-[#BFD4D3]">Contrôle technique — dans 7 jours</span>
        </div>
      </motion.div>
    </div>
  );
}
