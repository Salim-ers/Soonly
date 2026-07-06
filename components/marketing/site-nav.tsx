import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-[70px] max-w-content items-center gap-8 px-5 sm:px-7">
        <Link href="/"><Wordmark size={32} /></Link>
        <div className="ml-3 hidden gap-1 md:flex">
          {[
            ["Le problème", "#probleme"],
            ["La solution", "#solution"],
            ["Intégrations", "#integrations"],
            ["L'app", "#produit"],
            ["Tarifs", "#tarifs"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-[9px] px-3 py-2 text-[14px] font-semibold text-ink-2 transition-colors hover:bg-teal-wash hover:text-teal">
              {label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <Link href="/login" className="hidden rounded-[10px] px-3 py-2 text-[14px] font-semibold text-ink-2 transition-colors hover:text-teal sm:block">
            Se connecter
          </Link>
          <Link href="/signup" className="btn">Commencer</Link>
        </div>
      </div>
    </nav>
  );
}
