import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <Wordmark size={40} />
      <h1 className="disp mt-8 text-[30px] font-[560] text-teal">Page introuvable</h1>
      <p className="mt-2 max-w-[42ch] text-[15px] text-ink-2">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="btn btn-lg mt-6">Retour à l'accueil</Link>
    </div>
  );
}
