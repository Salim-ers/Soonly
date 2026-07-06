import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Faq } from "@/components/marketing/faq";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Tarifs" };

export default function PricingPage() {
  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <div className="mx-auto max-w-[640px] text-center">
            <span className="kicker">Tarifs</span>
            <h1 className="disp mt-3.5 text-[clamp(30px,4vw,48px)] font-[560] leading-[1.1] text-teal">Deux offres. Rien de plus.</h1>
            <p className="mx-auto mt-4 max-w-[48ch] text-[16.5px] text-ink-2">
              Pas de plan gratuit déguisé, pas d'offre entreprise. Juste deux formules claires, avec 7 jours d'essai gratuit sur chacune.
            </p>
          </div>
          <div className="mt-12"><PricingCards /></div>
          <p className="mt-6 text-center text-[13.5px] text-ink-3">Prix TTC · Paiement sécurisé via Stripe · Résiliation en un clic.</p>
        </div>
      </section>
      <section className="border-t border-line bg-surface py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <h2 className="disp mb-12 text-center text-[clamp(24px,3vw,34px)] font-[560] text-teal">Questions fréquentes</h2>
          <Faq />
          <div className="mt-14 text-center">
            <Link href="/signup" className="btn btn-lg">Commencer avec Soonly <ArrowRight className="h-[18px] w-[18px]" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
