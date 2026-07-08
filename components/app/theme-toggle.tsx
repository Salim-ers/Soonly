"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Bascule clair / sombre. Deux formes :
 *  - "segmented" : contrôle Clair/Sombre avec curseur glissant.
 *  - "compact"   : bouton rond sun↔moon qui pivote (pour la barre du haut).
 * Le thème est appliqué sur <html class="dark"> et persisté (localStorage).
 * Crossfade doux via la classe `theme-anim` (voir globals.css).
 */
export function ThemeToggle({ variant = "segmented" }: { variant?: "segmented" | "compact" }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function set(next: boolean) {
    if (next === dark) return;
    setDark(next);
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("soonly-theme", next ? "dark" : "light");
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-anim"), 460);
  }

  if (!mounted) {
    return variant === "compact" ? (
      <div className="h-10 w-10 flex-none rounded-full border border-line bg-surface-2" aria-hidden />
    ) : (
      <div className="h-[46px] w-full rounded-[13px] border border-line bg-surface-2" aria-hidden />
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={() => set(!dark)}
        aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
        className="relative grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-ink-2 transition-colors hover:border-line-strong hover:text-teal"
      >
        <Sun
          className={`absolute h-[17px] w-[17px] transition-all duration-300 ${dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
        />
        <Moon
          className={`absolute h-[17px] w-[17px] transition-all duration-300 ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
        />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'interface"
      className="relative flex h-[46px] w-full items-center rounded-[13px] border border-line bg-surface-2 p-1.5"
    >
      <span
        aria-hidden
        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[10px] bg-teal shadow-s transition-[left] duration-300"
        style={{ left: dark ? "50%" : "6px", transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <button
        role="radio"
        aria-checked={!dark}
        onClick={() => set(false)}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[12.5px] font-semibold transition-colors ${!dark ? "text-on-teal" : "text-ink-2"}`}
      >
        <Sun className="h-[15px] w-[15px]" /> Clair
      </button>
      <button
        role="radio"
        aria-checked={dark}
        onClick={() => set(true)}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[12.5px] font-semibold transition-colors ${dark ? "text-on-teal" : "text-ink-2"}`}
      >
        <Moon className="h-[15px] w-[15px]" /> Sombre
      </button>
    </div>
  );
}
