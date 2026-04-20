<div align="center">

# Harrata City (repo) — hub communautaire FiveM

**Template open source — Next.js 15 · React 19 · TypeScript · Tailwind CSS 4**  
Le site public sur Vercel est une **démo** (contenus fictifs) pour que les contributeurs voient le rendu avant de forker.

*English:* **Open-source FiveM community hub template** — the live Vercel site is a **demo** with sample content so you can explore the UI before forking.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square)](https://fivem-rp-community.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-000?style=flat-square&logo=vercel)](https://vercel.com)

</div>

---

## Présentation

Ce dépôt est un **hub communautaire** pour serveur **FiveM Roleplay** : présentation, règlement, candidatures, boutique, forum, galerie, actualités, statistiques — **pilotable depuis un panneau d'administration** sans toucher au code.

La démo en ligne utilise des **données d’exemple** pour le bloc serveur ; après fork vous pouvez brancher l’**API Cfx.re** ou un endpoint **`/players.json`**. Authentification **Discord** et **Steam** disponibles selon vos variables d’environnement.

- 🌐 **Démo en ligne** : [fivem-rp-community.vercel.app](https://fivem-rp-community.vercel.app) — parcourir les pages ; voir aussi [/fr/hub-open-source](https://fivem-rp-community.vercel.app/fr/hub-open-source) pour le contexte projet.
- 🎮 **Serveur FiveM** : non inclus dans la démo par défaut — configurez votre `players.json` ou code Cfx.re dans l’admin après fork.
- 💬 **Bêta — contact & infos** : [Discord](https://discord.gg/7XVtaRnpQe) — questions installation, outils, retours. Texte prêt à partager : [docs/infos-beta-contact-discord.md](docs/infos-beta-contact-discord.md).

---

## Fonctionnalités

### Interface publique

- 🏠 **Accueil** avec bloc serveur (démo statique ou live si configuré)
- 📖 **Présentation** du projet et du lore
- 📜 **Règlement** éditable depuis l'admin
- 📝 **Candidatures** (whitelist / staff) avec formulaires configurables
- 🛒 **Boutique** (intégration Tebex possible)
- 👥 **Équipe** et organigramme du staff
- 📰 **Actualités** / patch notes (avec slug et détail)
- 🖼️ **Galerie** screenshots / vidéos
- 💬 **Forum communautaire** (catégories, sujets, réponses)
- 📊 **Statistiques** serveur et communauté
- 📬 **Contact** avec envoi webhook Discord

### Authentification

- 🔐 **Discord OAuth2** (pseudo, avatar, rôles)
- 🎮 **Steam OpenID 2.0** (SteamID64)
- 🍪 Sessions signées (HMAC) stockées en cookies sécurisés
- 🚪 Logout et page compte utilisateur

### Serveur FiveM live

- 📡 Intégration directe avec `/players.json` + `/info.json` du serveur FiveM
- 🔄 Polling automatique configurable (intervalle)
- 🧩 Fallback Cfx.re (code court) supporté
- 🎨 Affichage icône serveur, description, version, locale

### Panneau d'administration

- ⚙️ Édition **en direct** de tous les contenus et couleurs du site
- 🗂️ Gestion des pages, actualités, règlement, équipe
- 🔌 Configuration des intégrations (Discord, Steam, webhooks)
- 💾 Import / export JSON de la configuration complète
- 🧪 Onglet "Test" pour sonder le serveur FiveM

---

## Stack technique

| Domaine | Technologie |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router + Turbopack) |
| UI | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| Langage | [TypeScript 5](https://www.typescriptlang.org) |
| Runtime | Node.js 20+ |
| Déploiement | [Vercel](https://vercel.com) (serverless) |
| Auth | Discord OAuth2, Steam OpenID 2.0, sessions HMAC |
| Stockage config | `localStorage` (client) + fallback `.runtime/` (dev) |

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10 (ou pnpm / yarn)
- Une application **Discord Developer** (pour OAuth)
- Une **clé API Steam** (optionnelle, pour enrichir les profils)

---

## Installation

```bash
git clone https://github.com/kaazuke/harrata-city.git
cd harrata-city
npm install
```

## Configuration

Crée un fichier `.env.local` à la racine du projet :

```env
# URL publique du site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Secret pour signer les sessions (32 octets hex recommandé)
AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Discord OAuth2
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Steam OpenID
STEAM_REALM=http://localhost:3000
STEAM_API_KEY=

# Webhook Discord (contact / candidatures)
DISCORD_WEBHOOK_URL=

# Autoriser l'écriture runtime depuis l'admin en production (optionnel)
ALLOW_RUNTIME_AUTH_CONFIG=false
```

Générer un `AUTH_SECRET` aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts disponibles

```bash
npm run dev          # Lancer le serveur de développement (Turbopack)
npm run dev:webpack  # Dev avec Webpack (fallback si problème Turbopack)
npm run dev:clean    # Clean + dev
npm run build        # Build production
npm run start        # Lancer le serveur de production
npm run lint         # ESLint
npm run clean        # Vider les caches Next.js
```

Le site sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
harrata-city/
├── src/
│   ├── app/                    # Routes Next.js App Router
│   │   ├── api/                # Endpoints serverless
│   │   │   ├── auth/           # Discord + Steam OAuth
│   │   │   ├── server/live/    # Proxy FiveM players.json + info.json
│   │   │   ├── contact/        # Webhook Discord contact
│   │   │   ├── forms/          # Soumission candidatures
│   │   │   └── admin/          # Config runtime
│   │   ├── admin/              # Panneau d'administration
│   │   ├── forum/              # Forum communautaire
│   │   ├── actualites/         # Patch notes / news
│   │   └── ...                 # Autres pages publiques
│   ├── components/             # Composants React réutilisables
│   ├── config/                 # Configuration par défaut du site
│   ├── lib/                    # Logique métier
│   │   ├── auth/               # Sessions, runtime-config
│   │   ├── integrations/       # Steam OpenID, Discord, Cfx.re
│   │   └── server/             # Hooks serveur (live polling)
│   └── hooks/                  # React hooks
├── public/                     # Assets statiques
├── scripts/                    # Outils de build / dev
└── examples/                   # Exemples de configuration
```

---

## API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/server/live` | GET | Statut live du serveur FiveM (players + info) |
| `/api/auth/discord` | GET | Initialisation OAuth Discord |
| `/api/auth/discord/callback` | GET | Callback Discord |
| `/api/auth/steam` | GET | Initialisation OpenID Steam |
| `/api/auth/steam/callback` | GET | Callback Steam |
| `/api/auth/me` | GET | Profil utilisateur connecté |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/contact` | POST | Envoi formulaire contact (webhook Discord) |
| `/api/forms` | POST | Soumission formulaires (candidatures) |
| `/api/admin/auth-config` | GET/POST/DELETE | Gestion config auth runtime (dev) |

---

## Déploiement

### Vercel (recommandé)

Le projet est optimisé pour Vercel (serverless natif Next.js).

1. **Fork** ou clone ce repo sur ton compte GitHub
2. Va sur [vercel.com/new](https://vercel.com/new) et importe le repo
3. Configure les variables d'environnement (voir section [Configuration](#configuration))
4. Deploy — chaque `git push` sur `main` redéploiera automatiquement

### Domaine personnalisé

Ajoute ton domaine dans `Vercel → Project → Settings → Domains`, puis pointe ton DNS :

- `A` record → `76.76.21.21` (root domain)
- `CNAME` record → `cname.vercel-dns.com` (sous-domaine)

### Autres plateformes

Toute plateforme supportant Node.js 20+ (Railway, Render, VPS, fly.io…) fonctionne via `npm run build && npm run start`.

---

## Sécurité

- ✅ Aucun secret n'est commité dans le repo (`.env*`, `.runtime/`, `.vercel/` sont gitignore)
- ✅ Les sessions sont signées HMAC-SHA256 avec `AUTH_SECRET`
- ✅ Les cookies utilisent `HttpOnly` + `SameSite=Lax` + `Secure` en production
- ✅ Les callbacks OAuth vérifient les signatures cryptographiques
- ⚠️ En production, **utilise uniquement les variables d'environnement** (le panneau admin est en lecture seule sauf `ALLOW_RUNTIME_AUTH_CONFIG=true`)

---

## Roadmap

- [ ] Système de rôles et permissions granulaires (Admin, Modérateur, Staff, Membre)
- [ ] Enrichissement profil Steam (avatar, pseudo via Steam Web API)
- [ ] Enrichissement profil Discord (avatar, rôles du serveur Discord)
- [ ] Système modulaire d'extensions (plug-ins activables)
- [ ] Intégration Tebex complète (boutique dynamique)
- [ ] Dashboard statistiques avancé
- [ ] Notifications temps réel (WebSocket)
- [ ] API publique pour bots Discord

---

## English

### Overview

This repo is an **open-source community hub** for **FiveM Roleplay** servers: presentation, rules, applications, shop, forum, gallery, news, stats — **editable from an admin panel** without changing code.

The live demo uses **sample data** for the server block; after fork you can connect the **Cfx.re API** or a **`/players.json`** endpoint. **Discord** and **Steam** sign-in depend on your environment variables.

- **Live demo**: [fivem-rp-community.vercel.app](https://fivem-rp-community.vercel.app) — browse the site; see [/en/hub-open-source](https://fivem-rp-community.vercel.app/en/hub-open-source) for project context.
- **FiveM server**: not included in the default demo — set your `players.json` URL or Cfx.re code in the admin after fork.
- **Beta — contact & info**: [Discord](https://discord.gg/7XVtaRnpQe) for install questions, tooling, feedback. Shareable notes (French, universal links): [docs/infos-beta-contact-discord.md](docs/infos-beta-contact-discord.md).

### Features

**Public UI**

- Home with server widget (static demo or live when configured)
- Presentation / lore, editable rules, applications (whitelist / staff), shop (Tebex-friendly), team, news with slugs, gallery, forum, statistics, contact (optional Discord webhook)

**Authentication**

- Discord OAuth2, Steam OpenID 2.0, signed cookie sessions, account page & logout

**Live FiveM**

- `/players.json` + `/info.json` polling, optional Cfx.re short code, server icon & metadata

**Admin**

- Live editing of copy, theme, navigation, integrations, JSON import/export, FiveM probe tab

### Stack

| Area | Tech |
|------|------|
| Framework | [Next.js 15](https://nextjs.org) (App Router + Turbopack) |
| UI | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Runtime | Node.js 20+ |
| Deploy | [Vercel](https://vercel.com) (serverless) |
| Auth | Discord OAuth2, Steam OpenID 2.0, HMAC sessions |
| Config storage | `localStorage` (client) + optional `.runtime/` (dev) |

### Prerequisites

- **Node.js** ≥ 20  
- **npm** ≥ 10 (or pnpm / yarn)  
- A **Discord Developer** application (OAuth)  
- **Steam Web API key** (optional, for richer profiles)

### Install & configuration

```bash
git clone https://github.com/kaazuke/harrata-city.git
cd harrata-city
npm install
```

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
STEAM_REALM=http://localhost:3000
STEAM_API_KEY=
DISCORD_WEBHOOK_URL=
ALLOW_RUNTIME_AUTH_CONFIG=false
```

Generate `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### NPM scripts

```bash
npm run dev          # Dev server (Turbopack)
npm run dev:webpack  # Dev with Webpack (fallback)
npm run dev:clean    # Clean + dev
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run clean        # Clear Next.js caches
```

Open [http://localhost:3000](http://localhost:3000).

### Project layout

```
harrata-city/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # Serverless routes (auth, live, contact, forms…)
│   │   ├── admin/           # Admin panel
│   │   ├── forum/
│   │   └── …
│   ├── components/
│   ├── config/              # Default site config
│   └── lib/
├── public/
├── scripts/
└── examples/
```

### API routes (summary)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/server/live` | GET | Live FiveM status (players + info) |
| `/api/auth/discord` | GET | Start Discord OAuth |
| `/api/auth/discord/callback` | GET | Discord callback |
| `/api/auth/steam` | GET | Start Steam OpenID |
| `/api/auth/steam/callback` | GET | Steam callback |
| `/api/auth/me` | GET | Current user |
| `/api/auth/logout` | POST | Log out |
| `/api/contact` | POST | Contact form → Discord webhook |
| `/api/forms` | POST | Application forms |
| `/api/admin/auth-config` | GET/POST/DELETE | Runtime auth config (dev) |

### Deployment

**Vercel (recommended)** — import the repo on [vercel.com/new](https://vercel.com/new), set the same env vars as above, deploy. Pushes to `main` redeploy automatically.

**Custom domain** — Vercel → Project → Domains; DNS e.g. `A` → `76.76.21.21`, `CNAME` → `cname.vercel-dns.com`.

**Other hosts** — any Node 20+ platform: `npm run build && npm run start`.

### Security

- No secrets in git (`.env*`, `.runtime/`, `.vercel/` ignored)  
- HMAC-signed sessions with `AUTH_SECRET`  
- `HttpOnly` + `SameSite=Lax` + `Secure` cookies in production  
- In production, prefer **env-only** secrets; admin runtime auth config is read-only unless `ALLOW_RUNTIME_AUTH_CONFIG=true`

### Roadmap (same as French section)

- [ ] Fine-grained roles (Admin, Moderator, Staff, Member)  
- [ ] Richer Steam profile (avatar, name via Web API)  
- [ ] Richer Discord profile (guild roles, etc.)  
- [ ] Pluggable extensions system  
- [ ] Deeper Tebex integration  
- [ ] Advanced stats dashboard  
- [ ] Real-time notifications (WebSocket)  
- [ ] Public API for Discord bots  

---

## Licence / License

**FR** — Template modifiable. GTA V et marques associées appartiennent à leurs détenteurs.  
Ce hub communautaire est un projet indépendant non affilié à Rockstar Games ni à Cfx.re.

**EN** — Editable template. Grand Theft Auto V and related trademarks belong to their respective owners.  
This community hub is an independent project, not affiliated with Rockstar Games or Cfx.re.

---

<div align="center">

**Demo · [fivem-rp-community.vercel.app](https://fivem-rp-community.vercel.app) · [GitHub](https://github.com/kaazuke/harrata-city) · [Discord](https://discord.gg/7XVtaRnpQe)**

</div>
