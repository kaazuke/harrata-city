# Harrata Bot

Bot Discord officiel de la communauté **Harrata City** — intégré au hub [harrata-city](../README.md).

[![Discord.js](https://img.shields.io/badge/discord.js-14-5865F2?style=flat-square&logo=discord)](https://discord.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org)

---

## ✨ Fonctionnalités

| Fonctionnalité | Commande / Trigger | Description |
|---|---|---|
| 🏓 Ping | `/ping` | Teste la latence |
| 🎮 Statut FiveM | `/status` | Embed live joueurs/slots/description |
| 📡 Statut auto | *automatique* | Embed rafraîchi en continu dans un salon |
| 📰 Actualités auto | *automatique* | Poste les nouvelles news du site |
| 🔗 Lier compte | `/link` | Génère un lien OAuth Discord vers le site |
| 📝 Candidature WL | `/whitelist` | Modal de candidature → envoyé au staff |
| 🎫 Panneau tickets | `/ticket-panel` | Envoie le menu de création de tickets |
| 🔒 Fermer ticket | `/close` | Ferme le salon ticket courant |
| ⚠️ Avertir | `/warn` | Avertit un membre (DM + mod-log) |
| 👢 Expulser | `/kick` | Kick avec raison + DM |
| 🔨 Bannir | `/ban` | Ban avec raison + suppression messages |
| 🔇 Rendre silencieux | `/mute` | Timeout avec durées prédéfinies |
| 👋 Bienvenue | *automatique* | Embed de bienvenue aux nouveaux membres |

---

## 🚀 Démarrage rapide

### 1. Créer l'application Discord

1. Va sur [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. **Bot** → **Reset Token** → copie le **TOKEN**
3. **OAuth2 → URL Generator** → scopes : `bot` + `applications.commands`
4. Permissions recommandées : `Administrator` (ou Manage Channels + Manage Roles + Kick + Ban + Moderate + Send Messages + Embed Links + Attach Files + Read Message History)
5. Copie l'URL, ouvre-la et invite le bot sur ton serveur

### 2. Installation locale

```bash
cd bot
npm install
cp .env.example .env
# Édite .env avec ton TOKEN, CLIENT_ID, GUILD_ID et les IDs des salons/rôles
```

### 3. Déployer les slash commands sur ton serveur

```bash
npm run deploy:commands
```

> Les commandes sont déployées **sur la guild** (instantané). Pour un déploiement global (1h de propagation) : `npm run deploy:commands -- --global`.

### 4. Lancer le bot

```bash
# Dev (hot reload)
npm run dev

# Production (build + run)
npm run build
npm run start
```

---

## ⚙️ Configuration (.env)

| Variable | Obligatoire | Description |
|---|:---:|---|
| `DISCORD_TOKEN` | ✅ | Token du bot |
| `DISCORD_CLIENT_ID` | ✅ | Client ID de l'application |
| `DISCORD_GUILD_ID` | ✅ | ID du serveur Discord |
| `SITE_API_URL` | — | URL du hub Harrata City (défaut : prod) |
| `SITE_API_TOKEN` | — | Token pour endpoints privés du site |
| `FIVEM_PLAYERS_URL` | — | Fallback direct si site inaccessible |
| `FIVEM_INFO_URL` | — | Idem |
| `STATUS_CHANNEL_ID` | — | Salon de l'embed statut auto |
| `NEWS_CHANNEL_ID` | — | Salon d'annonces actus auto |
| `MOD_LOG_CHANNEL_ID` | — | Salon de logs modération |
| `TICKETS_CATEGORY_ID` | — | Catégorie où créer les tickets |
| `WELCOME_CHANNEL_ID` | — | Salon de bienvenue |
| `LINKED_ROLE_ID` | — | Rôle donné aux comptes liés au site |
| `WHITELIST_ROLE_ID` | — | Rôle whitelistés |
| `STAFF_ROLE_ID` | — | Rôle staff (accès commandes mod) |
| `STATUS_REFRESH_SECONDS` | — | Rafraîchissement statut (défaut 60s) |
| `NEWS_POLL_SECONDS` | — | Polling actus (défaut 300s) |
| `LOG_LEVEL` | — | `trace\|debug\|info\|warn\|error` |

---

## 🏗️ Architecture

```
bot/
├── src/
│   ├── index.ts              # Entry point (client + loaders)
│   ├── config/
│   │   └── env.ts            # Chargement & validation .env
│   ├── lib/
│   │   ├── logger.ts         # Pino logger (pretty en dev)
│   │   ├── commandRegistry.ts # Auto-discovery des commandes
│   │   ├── eventRegistry.ts  # Auto-discovery des events
│   │   └── fivem.ts          # Fetch live FiveM (site + fallback)
│   ├── commands/             # Slash commands (auto-chargées)
│   │   ├── general/          # ping, status
│   │   ├── link/             # link
│   │   ├── whitelist/        # whitelist
│   │   ├── moderation/       # warn, kick, ban, mute
│   │   └── tickets/          # ticket-panel, close
│   ├── events/               # Events Discord (auto-chargés)
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── guildMemberAdd.ts
│   ├── modules/              # Logique métier réutilisable
│   │   ├── statusUpdater.ts  # Embed live auto
│   │   ├── newsPoster.ts     # Poll actus
│   │   ├── modLog.ts         # Envoi log mod
│   │   ├── ticketManager.ts  # Création/fermeture tickets
│   │   └── whitelistManager.ts # Traitement modal whitelist
│   └── types/
│       └── command.ts
├── scripts/
│   └── deploy-commands.ts    # Enregistrement des slash commands
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.cjs      # PM2
├── .env.example
├── package.json
└── tsconfig.json
```

**Ajouter une nouvelle commande** : crée un fichier dans `src/commands/<catégorie>/` avec un `export default` de type `Command`. Elle sera auto-détectée au démarrage, il suffit de relancer `npm run deploy:commands`.

---

## 🐳 Déploiement sur VPS

### Option 1 — Docker Compose (recommandé)

```bash
# Sur ton VPS
git clone https://github.com/kaazuke/harrata-city.git
cd harrata-city/bot
cp .env.example .env
nano .env                     # remplis les secrets

docker compose up -d --build  # build + start en arrière-plan
docker compose logs -f        # suivre les logs
docker compose restart        # redémarrer après modif .env
```

**Déploiement des slash commands depuis le VPS :**

```bash
docker compose run --rm harrata-bot node dist/scripts/deploy-commands.js
```

### Option 2 — PM2 (sans Docker)

```bash
# Prérequis : Node.js 20+ et PM2 installés
npm install -g pm2

# Setup
git clone https://github.com/kaazuke/harrata-city.git
cd harrata-city/bot
cp .env.example .env && nano .env
npm ci
npm run build
npm run deploy:commands:prod

# Lancer
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # auto-démarrage au reboot

# Gestion
pm2 logs harrata-bot
pm2 restart harrata-bot
pm2 stop harrata-bot
pm2 monit      # dashboard live
```

### Option 3 — systemd

```ini
# /etc/systemd/system/harrata-bot.service
[Unit]
Description=Harrata City Discord Bot
After=network.target

[Service]
Type=simple
User=harrata
WorkingDirectory=/opt/harrata-city/bot
EnvironmentFile=/opt/harrata-city/bot/.env
ExecStart=/usr/bin/node dist/src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now harrata-bot
sudo journalctl -u harrata-bot -f
```

---

## 🛠️ Scripts npm

```bash
npm run dev                  # Hot reload (tsx watch)
npm run build                # Compilation TypeScript → dist/
npm run start                # Lancement production
npm run deploy:commands      # Enregistre les slash commands (guild)
npm run deploy:commands -- --global   # Enregistrement global
npm run lint                 # tsc --noEmit (check types)
npm run clean                # Nettoyer dist/
```

---

## 🧑‍💻 Développer

### Ajouter une commande

```typescript
// src/commands/general/hello.ts
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Dit bonjour"),
  execute: async (interaction) => {
    await interaction.reply(`Salut ${interaction.user} !`);
  },
};

export default command;
```

Puis : `npm run deploy:commands` et `npm run dev`.

### Ajouter un event

```typescript
// src/events/messageCreate.ts
import type { EventHandler } from "../lib/eventRegistry.js";

const handler: EventHandler<"messageCreate"> = {
  name: "messageCreate",
  execute: async (message) => {
    if (message.author.bot) return;
    // ...
  },
};

export default handler;
```

---

## 🔒 Sécurité

- Ne commit **jamais** ton `.env` (il est dans `.gitignore`)
- Reset ton token si tu le leak : [Developer Portal > Bot > Reset Token](https://discord.com/developers/applications)
- Donne le moins de permissions possibles dans l'URL OAuth
- Les commandes de modération vérifient **2 couches** : permissions Discord natives + rôle staff

---

## 📝 Licence

Projet indépendant — fait pour la communauté **Harrata City**.
