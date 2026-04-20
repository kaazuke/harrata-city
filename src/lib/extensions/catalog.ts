/**
 * Catalogue d'extensions disponibles. Pour l'instant tout est local et "mock"
 * (placeholder pour une future marketplace en ligne / paiement Tebex).
 *
 * Quand l'extension passera en vente :
 *   - mettre `comingSoon: false`
 *   - définir `pricing: "paid"` + `priceLabel`
 *   - pointer `purchaseUrl` vers la fiche Tebex / Stripe
 */

export type ExtensionPricing = "free" | "paid";

export interface ExtensionListing {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  iconUrl?: string;
  category: "forum" | "boutique" | "communaute" | "serveur" | "ui" | "autre";
  pricing: ExtensionPricing;
  priceLabel?: string;
  /** Si true, le bouton est désactivé et libellé "Bientôt en vente". */
  comingSoon?: boolean;
  /** URL vers la fiche d'achat (Tebex, Stripe, page boutique…). */
  purchaseUrl?: string;
  /** Tags / mots-clés courts. */
  tags?: string[];
  /** Settings par défaut appliqués à l'installation depuis le catalogue. */
  defaultSettings?: Record<string, unknown>;
}

export const CATEGORY_LABELS: Record<ExtensionListing["category"], string> = {
  forum: "Forum",
  boutique: "Boutique",
  communaute: "Communauté",
  serveur: "Serveur",
  ui: "Interface",
  autre: "Autre",
};

export const EXTENSION_CATALOG: ExtensionListing[] = [
  {
    id: "welcome-banner",
    name: "Bannière d'accueil (démo)",
    description:
      "Extension d'exemple : bannière personnalisable en haut du site (message + couleur + bouton CTA). Sert de cas de test pour l'import .zip.",
    version: "1.0.0",
    author: "DKN Community",
    category: "ui",
    pricing: "free",
    purchaseUrl: "/extensions/welcome-banner.zip",
    tags: ["démo", "bannière", "exemple"],
    defaultSettings: {
      message: "Bienvenue sur notre serveur RP — pensez à lire le règlement !",
      color: "#7aa2f7",
      ctaLabel: "Rejoindre Discord",
      ctaUrl: "",
      dismissible: true,
    },
  },
  {
    id: "live-chat",
    name: "Chat live",
    description:
      "Panneau de chat flottant en bas du site, synchronisé en temps réel entre tous les onglets ouverts du navigateur. Identité prise du compte connecté.",
    version: "1.0.0",
    author: "DKN Community",
    category: "communaute",
    pricing: "free",
    purchaseUrl: "/extensions/live-chat.zip",
    tags: ["chat", "communauté", "temps réel"],
    defaultSettings: {
      title: "Chat live",
      accentColor: "#7aa2f7",
      position: "bottom-right",
      maxMessages: 60,
      slowmodeSeconds: 0,
      welcomeMessage: "Aucun message. Soyez le premier à écrire !",
    },
  },
  {
    id: "fivem-player-counter",
    name: "Compteur joueurs FiveM live",
    description:
      "Widget flottant qui interroge directement /players.json de votre serveur FiveM (avec cache 5s) et affiche le nombre de joueurs en temps réel.",
    version: "1.0.0",
    author: "DKN Community",
    category: "serveur",
    pricing: "free",
    purchaseUrl: "/extensions/fivem-player-counter.zip",
    tags: ["fivem", "joueurs", "live", "api"],
    defaultSettings: {
      serverUrl: "",
      refreshSeconds: 30,
      label: "Joueurs FiveM",
      position: "top-right",
      accentColor: "#52e3a3",
      maxPlayers: 64,
    },
  },
  {
    id: "discord-widget",
    name: "Discord widget",
    description:
      "Encart « Rejoindre le Discord » en bas à gauche avec aperçu des membres en ligne, via le widget officiel Discord.",
    version: "1.0.0",
    author: "DKN Community",
    category: "communaute",
    pricing: "free",
    purchaseUrl: "/extensions/discord-widget.zip",
    tags: ["discord", "communauté", "live"],
    defaultSettings: {
      serverId: "",
      refreshSeconds: 60,
      position: "bottom-left",
      inviteUrl: "",
      accentColor: "#5865F2",
      collapsedByDefault: true,
    },
  },
  {
    id: "analytics-pageviews",
    name: "Analytics maison",
    description:
      "Tracker invisible qui compte les vues de pages dans le navigateur (aucun envoi serveur), avec dashboard Top pages + graphique 14 jours dans cet onglet une fois installé.",
    version: "1.0.0",
    author: "DKN Community",
    category: "autre",
    pricing: "free",
    purchaseUrl: "/extensions/analytics-pageviews.zip",
    tags: ["analytics", "stats", "local"],
    defaultSettings: {},
  },
  {
    id: "theme-presets",
    name: "Theme switcher",
    description:
      "Ajoute un sélecteur de thèmes 🎨 dans la barre du site avec 5 presets prêts à l'emploi (Midnight, Neon, Sakura, Sunset, Mint), appliqués en 1 clic.",
    version: "1.0.0",
    author: "DKN Community",
    category: "ui",
    pricing: "free",
    purchaseUrl: "/extensions/theme-presets.zip",
    tags: ["thème", "design", "switcher"],
    defaultSettings: {},
  },
  {
    id: "tickets-rp",
    name: "Tickets RP",
    description:
      "Système de tickets de signalement / question / bug : bouton flottant pour les joueurs, dashboard de modération (statuts ouvert / en cours / fermé) directement dans cet onglet.",
    version: "1.0.0",
    author: "DKN Community",
    category: "serveur",
    pricing: "free",
    purchaseUrl: "/extensions/tickets-rp.zip",
    tags: ["tickets", "support", "modération"],
    defaultSettings: {
      buttonLabel: "Signaler",
      position: "top-left",
      accentColor: "#ff8c42",
      allowAnonymous: false,
    },
  },
  {
    id: "forum-antispam",
    name: "Anti-spam Forum",
    description:
      "Filtre automatique des messages : détection des liens douteux, doublons rapides, mots interdits configurables.",
    version: "1.0.0",
    author: "DKN Community",
    category: "forum",
    pricing: "paid",
    priceLabel: "9,90 €",
    comingSoon: true,
    tags: ["forum", "modération", "automatisation"],
  },
  {
    id: "discord-webhook-sync",
    name: "Discord Webhook Sync",
    description:
      "Relaie automatiquement les nouveaux sujets, réponses et logs forum vers un salon Discord via webhook.",
    version: "1.0.0",
    author: "DKN Community",
    category: "communaute",
    pricing: "paid",
    priceLabel: "14,90 €",
    comingSoon: true,
    tags: ["discord", "webhook", "forum"],
  },
  {
    id: "tickets-rp-pro",
    name: "Tickets RP — version pro",
    description:
      "Version pro à venir : assignation à un staff, escalade, SLA, export CSV, intégration Discord webhook (pour notifier l'équipe à chaque ticket).",
    version: "1.0.0",
    author: "DKN Community",
    category: "serveur",
    pricing: "paid",
    priceLabel: "19,90 €",
    comingSoon: true,
    tags: ["tickets", "support", "rp"],
  },
];

export function getListing(id: string): ExtensionListing | null {
  return EXTENSION_CATALOG.find((l) => l.id === id) ?? null;
}
