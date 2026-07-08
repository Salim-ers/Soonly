"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Recherche compacte intégrée à la barre du haut. Capsule fine qui s'agrandit
 * au focus. Filtre les rappels via /reminders?q=…
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

  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

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
    <div
      className={`flex h-10 items-center gap-2 rounded-full border bg-surface-2 pl-3.5 pr-1.5 transition-all duration-300 ${
        focused ? "w-[300px] border-teal-soft shadow-m" : "w-[196px] border-line hover:border-line-strong"
      }`}
    >
      <Search className={`h-[16px] w-[16px] flex-none transition-colors ${focused ? "text-teal-soft" : "text-ink-3"}`} />
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
        placeholder="Rechercher…"
        aria-label="Rechercher une échéance"
        className="h-full w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-3"
      />
      {value ? (
        <button
          onClick={() => { setValue(""); inputRef.current?.focus(); }}
          aria-label="Effacer"
          className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-ink-3 hover:bg-teal-wash hover:text-teal"
        >
          <X className="h-[14px] w-[14px]" />
        </button>
      ) : (
        <kbd className="mr-1 hidden select-none items-center rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-3 lg:flex">
          ⌘K
        </kbd>
      )}
    </div>
  );
}
