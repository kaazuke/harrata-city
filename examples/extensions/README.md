# Créer une extension

Ce dossier sert d'exemples et de point de départ pour développer vos propres extensions.

## Sommaire

1. [Concept en 30 secondes](#concept)
2. [Anatomie du `extension.json`](#manifest)
3. [Empaquetage `.zip`](#zip)
4. [Distribuer son extension](#distribuer)
5. [Donner un effet visible (le code)](#effet)
6. [Patterns recommandés](#patterns)
7. [Tutoriel pas-à-pas : "Hello world"](#tutoriel)
8. [Limites actuelles](#limites)

---

<a id="concept"></a>
## 1. Concept en 30 secondes

Une extension du site, c'est :

- Un **manifest** (`extension.json`) qui décrit l'extension (id, nom, settings par défaut…),
- Optionnellement, des **assets** (icônes, images),
- Le tout zippé et importable depuis Admin → Extensions.

Le système est **100% client-side** : les manifests sont stockés dans `localStorage` (via `SiteConfig.extensions`). Le code qui consomme une extension est compilé dans le site (TypeScript / React), pas dans le zip. Le zip ne sert qu'à la **déclaration et configuration** : un peu comme un fichier `package.json` qui dit "active la fonctionnalité X avec ces réglages".

> Conséquence importante : pour qu'une extension ait un effet visible, le code consommateur (composant React + `isExtensionEnabled`) doit déjà exister dans le site. Voir [section 5](#effet).

---

<a id="manifest"></a>
## 2. Anatomie du `extension.json`

Le manifest est un JSON à la racine du zip :

```json
{
  "id": "mon-extension",
  "name": "Mon extension",
  "version": "1.0.0",
  "author": "Votre nom",
  "category": "ui",
  "description": "Phrase d'une ligne expliquant ce que ça fait.",
  "iconUrl": "icon.png",
  "settings": {
    "monParam": "valeur par défaut",
    "couleur": "#7aa2f7",
    "actif": true
  }
}
```

### Champs

| Champ         | Type   | Obligatoire | Notes                                                                      |
| ------------- | ------ | ----------- | -------------------------------------------------------------------------- |
| `id`          | string | oui         | `[a-z0-9_-]{2,40}`. Identifiant stable, sert de clé partout.               |
| `name`        | string | oui         | Nom affiché.                                                               |
| `version`     | string | oui         | SemVer recommandé (`1.0.0`).                                               |
| `description` | string | non         | Une phrase, affichée dans le catalogue et la liste installées.             |
| `author`      | string | non         | Votre nom / pseudo.                                                        |
| `category`    | enum   | non         | `forum` \| `boutique` \| `communaute` \| `serveur` \| `ui` \| `autre`.     |
| `iconUrl`     | string | non         | Chemin relatif dans le zip (`icon.png`) ou URL absolue (`https://…`).      |
| `settings`    | object | non         | Configuration par défaut. Les clés sont libres, propres à votre extension. |

> Tout champ supplémentaire est ignoré silencieusement (pas d'erreur).

---

<a id="zip"></a>
## 3. Empaquetage `.zip`

Règles strictes (sinon import refusé) :

- **`extension.json` doit être à la racine du zip** (pas dans un sous-dossier).
- Taille max : **5 Mo**.
- Une icône optionnelle nommée `icon.png` à la racine est convertie automatiquement en data URL et stockée dans `settings._assets`.

### Sur Windows (PowerShell)

```powershell
cd examples/extensions/mon-extension
Compress-Archive -Path .\* -DestinationPath ..\..\..\public\extensions\mon-extension.zip -Force
```

### Sur macOS / Linux

```bash
cd examples/extensions/mon-extension
zip -r ../../../public/extensions/mon-extension.zip .
```

> ⚠️ Sur macOS, n'utilisez **pas** "Compresser" depuis le Finder : il crée un dossier parent dans le zip. Préférez la commande `zip` ou ajoutez les fichiers via clic droit + "Compresser des éléments…" depuis l'**intérieur** du dossier.

---

<a id="distribuer"></a>
## 4. Distribuer son extension

3 voies d'installation, toutes équivalentes côté `SiteConfig` :

1. **Via le catalogue** (le plus user-friendly)
   - Ajoutez une entrée à `EXTENSION_CATALOG` dans `src/lib/extensions/catalog.ts`.
   - Mettez le zip dans `public/extensions/votre-id.zip`.
   - Pointez `purchaseUrl` vers `/extensions/votre-id.zip`.
   - Le bouton "Installer" télécharge et importe le zip automatiquement.

2. **Drag & drop d'un `.zip`**
   - Admin → Extensions → glisser un `.zip` dans la zone d'import.

3. **Import JSON manuel**
   - Admin → Extensions → "Importer un JSON" → coller le contenu du `extension.json`.

---

<a id="effet"></a>
## 5. Donner un effet visible (le code)

C'est l'étape clé. Le manifest seul ne fait rien. Vous devez écrire un composant React qui :

1. Lit la config et vérifie que l'extension est activée,
2. Lit ses settings,
3. Se rend (ou non) en conséquence.

### Pattern minimal

```tsx
// src/components/extensions/MonExtension.tsx
"use client";

import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

interface MesSettings {
  monParam?: string;
  couleur?: string;
}

export function MonExtension() {
  const { config } = useSiteConfig();
  if (!isExtensionEnabled(config, "mon-extension")) return null;

  const ext = getExtension(config, "mon-extension");
  const settings = (ext?.settings ?? {}) as MesSettings;

  return (
    <div style={{ color: settings.couleur ?? "#7aa2f7" }}>
      {settings.monParam ?? "Hello"}
    </div>
  );
}
```

### Brancher le composant

Selon ce que fait votre extension, montez-le au bon endroit :

| Type d'extension          | Où le monter                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| Overlay / widget flottant | `src/components/extensions/ExtensionsHost.tsx` (un seul point central) |
| Élément dans le header    | `src/components/layout/SiteHeader.tsx`                                 |
| Bandeau global            | `src/app/layout.tsx`                                                   |
| Section admin             | `src/components/admin/AdminExtensionsTab.tsx` (rendu conditionnel)     |

Exemple pour `ExtensionsHost.tsx` :

```tsx
import { MonExtension } from "@/components/extensions/MonExtension";

export function ExtensionsHost() {
  return (
    <>
      {/* … autres extensions … */}
      <MonExtension />
    </>
  );
}
```

---

<a id="patterns"></a>
## 6. Patterns recommandés

### Persister l'état UI hors `SiteConfig`

Pour ne **pas** déclencher de re-render global du site à chaque event (ex: pageview tracker, position de scroll, "fermé/ouvert"…), utilisez `localStorage` direct avec une clé préfixée :

```ts
const KEY = "ext:mon-extension:dismissed";
localStorage.setItem(KEY, "1");
```

> Convention : préfixez toutes vos clés avec `ext:<id>:`.

### Sauvegarder un changement de settings

Pour un changement persistant (qui suit les exports / réinstallations), passez par le `SiteConfigProvider` :

```tsx
const { config, setConfig, persist } = useSiteConfig();

function changerCouleur(couleur: string) {
  const next = {
    ...config,
    extensions: (config.extensions ?? []).map((e) =>
      e.id === "mon-extension" ? { ...e, settings: { ...e.settings, couleur } } : e,
    ),
  };
  setConfig(next);
  persist(next);
}
```

Ou utilisez le helper `updateExtensionSettings` :

```ts
import { updateExtensionSettings } from "@/lib/extensions/manage";
const next = updateExtensionSettings(config, "mon-extension", { couleur: "#ff6b9d" });
setConfig(next);
persist(next);
```

### Synchroniser entre onglets sans backend

Utilisez `BroadcastChannel` (voir `LiveChatExtension` ou `tickets-store.ts`) :

```ts
const ch = new BroadcastChannel("ext:mon-extension");
ch.postMessage({ type: "update", payload: { /* … */ } });
ch.onmessage = (e) => { /* … */ };
```

### Hydration : éviter les mismatches SSR

Les composants d'extension lisent `localStorage`, donc côté serveur ils ne savent rien. Utilisez ce pattern :

```tsx
const [hydrated, setHydrated] = useState(false);
useEffect(() => setHydrated(true), []);
if (!hydrated) return null;
```

### Settings par défaut

Toujours fournir `defaultSettings` dans l'entrée du catalogue ET un fallback dans le composant. Comme ça, l'extension marche immédiatement après installation, sans configuration obligatoire.

---

<a id="tutoriel"></a>
## 7. Tutoriel pas-à-pas : "Hello world"

Faisons une extension qui affiche un emoji animé en bas à droite.

### Étape 1 — Créer le dossier source

```
examples/extensions/hello-emoji/
├── extension.json
└── README.md
```

`extension.json` :

```json
{
  "id": "hello-emoji",
  "name": "Hello Emoji",
  "version": "1.0.0",
  "author": "Vous",
  "category": "ui",
  "description": "Affiche un emoji qui rebondit en bas à droite.",
  "settings": {
    "emoji": "👋",
    "size": 48
  }
}
```

### Étape 2 — Écrire le composant React

`src/components/extensions/HelloEmojiExtension.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

export function HelloEmojiExtension() {
  const { config } = useSiteConfig();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;
  if (!isExtensionEnabled(config, "hello-emoji")) return null;

  const ext = getExtension(config, "hello-emoji");
  const emoji = (ext?.settings?.emoji as string) ?? "👋";
  const size = (ext?.settings?.size as number) ?? 48;

  return (
    <div
      className="fixed bottom-24 right-6 z-30 animate-bounce select-none"
      style={{ fontSize: size }}
      aria-hidden
    >
      {emoji}
    </div>
  );
}
```

### Étape 3 — Monter le composant

Dans `src/components/extensions/ExtensionsHost.tsx`, ajoutez :

```tsx
import { HelloEmojiExtension } from "@/components/extensions/HelloEmojiExtension";

// dans le JSX :
<HelloEmojiExtension />
```

### Étape 4 — Ajouter au catalogue (optionnel)

Dans `src/lib/extensions/catalog.ts`, ajoutez :

```ts
{
  id: "hello-emoji",
  name: "Hello Emoji",
  description: "Emoji qui rebondit en bas à droite.",
  version: "1.0.0",
  author: "Vous",
  category: "ui",
  pricing: "free",
  purchaseUrl: "/extensions/hello-emoji.zip",
  defaultSettings: { emoji: "👋", size: 48 },
}
```

### Étape 5 — Construire le zip

```powershell
cd examples/extensions/hello-emoji
Compress-Archive -Path .\* -DestinationPath ..\..\..\public\extensions\hello-emoji.zip -Force
```

### Étape 6 — Tester

Admin → Extensions → carte "Hello Emoji" → Installer. L'emoji apparaît instantanément. Configurer → mettre `"emoji": "🎉", "size": 80` → enregistrer → l'emoji change en direct.

---

<a id="limites"></a>
## 8. Limites actuelles (à connaître)

- **Pas de code dynamique dans le zip** : on n'exécute pas de JS depuis le zip pour des raisons de sécurité. Le code consommateur doit être dans le repo. Pour une vraie marketplace il faudrait un système de plugins signés / sandbox iframe.
- **Pas de backend** : tout passe par `localStorage`. Donc pas de partage entre utilisateurs (sauf via `BroadcastChannel` entre onglets du même navigateur).
- **Pas de hooks d'activation/désactivation** côté code consommateur (ex: `onEnable`, `onDisable`). Si vous avez besoin de cleanup, faites-le dans un `useEffect` déclenché par `isExtensionEnabled`.
- **Pas de dépendances entre extensions** : chaque extension est indépendante. Si vous avez besoin de chaîner deux extensions, il faut le câbler à la main dans le code.

---

## Pour aller plus loin

Inspirez-vous des extensions existantes :

| Extension                  | Ce qu'elle illustre                                            |
| -------------------------- | -------------------------------------------------------------- |
| `welcome-banner`           | Cas le plus simple : composant qui lit settings et se rend.   |
| `live-chat`                | UI flottante + `BroadcastChannel` entre onglets + identité.    |
| `theme-presets`            | Modifier la config globale du site, persistance dans settings. |
| `analytics-pageviews`      | Tracker invisible + dashboard admin conditionnel.              |
| `tickets-rp`               | Modal complexe + store dédié + sync admin via channel.         |
| `fivem-player-counter`     | Fetch d'API externe + cache local + intervalle configurable.   |
| `discord-widget`           | Fetch d'API externe + UI repliable + persistance d'état UI.    |
