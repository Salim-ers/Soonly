"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Recherche flottante « atypique » : pilule centrée en haut de la zone de contenu,
 * qui s'agrandit au focus. Filtre les rappels via /reminders?q=…
 *  - Frappe → filtrage en direct si déjà sur /reminders.
 *  - Entrée → ouvre /reminders filtré depuis n'importe quelle page.
 *  - ⌘K / Ctrl+K → focus ; Échap → efface.
 */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronise le champ avec l'URL (ex. arrivée directe sur /reminders?q=).
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  // Raccourci clavier.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filtrage en direct quand on est déjà sur la page Rappels.
  useEffect(() => {
    if (pathname !== "/reminders") return;
    const q = value.trim();
    const t = setTimeout(() => {
      router.replace(q ? `/reminders?q=${encodeURIComponent(q)}` : "/reminders");
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname]);

  function submit() {
    const q = value.trim();
    router.push(q ? `/reminders?q=${encodeURIComponent(q)}` : "/reminders");
    inputRef.current?.blur();
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3.5 z-40 hidden justify-center px-4 md:left-[262px] md:flex">
      <div
        className={`pointer-events-auto flex items-center gap-2.5 rounded-full border bg-surface/85 pl-4 pr-2 backdrop-blur-md transition-all duration-300 ${
          focused
            ? "w-full max-w-[520px] border-teal-soft shadow-l"
            : "w-full max-w-[340px] border-line shadow-s hover:border-line-strong"
        }`}
      >
        <Search className={`h-[17px] w-[17px] flex-none transition-colors ${focused ? "text-teal-soft" : "text-ink-3"}`} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") { setValue(""); inputRef.current?.blur(); }
          }}
          placeholder="Rechercher une échéance…"
          aria-label="Rechercher une échéance"
          className="h-[44px] w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
        />
        {value ? (
          <button
            onClick={() => { setValue(""); inputRef.current?.focus(); }}
            aria-label="Effacer"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-ink-3 hover:bg-teal-wash hover:text-teal"
          >
            <X className="h-[15px] w-[15px]" />
          </button>
        ) : (
          <kbd className="mr-1 hidden select-none items-center gap-0.5 rounded-md border border-line px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-3 sm:flex">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
