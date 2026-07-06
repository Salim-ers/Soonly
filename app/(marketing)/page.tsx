"use client";

import Link from "next/link";
import {
  Calendar, Mail, MessageSquare, FileText, Smartphone, StickyNote,
  RefreshCw, CalendarX, Award, Clock, Receipt,
  Plus, Link2, BellRing, FolderLock, Search,
  ShieldCheck, Download, SlidersHorizontal, Trash2, EyeOff,
  ArrowRight, Check,
} from "lucide-react";
import { HeroChaosToOrder } from "@/components/marketing/hero-chaos-to-order";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Faq } from "@/components/marketing/faq";
import { Reveal, RevealGroup, revealItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{
          background:
            "radial-gradient(560px 420px at 82% 8%, rgba(226,196,139,.20), transparent 62%), radial-gradient(640px 520px at 6% 92%, rgba(43,163,154,.10), transparent 60%)",
        }} />
        <div className="relative mx-auto grid max-w-content items-center gap-14 px-5 pb-24 pt-16 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
          <div>
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[12.5px] font-semibold text-ink-2 shadow-s">
              <span className="h-2 w-2 rounded-full bg-teal-soft" />
              Agenda, email, documents : réunis au même endroit
            </span>
            <h1 className="disp mt-5 max-w-[15ch] text-[clamp(34px,4.6vw,58px)] font-[560] leading-[1.05] text-teal">
              Vos dates importantes sont partout. <span className="text-sand-deep">Soonly les garde au même endroit.</span>
            </h1>
            <p className="mt-5 max-w-[48ch] text-[17.5px] leading-relaxed text-ink-2">
              Rendez-vous, papiers, abonnements, garanties, documents : Soonly vous prévient avant qu'il ne soit trop tard.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn btn-lg">Protéger mes premières dates</Link>
              <a href="#integrations" className="btn btn-ghost btn-lg">Voir les intégrations</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-ink-3">
              <span className="inline-flex items-center gap-2"><Check className="h-[15px] w-[15px] text-teal-soft" />7 jours d'essai gratuit</span>
              <span className="inline-flex items-center gap-2"><Check className="h-[15px] w-[15px] text-teal-soft" />Sans engagement</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-[15px] w-[15px] text-teal-soft" />Données chiffrées, hébergées en Europe</span>
            </div>
          </div>
          <HeroChaosToOrder />
        </div>
      </header>

      {/* ---------------- 1. PROBLÈME ---------------- */}
      <section id="probleme" className="border-y border-line bg-surface py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="max-w-[720px]">
            <span className="kicker">Le problème</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">
              On n'oublie pas parce qu'on est désorganisé. On oublie parce que tout est dispersé.
            </h2>
            <p className="mt-3.5 max-w-[54ch] text-[16.5px] text-ink-2">
              Une date vit dans l'agenda, une autre dans un email, une troisième sur un bout de papier. Aucune vue d'ensemble, et c'est là que ça coince.
            </p>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Calendar />, src: "Agenda", ex: "Contrôle technique noté il y a six mois, jamais revu." },
              { icon: <Mail />, src: "Email", ex: "Fin d'essai gratuit enfouie sous 200 messages non lus." },
              { icon: <MessageSquare />, src: "SMS", ex: "Rappel de rendez-vous médical, perdu dans le fil." },
              { icon: <FileText />, src: "Documents PDF", ex: "Passeport dont la date d'expiration dort dans un dossier." },
              { icon: <Smartphone />, src: "Applications", ex: "Assurance et abonnements éparpillés dans dix apps." },
              { icon: <StickyNote />, src: "Papier", ex: "Facture annuelle et garantie sur un post-it décollé." },
            ].map((s) => (
              <motion.div key={s.src} variants={revealItem} className="rounded-lg border border-line bg-surface-2 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-teal-wash text-teal [&_svg]:h-[18px] [&_svg]:w-[18px]">{s.icon}</span>
                  <b className="text-[15px] tracking-[-0.005em]">{s.src}</b>
                </div>
                <p className="text-[13.5px] leading-relaxed text-ink-2">{s.ex}</p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------- 2. CONSÉQUENCES ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="max-w-[640px]">
            <span className="kicker">Les conséquences</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">Un oubli peut coûter cher.</h2>
            <p className="mt-3.5 max-w-[52ch] text-[16.5px] text-ink-2">Pas de dramatisation — juste des situations que tout le monde a déjà vécues, et que l'on préférerait éviter.</p>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <RefreshCw />, t: "Abonnement non résilié", d: "Un mois de plus prélevé, parce que l'essai s'est transformé en engagement." },
              { icon: <FileText />, t: "Document expiré", d: "Un passeport périmé découvert trois semaines avant le départ." },
              { icon: <CalendarX />, t: "Rendez-vous raté", d: "Un créneau médical manqué, et des semaines d'attente pour le suivant." },
              { icon: <Award />, t: "Garantie perdue", d: "Un appareil en panne, une garantie qui vient tout juste d'expirer." },
              { icon: <Clock />, t: "Retard administratif", d: "Une démarche oubliée, et des pénalités qui s'ajoutent." },
              { icon: <Receipt />, t: "Facture oubliée", d: "Un paiement annuel qui passe à la trappe, avec des frais à la clé." },
            ].map((c) => (
              <motion.div key={c.t} variants={revealItem} className="rounded-lg border border-line bg-surface p-5 shadow-s">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sand-tint text-sand-ink [&_svg]:h-[19px] [&_svg]:w-[19px]">{c.icon}</span>
                <b className="block text-[15.5px] tracking-[-0.005em]">{c.t}</b>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{c.d}</p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------- 3. SOLUTION ---------------- */}
      <section id="solution" className="border-y border-line bg-teal py-24 text-[#DCE9E8]">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="max-w-[680px]">
            <span className="kicker text-sand">La solution</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-white">
              Soonly transforme vos dates importantes en rappels protégés.
            </h2>
            <p className="mt-3.5 max-w-[52ch] text-[16.5px] text-[#A9C2C1]">Cinq gestes simples, et votre charge mentale s'allège pour de bon.</p>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: <Plus />, t: "Ajouter", d: "Un titre, une date. Dix secondes." },
              { icon: <Link2 />, t: "Connecter", d: "Vos agendas et boîtes mail, avec votre accord." },
              { icon: <BellRing />, t: "Recevoir", d: "Email, notification, SMS ou WhatsApp." },
              { icon: <FolderLock />, t: "Classer", d: "Les documents rangés dans le coffre." },
              { icon: <Search />, t: "Retrouver", d: "Le bon papier, le jour où il faut." },
            ].map((s, i) => (
              <motion.div key={s.t} variants={revealItem} className="bg-teal p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand/15 text-sand [&_svg]:h-[19px] [&_svg]:w-[19px]">{s.icon}</span>
                <div className="mt-3.5 flex items-center gap-2 text-[13px] font-[560] text-sand"><span className="disp">0{i + 1}</span><span className="h-px w-5 bg-sand/50" /></div>
                <b className="mt-2 block text-[16px] text-white">{s.t}</b>
                <p className="mt-1 text-[13px] leading-relaxed text-[#A9C2C1]">{s.d}</p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------- 4. INTÉGRATIONS ---------------- */}
      <section id="integrations" className="py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="max-w-[640px]">
            <span className="kicker">Intégrations</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">Connectez ce que vous utilisez déjà.</h2>
            <p className="mt-3.5 max-w-[54ch] text-[16.5px] text-ink-2">
              Soonly réunit vos sources existantes — toujours par connexion officielle et avec votre consentement. Jamais de collecte à votre insu.
            </p>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Google Agenda", desc: "Importez vos événements, synchronisez vos rappels.", status: "Disponible", cls: "bg-ok-tint text-ok" },
              { name: "Outlook Agenda", desc: "Vos événements Microsoft 365, en rappels.", status: "Disponible", cls: "bg-ok-tint text-ok" },
              { name: "Apple Calendar / iPhone", desc: "Abonnez votre iPhone au calendrier Soonly.", status: "Disponible", cls: "bg-ok-tint text-ok" },
              { name: "Gmail", desc: "Détecte les échéances cachées dans vos emails.", status: "Bêta", cls: "bg-sand-tint text-sand-ink" },
              { name: "Outlook Mail", desc: "Mêmes bénéfices, pour les boîtes Microsoft.", status: "Bêta", cls: "bg-sand-tint text-sand-ink" },
              { name: "Fichiers ICS", desc: "Importez n'importe quel calendrier standard.", status: "Disponible", cls: "bg-ok-tint text-ok" },
              { name: "Documents PDF", desc: "Rattachez vos papiers à leurs échéances.", status: "Disponible", cls: "bg-ok-tint text-ok" },
              { name: "SMS & WhatsApp", desc: "Rappels sobres : titre et date, rien d'autre.", status: "Plus", cls: "bg-teal text-sand" },
              { name: "Doctolib", desc: "Vos rendez-vous santé, sans jamais contourner Doctolib.", status: "Connexion officielle selon disponibilité", cls: "bg-bg-deep text-ink-2", wide: true },
            ].map((c) => (
              <motion.div key={c.name} variants={revealItem} className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-s">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-[15px] tracking-[-0.005em]">{c.name}</b>
                  <span className={`badge ${c.cls} ${c.wide ? "text-[10.5px]" : ""} whitespace-nowrap`}>{c.status}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{c.desc}</p>
              </motion.div>
            ))}
          </RevealGroup>

          {/* Encart Doctolib : transparence sur l'approche sans scraping */}
          <Reveal className="mt-3.5">
            <div className="rounded-xl border border-line bg-surface-2 p-6">
              <b className="text-[15px] tracking-[-0.005em] text-teal">Comment fonctionne la connexion Doctolib</b>
              <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-2">
                Soonly ne se connecte pas en votre nom à Doctolib et ne récupère rien à votre insu. Trois chemins respectueux : votre rendez-vous
                s'ajoute à votre agenda (Google, Apple, Outlook) et Soonly le reprend ; ou vous connectez votre boîte mail et l'email de confirmation
                devient une proposition à valider ; ou un ajout manuel « Rendez-vous santé » en deux clics. Si une connexion officielle devient disponible, elle s'intégrera ici.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 5. PRODUIT ---------------- */}
      <section id="produit" className="border-y border-line bg-surface py-24">
        <div className="mx-auto grid max-w-content items-center gap-12 px-5 sm:px-7 lg:grid-cols-[380px_1fr] lg:gap-14 gap-12">
          <Reveal>
            <span className="kicker">L'application</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">Un tableau de bord qui apaise.</h2>
            <div className="mt-6">
              {[
                { icon: <Clock />, t: "Le fil du temps", d: "Vos prochaines échéances, d'un coup d'œil, sur une ligne de vie lumineuse." },
                { icon: <ShieldCheck />, t: "Le score de tranquillité", d: "Un indicateur simple qui monte quand tout est protégé — jamais anxiogène." },
                { icon: <SlidersHorizontal />, t: "Urgent, bientôt, plus tard", d: "Une lecture en trois temps, pour savoir où porter votre attention." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4 border-t border-line py-4 first:border-t-0">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-wash text-teal [&_svg]:h-[19px] [&_svg]:w-[19px]">{f.icon}</span>
                  <div>
                    <b className="block text-[15.5px] tracking-[-0.005em]">{f.t}</b>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}><ProductPreview /></Reveal>
        </div>
      </section>

      {/* ---------------- 6. CONFIDENTIALITÉ ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="max-w-[640px]">
            <span className="kicker">Confidentialité</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">
              Vos rappels sont utiles. Vos documents restent privés.
            </h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Link2 />, t: "Consentement par source", d: "Chaque agenda, boîte mail ou canal s'active avec votre accord explicite." },
              { icon: <Trash2 />, t: "Suppression possible", d: "Effacez un document, une connexion ou tout votre compte, définitivement." },
              { icon: <Download />, t: "Export possible", d: "Récupérez l'ensemble de vos données en un clic, à tout moment." },
              { icon: <MessageSquare />, t: "Jamais de document par SMS", d: "Les rappels SMS et WhatsApp ne contiennent que le titre et la date." },
              { icon: <BellRing />, t: "Contrôle des notifications", d: "Coupez un canal en un geste, sans perdre vos rappels." },
              { icon: <EyeOff />, t: "Déconnexion des intégrations", d: "Retirez l'accès à une source quand vous le souhaitez." },
            ].map((c) => (
              <motion.div key={c.t} variants={revealItem} className="rounded-lg border border-line bg-surface p-5 shadow-s">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-wash text-teal [&_svg]:h-[19px] [&_svg]:w-[19px]">{c.icon}</span>
                <b className="block text-[15px] tracking-[-0.005em]">{c.t}</b>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{c.d}</p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------- 7. PRICING ---------------- */}
      <section id="tarifs" className="border-t border-line bg-surface py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="mx-auto max-w-[640px] text-center">
            <span className="kicker">Tarifs</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">Deux offres. Rien de plus.</h2>
            <p className="mx-auto mt-3.5 max-w-[46ch] text-[16.5px] text-ink-2">7 jours d'essai gratuit sur chaque offre, sans engagement, résiliable en un clic.</p>
          </Reveal>
          <Reveal className="mt-12"><PricingCards /></Reveal>
          <p className="mt-6 text-center text-[13.5px] text-ink-3">Prix TTC. Aucune carte requise pendant l'essai.</p>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal className="mx-auto mb-12 max-w-[640px] text-center">
            <span className="kicker">Questions fréquentes</span>
            <h2 className="disp mt-3.5 text-[clamp(26px,3.2vw,40px)] font-[560] leading-[1.12] text-teal">Tout ce que vous voulez savoir.</h2>
          </Reveal>
          <Faq />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="pb-24">
        <div className="mx-auto max-w-content px-5 sm:px-7">
          <Reveal>
            <div className="relative flex flex-wrap items-center justify-between gap-10 overflow-hidden rounded-xl bg-teal px-8 py-16 sm:px-14">
              <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border border-sand/30" />
              <span className="pointer-events-none absolute right-28 top-11 h-3 w-3 rounded-full bg-sand" />
              <div className="relative">
                <h2 className="disp max-w-[19ch] text-[clamp(24px,3vw,36px)] font-[560] leading-[1.15] text-white">
                  Vos rappels ne devraient pas dépendre de votre mémoire.
                </h2>
                <p className="mt-3 max-w-[44ch] text-[15px] text-[#B9CFCE]">Vous gardez le contrôle. Soonly vous prévient.</p>
              </div>
              <Link href="/signup" className="btn btn-sand btn-lg relative">
                Protéger mes premières dates <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
