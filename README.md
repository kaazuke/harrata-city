<div align="center">

# Harrata City

**Hub communautaire FiveM Roleplay — Next.js 15 · React 19 · TypeScript · Tailwind CSS 4**

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square)](https://fivem-rp-community.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-000?style=flat-square&logo=vercel)](https://vercel.com)

</div>

---

## Présentation

**Harrata City** est un hub communautaire pour serveur **FiveM Roleplay**. La plateforme offre une expérience complète aux joueurs — présentation du serveur, règlement, candidatures, boutique, forum, galerie, actualités, statistiques — entièrement **pilotable depuis un panneau d'administration** sans toucher au code.

Le site affiche en temps réel l'état du serveur FiveM (joueurs connectés, slots disponibles, description, icône) et propose une authentification via **Discord** et **Steam**.

- 🌐 **Site en production** : [fivem-rp-community.vercel.app](https://fivem-rp-community.vercel.app)
- 🎮 **Serveur FiveM** : `connect 51.68.125.155:30120`

---

## Fonctionnalités

### Interface publique

- 🏠 **Accueil** dynamique avec statut live du serveur FiveM
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

## Licence

Template modifiable. GTA V et marques associées appartiennent à leurs détenteurs.
Ce hub communautaire est un projet indépendant non affilié à Rockstar Games ni à Cfx.re.

---

<div align="center">

**Créé pour la communauté Harrata City · [fivem-rp-community.vercel.app](https://fivem-rp-community.vercel.app)**

</div>
