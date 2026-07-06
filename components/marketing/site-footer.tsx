import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-content px-5 pb-12 pt-14 sm:px-7">
      <div className="flex flex-wrap items-start justify-between gap-9">
        <div className="max-w-[30ch]">
          <Wordmark size={34} withTagline />
          <p className="mt-3.5 text-[13.5px] text-ink-2">Le coffre intelligent de vos échéances personnelles.</p>
        </div>
        <div className="flex flex-wrap gap-9">
          <div>
            <b className="mb-2 block text-[12px] uppercase tracking-[0.1em] text-ink-3">Produit</b>
            <a href="#solution" className="block py-1 text-[14px] text-ink-2 hover:text-teal">Comment ça marche</a>
            <a href="#integrations" className="block py-1 text-[14px] text-ink-2 hover:text-teal">Intégrations</a>
            <Link href="/pricing" className="block py-1 text-[14px] text-ink-2 hover:text-teal">Tarifs</Link>
          </div>
          <div>
            <b className="mb-2 block text-[12px] uppercase tracking-[0.1em] text-ink-3">Confiance</b>
            <Link href="/privacy" className="block py-1 text-[14px] text-ink-2 hover:text-teal">Confidentialité & sécurité</Link>
            <Link href="/login" className="block py-1 text-[14px] text-ink-2 hover:text-teal">Se connecter</Link>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-[13px] text-ink-3">
        <span>© 2026 Soonly — Fait avec soin en Europe.</span>
        <span>Never miss what matters.</span>
      </div>
    </footer>
  );
}
