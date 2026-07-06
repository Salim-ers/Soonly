# Soonly

> **Never miss what matters.**
> Centralisez vos échéances importantes — rendez-vous, papiers, abonnements, garanties, documents — et soyez prévenu·e avant qu'il ne soit trop tard.

Soonly est une application **Next.js 15 (App Router)** complète et **prête à déployer** : ce n'est ni une maquette ni une démo. Les paiements passent réellement par Stripe, les rappels sont envoyés par de vrais fournisseurs (email, SMS, WhatsApp, Web Push), les documents sont stockés dans un bucket privé chiffré, et les intégrations calendrier/mail utilisent de vraies connexions OAuth.

---

## Sommaire

- [Ce que fait Soonly](#ce-que-fait-soonly)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [État des intégrations : fonctionnel vs. clés requises](#état-des-intégrations)
- [Apple Calendar / iPhone : comment ça marche vraiment](#apple-calendar--iphone)
- [Doctolib : sans scraping, sans contournement](#doctolib)
- [Modèle économique et grestion des plans](#plans)
- [Sécurité & confidentialité](#sécurité--confidentialité)
- [La landing page vend le problème](#la-landing-page)
- [Structure du projet](#structure-du-projet)
- [Déploiement (Vercel)](#déploiement)
- [Notes](#notes)

---

## Ce que fait Soonly

- **Ajout express d'échéances** : titre, date, catégorie, moments de rappel (J-90 → jour J), récurrence, canaux.
- **Rappels multi-canal** : email (Resend), notification Web Push, SMS (Twilio), WhatsApp (Cloud API). Un moteur cron dédié envoie les rappels dus, sans doublon.
- **Coffre documents chiffré** (plan Plus) : PDF/images stockés dans un bucket privé, reliés à leurs échéances, avec alertes avant expiration.
- **Intégrations** : Google Agenda, Outlook Agenda, Apple Calendar (ICS), Gmail, Outlook Mail, Doctolib (approche respectueuse), fichiers ICS.
- **Tableau de bord apaisant** : score de tranquillité, fil du temps, regroupement Urgent / Bientôt / Plus tard.
- **PWA installable**, responsive (mobile / tablette / desktop), `prefers-reduced-motion` respecté.
- **RGPD** : consentement par canal et par source, export complet des données, suppression définitive du compte.

---

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | Next.js 15 (App Router, RSC), TypeScript strict |
| UI | Tailwind CSS (design tokens Soonly), Framer Motion, lucide-react |
| Base de données | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth v5) — Google, lien magique email, OTP téléphone |
| Paiement | Stripe (Checkout, portail client, webhooks signés) |
| Email | Resend |
| SMS | Twilio |
| WhatsApp | WhatsApp Business Cloud API (Meta) |
| Push | Web Push (VAPID) + service worker |
| Stockage | S3-compatible (Supabase Storage, Cloudflare R2, AWS S3…) — URL signées |
| Validation | Zod |

---

## Démarrage rapide

**Prérequis :** Node.js ≥ 20, une base PostgreSQL, un compte Stripe (pour les paiements).

```bash
# 1. Installer les dépendances (génère aussi le client Prisma)
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
#   → renseignez au minimum DATABASE_URL et AUTH_SECRET (voir ci-dessous)

# 3. Créer le schéma en base
npm run db:migrate      # migration de développement
#   (ou en production : npm run db:deploy)

# 4. (Optionnel) Peupler une base de démo en local
npm run db:seed

# 5. Lancer
npm run dev             # http://localhost:3000
```

Autres commandes utiles :

```bash
npm run build           # build de production (prisma generate + next build)
npm run start           # serveur de production
npm run typecheck       # vérification TypeScript
npm run lint            # ESLint
npm run db:studio       # explorateur Prisma
```

> **Générer les secrets :**
> `AUTH_SECRET` et `CRON_SECRET` → `openssl rand -base64 32`
> `ENCRYPTION_KEY` → `openssl rand -base64 32` (doit décoder en 32 octets)
> Clés VAPID (push) → `npx web-push generate-vapid-keys`

---

## Variables d'environnement

Toutes les variables sont validées au démarrage par `lib/env.ts` (Zod). Seules **deux** sont strictement requises pour lancer l'app ; les autres activent des fonctionnalités à la demande.

| Variable | Requis | Rôle |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Connexion PostgreSQL |
| `AUTH_SECRET` | ✅ | Signature des sessions Auth.js |
| `NEXT_PUBLIC_APP_URL` | ➖ | URL publique (défaut `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ➖ | Connexion « Se connecter avec Google » |
| `ENCRYPTION_KEY` | ➖ | Chiffrement AES-256-GCM des tokens OAuth (requis pour les intégrations) |
| `STRIPE_SECRET_KEY` | ➖ | Paiements |
| `STRIPE_WEBHOOK_SECRET` | ➖ | Vérification des webhooks Stripe |
| `STRIPE_PRICE_ESSENTIEL` / `STRIPE_PRICE_PLUS` | ➖ | IDs de prix des deux offres |
| `RESEND_API_KEY` / `EMAIL_FROM` | ➖ | Emails (rappels + liens magiques) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | ➖ | SMS (plan Plus) + OTP |
| `WHATSAPP_PROVIDER_TOKEN` / `WHATSAPP_FROM` | ➖ | WhatsApp (plan Plus) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | ➖ | Notifications Web Push |
| `STORAGE_*` | ➖ | Bucket S3-compatible pour le coffre documents |
| `GOOGLE_CALENDAR_CLIENT_ID` / `_SECRET` | ➖ | Google Agenda + Gmail |
| `MICROSOFT_CLIENT_ID` / `_SECRET` / `MICROSOFT_TENANT` | ➖ | Outlook Agenda + Outlook Mail |
| `CRON_SECRET` | ➖ | Protège l'endpoint cron d'envoi des rappels |

**Principe important :** si une clé manque, la fonctionnalité concernée est **désactivée proprement**. Rien n'est simulé : un envoi non configuré est journalisé en `SKIPPED` avec une raison explicite (jamais un faux « succès »). Les helpers `featureConfigured.*` (dans `lib/env.ts`) reflètent l'état de configuration dans toute l'app (y compris l'UI des intégrations).

---

## État des intégrations

Ce qui fonctionne **sans configuration supplémentaire** :

- ✅ **Ajout, rappels, calendrier, catégories, récurrences, modèles** — le cœur de l'app.
- ✅ **Apple Calendar / ICS** — le flux d'abonnement ne dépend d'**aucune clé externe** (voir plus bas).
- ✅ **Export & suppression de compte** (RGPD).

Ce qui nécessite des **clés** pour être activé (l'UI l'indique automatiquement) :

| Intégration | Clés nécessaires | Statut |
|---|---|---|
| Connexion Google | `AUTH_GOOGLE_ID/SECRET` | Fonctionnel une fois configuré |
| Google Agenda | `GOOGLE_CALENDAR_CLIENT_ID/SECRET` + `ENCRYPTION_KEY` | **Implémentation de référence complète** (OAuth, refresh, sync, agenda Soonly, push) |
| Outlook Agenda | `MICROSOFT_CLIENT_ID/SECRET` | Fonctionnel une fois configuré |
| Gmail | clés Google + scope `gmail.readonly` | Bêta — détection ciblée, validation manuelle |
| Outlook Mail | clés Microsoft + scope `Mail.Read` | Bêta — détection ciblée, validation manuelle |
| Stripe (paiement) | `STRIPE_*` | Fonctionnel une fois configuré |
| Email (Resend) | `RESEND_API_KEY` | Fonctionnel une fois configuré |
| SMS (Twilio) | `TWILIO_*` | Fonctionnel une fois configuré (plan Plus) |
| WhatsApp | `WHATSAPP_*` | Fonctionnel une fois configuré (plan Plus) |
| Web Push | clés VAPID | Fonctionnel une fois configuré |
| Coffre documents | `STORAGE_*` | Fonctionnel une fois configuré (plan Plus) |

> **Emails ciblés uniquement.** Gmail/Outlook Mail n'aspirent jamais toute la boîte : Soonly interroge des requêtes précises (fins d'essai, factures, confirmations de RDV, abonnements) et présente des **candidats** que vous validez un par un. Rien n'est importé automatiquement.

### Configurer les paiements Stripe

1. Créez deux prix récurrents mensuels (9,99 € et 14,99 €) dans le dashboard Stripe.
2. Renseignez `STRIPE_PRICE_ESSENTIEL` et `STRIPE_PRICE_PLUS`.
3. Créez un endpoint webhook pointant vers `/api/stripe/webhook` et copiez le secret dans `STRIPE_WEBHOOK_SECRET`. Événements utiles : `checkout.session.completed`, `customer.subscription.created|updated|deleted`.
4. En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### Envoi automatique des rappels (cron)

L'endpoint `GET /api/reminders/due` scanne les rappels dus et les envoie. Il est protégé par `CRON_SECRET`. Sur Vercel, `vercel.json` déclare déjà un cron toutes les 15 minutes. Ailleurs, appelez cet endpoint périodiquement avec l'en-tête `Authorization: Bearer $CRON_SECRET`.

---

## Apple Calendar / iPhone

**Soonly ne prétend jamais lire l'agenda de votre iPhone depuis le web — parce que c'est techniquement impossible.** Une application web (Next.js) n'a pas accès à EventKit ; seul un client iOS natif le pourrait.

À la place, Soonly adopte l'approche standard et honnête :

1. Soonly publie un **flux ICS « Soonly »** en lecture seule (`GET /api/integrations/apple/ics`), authentifié par un jeton opaque propre à chaque utilisateur.
2. Depuis la page **Intégrations**, l'utilisateur récupère une URL `webcal://` et s'abonne en un tap (ou l'ajoute dans Réglages iOS › Calendrier › Comptes).
3. Ses rappels Soonly apparaissent alors dans l'app Calendrier d'iOS/macOS, **toujours à jour**.

Le désabonnement se fait côté iOS (suppression du calendrier abonné). L'architecture (`ExternalEvent`, source `APPLE_ICS`) est déjà prête à accueillir une future app iOS native avec accès bidirectionnel.

---

## Doctolib

**Soonly ne se connecte pas à votre compte Doctolib, ne fait aucun scraping et ne contourne aucune CGU.** Aucune donnée n'est récupérée à l'insu du fournisseur. Trois chemins respectueux (voir `lib/integrations/doctolib.ts`) :

1. **Depuis l'agenda** — Doctolib propose d'ajouter un rendez-vous à votre Google/Apple/Outlook Agenda. Une fois connecté, Soonly repère cet événement « santé » et vous propose de le protéger (vous validez).
2. **Depuis l'email** — si vous connectez votre boîte mail, l'email de confirmation Doctolib apparaît dans les candidats, à valider manuellement.
3. **Ajout manuel express** — un raccourci « Rendez-vous santé » pré-rempli.

Si une **API/partenariat officiel** devient disponible, l'interface est prête à l'accueillir (statut `official-pending`, affiché « Officiel à venir » dans l'app et « Connexion officielle selon disponibilité » sur la landing).

---

## Plans

Deux offres, **rien d'autre** (pas de plan gratuit, pas d'offre entreprise) :

| | **Essentiel — 9,99 €/mois** | **Plus — 14,99 €/mois** |
|---|---|---|
| Échéances & catégories | Illimitées | Illimitées |
| Rappels email + push | ✅ | ✅ |
| Rappels personnalisables + récurrences | ✅ | ✅ |
| Calendrier + modèles | ✅ | ✅ |
| Coffre documents chiffré | — | ✅ |
| Rappels SMS & WhatsApp | — | ✅ |
| Alertes de documents expirés | — | ✅ |
| Intégrations avancées, export, tags | — | ✅ |

Chaque offre inclut **7 jours d'essai gratuit** (`trial_period_days` côté Stripe), sans engagement. Le gating est centralisé dans `lib/permissions.ts` et appliqué côté serveur (création de rappel SMS/WhatsApp, upload de documents, envoi de notifications).

---

## Sécurité & confidentialité

- **Tokens OAuth chiffrés** en base (AES-256-GCM, `lib/encryption.ts`) et **jamais exposés au client**.
- **Webhooks Stripe vérifiés** par signature.
- **Validation Zod** sur toutes les entrées d'API.
- **Cloisonnement par utilisateur** : chaque requête vérifie la propriété de la ressource.
- **Documents privés** : bucket non public, **URL signées** à durée de vie courte uniquement.
- **Jamais de document par SMS/WhatsApp** : ces canaux ne transmettent que titre + date. Option « masquer les titres sensibles » pour des messages neutres.
- **Consentement explicite** par canal (email/push/SMS/WhatsApp) et par source (agenda/mail).
- **Export & suppression** : `GET /api/account/export` (JSON complet), `POST /api/account/delete` (suppression définitive, fichiers inclus, cascade Prisma).
- **En-têtes de sécurité** (`next.config.mjs`) et `Service-Worker-Allowed` pour le SW.

---

## La landing page

La page d'accueil (`app/(marketing)/page.tsx`) **vend le problème avant la solution** :

1. **Hero** — « Vos dates importantes sont partout. Soonly les garde au même endroit. » avec une animation *chaos → ordre* (des sources dispersées convergent vers le fil du temps).
2. **Le problème** — « On n'oublie pas parce qu'on est désorganisé. On oublie parce que tout est dispersé. »
3. **Les conséquences** — abonnement non résilié, document expiré, RDV raté, garantie perdue…
4. **La solution** — Ajouter → Connecter → Recevoir → Classer → Retrouver.
5. **Intégrations** — connexions officielles, avec la transparence Doctolib.
6. **L'application** — aperçu fidèle du tableau de bord.
7. **Confidentialité**, puis **tarifs** (2 offres), **FAQ** et **CTA**.

Ton **premium, calme, rassurant** ; palette de marque (deep teal / soft teal / warm sand). Aucune mention d'« IA » : la logique de détection existe en backend mais n'est jamais vendue comme telle. Dans l'application, les écrans réels affichent des **états vides soignés** — les exemples n'apparaissent que sur la landing.

---

## Structure du projet

```
soonly/
├─ app/
│  ├─ (marketing)/           # Landing, tarifs, confidentialité (+ layout nav/footer)
│  ├─ (auth)/                # Connexion, inscription, vérification téléphone
│  ├─ (app)/                 # App authentifiée : dashboard, calendrier, documents,
│  │                         #   rappels, intégrations, abonnement, réglages
│  ├─ api/                   # 30 route handlers (auth, stripe, reminders, documents,
│  │                         #   integrations, notifications, settings, account…)
│  ├─ offline/ · not-found · layout.tsx · globals.css
├─ components/               # brand, marketing, app, forms, integrations, documents,
│                            #   billing, motion
├─ lib/                      # env, db, auth, stripe, permissions, dates, reminders,
│  │                         #   notifications, storage, encryption, constants,
│  │                         #   validations, queries, oauth-state, api
│  └─ integrations/          # provider-registry + connecteurs (Google/Microsoft/
│                            #   Apple-ICS/Gmail/Outlook-mail/Doctolib) + ics
├─ prisma/                   # schema.prisma + seed.ts
├─ public/                   # manifest.webmanifest, sw.js, icons/
└─ types/                    # types partagés + augmentation Auth.js
```

---

## Déploiement

Pensé pour **Vercel** (le cron des rappels est déclaré dans `vercel.json`), mais déployable partout où Next.js 15 tourne.

1. Provisionnez une base PostgreSQL (Supabase, Neon, Railway, RDS…).
2. Configurez toutes les variables d'environnement voulues.
3. `npm run db:deploy` pour appliquer les migrations.
4. Déployez. Le build lance `prisma generate && next build`.
5. Configurez le webhook Stripe et le cron (`/api/reminders/due`).

---

## Notes

- **TypeScript strict** activé. `next build` n'échoue pas sur les avertissements ESLint (`eslint.ignoreDuringBuilds: true` dans `next.config.mjs`) afin de ne pas bloquer un déploiement ; lancez `npm run lint` séparément en CI. Vous pouvez réactiver le blocage à tout moment.
- Les **icônes PWA** de `public/icons/` sont des placeholders dérivés du symbole de marque — remplacez-les par les exports finaux (192, 512, maskable, apple-touch) pour la production.
- **Aucun paiement simulé, aucune donnée factice** dans l'app : tout passe par de vrais services une fois les clés fournies.
