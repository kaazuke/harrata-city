import type { RoleDefinition } from "@/lib/account/types";

export type ThemeMode = "dark" | "light" | "system";
export type LayoutVariant = "wide" | "boxed";
export type RadiusPreset = "sm" | "md" | "lg";

export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "select"
  | "checkbox";

export interface FormField {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: FormFieldType;
  options?: string[];
}

export interface NavItem {
  id: string;
  href: string;
  label: string;
  enabled: boolean;
}

export interface SiteTheme {
  mode: ThemeMode;
  layout: LayoutVariant;
  radius: RadiusPreset;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    muted: string;
    border: string;
    foreground: string;
    danger: string;
    success: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  heroBackground: string;
  heroOverlayOpacity: number;
  noiseOverlay: boolean;
}

export interface ModuleToggles {
  announcementBar: boolean;
  playerCounter: boolean;
  serverStatus: boolean;
  ipCopy: boolean;
  statsPreview: boolean;
  boutiquePromo: boolean;
  newsHighlight: boolean;
  galleryFilters: boolean;
  ticketVisual: boolean;
  /** Forum communautaire (routes /forum, lien nav si entrée présente). */
  forum: boolean;
  /** Affiche automatiquement les comptes admin/modérateur sur la page Équipe. */
  staffAutoFromAccounts?: boolean;
}

/** Message de réponse dans un sujet du forum. */
/** Réaction emoji sur un sujet ou une réponse. `users` contient les @pseudos. */
export interface ForumReaction {
  emoji: string;
  users: string[];
}

export interface ForumReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  reactions?: ForumReaction[];
}

/** Sujet : message initial + réponses (stocké côté client / export JSON). */
export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  body: string;
  createdAt: string;
  /** Mise à jour automatique : max(createdAt, dernière réponse). */
  updatedAt?: string;
  replies: ForumReply[];
  pinned?: boolean;
  locked?: boolean;
  reactions?: ForumReaction[];
  /** Compteur de vues local (incrémenté côté client lors de l’ouverture). */
  views?: number;
}

export interface ForumCategory {
  id: string;
  title: string;
  description: string;
  /** Couleur d’accent (CSS color). Optionnel. */
  accent?: string;
  /**
   * Si défini, restreint l’accès aux rôles listés.
   * Peut contenir n’importe quel `roleId` défini dans `siteConfig.roles`,
   * ou les valeurs historiques `"admin"` / `"moderator"`.
   */
  restrictedTo?: string[];
}

/** Notification individuelle (réponse à un sujet, mention, etc.). */
export interface ForumNotification {
  id: string;
  /** @pseudo du destinataire. */
  recipient: string;
  /** @pseudo de l’acteur. */
  actor: string;
  type: "reply" | "topic_locked" | "topic_deleted";
  topicId?: string;
  topicTitle?: string;
  categoryId?: string;
  replyId?: string;
  excerpt?: string;
  createdAt: string;
  read?: boolean;
}

/** Action enregistrée dans le journal de modération du forum. */
export type ForumLogAction =
  | "topic_created"
  | "topic_deleted"
  | "topic_edited"
  | "topic_pinned"
  | "topic_unpinned"
  | "topic_locked"
  | "topic_unlocked"
  | "reply_created"
  | "reply_deleted"
  | "reply_edited";

export interface ForumLogEntry {
  id: string;
  at: string;
  /** @ pseudonyme de l’auteur de l’action. */
  actor: string;
  /** Rôle de l’acteur au moment de l’action (ID + label si custom). */
  actorRole: string;
  action: ForumLogAction;
  /** Référence du sujet concerné (et de la réponse si applicable). */
  topicId?: string;
  topicTitle?: string;
  replyId?: string;
  /** @ pseudonyme du propriétaire de l’élément modéré (auteur du sujet/réponse). */
  targetAuthor?: string;
  /** Note ou raison libre, p.ex. extrait du contenu supprimé (300 chars max). */
  note?: string;
}

/* ─────────────── Extensions ─────────────── */

/** Une extension installée localement (configuration persistée). */
export interface Extension {
  /** Identifiant unique stable (slug). */
  id: string;
  /** Nom affiché dans l’admin. */
  name: string;
  description?: string;
  /** Version installée (semver libre). */
  version: string;
  author?: string;
  /** URL d’icône (optionnelle). */
  iconUrl?: string;
  /** Catégorie d’organisation (ex. "forum", "boutique", "communauté"). */
  category?: string;
  /** Active / désactivée à la volée sans désinstaller. */
  enabled: boolean;
  /** Date d’installation ISO. */
  installedAt: string;
  /**
   * Configuration libre par extension. Le code consommateur typesafe
   * peut caster ce champ vers son propre type interne.
   */
  settings?: Record<string, unknown>;
  /** Référence au listing du catalogue d’origine si applicable. */
  source?: "catalog" | "manual" | "marketplace";
}

export interface ServerBlock {
  ip: string;
  displayName: string;
  cfxJoinUrl?: string;
  status: "online" | "offline" | "maintenance";
  playersOnline: number;
  maxPlayers: number;
  /** Placeholder pour future API FiveM / JSON live */
  metricsApiUrl?: string;
  /**
   * Code Cfx.re du serveur (6+ caractères, ex. "abcxyz").
   * Permet de récupérer automatiquement joueurs / max / statut / hostname
   * via https://servers-frontend.fivem.net/api/servers/single/{code}
   * (proxy côté serveur : `/api/server/live`).
   */
  cfxCode?: string;
  /**
   * URL publique renvoyant la liste des joueurs (format FiveM `/players.json`).
   * Si fournie, elle est utilisée pour récupérer le nombre de joueurs et la liste.
   * Peut cohabiter avec `cfxCode` — dans ce cas, `/players.json` a priorité pour
   * le compteur et la liste des joueurs.
   */
  playersJsonUrl?: string;
  /** Activer la synchronisation automatique depuis les APIs (défaut : true si cfxCode ou playersJsonUrl défini). */
  autoLive?: boolean;
  /** Intervalle de rafraîchissement en secondes (minimum 10, défaut 30). */
  liveRefreshSeconds?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  tier: "founder" | "admin" | "mod" | "dev" | "support";
  avatarUrl?: string;
  bio: string;
}

export interface RuleCategory {
  id: string;
  title: string;
  items: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: "patch" | "news" | "event" | "community";
  featured?: boolean;
  bodyMarkdown: string;
}

export interface BoutiqueProduct {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  tebexUrl?: string;
  /** Id package Tebex (numérique) si vous générez l’URL via `integrations.tebex` */
  tebexPackageId?: string;
  perks: string[];
  badge?: "vip" | "new" | "promo" | "limited";
  promoLabel?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  src: string;
  category: "screenshot" | "video" | "clip";
  href?: string;
}

/**
 * Média affiché spécifiquement dans la section "Médias" de la page Présentation.
 * - `image`  : URL d’image (jpg/png/webp/gif).
 * - `video`  : URL d’un fichier vidéo (mp4, webm) lu en `<video controls>`.
 * - `youtube`: ID YouTube (ex. "dQw4w9WgXcQ") ou URL — extraite côté affichage.
 */
export interface PresentationMedia {
  id: string;
  type: "image" | "video" | "youtube";
  src: string;
  title?: string;
  caption?: string;
  /** Image de prévisualisation pour les vidéos locales (`type === "video"`). */
  poster?: string;
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FeatureTile {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "users" | "economy" | "map" | "discord" | "spark";
}

export interface LoreSection {
  title: string;
  body: string;
}

export interface SiteMeta {
  siteName: string;
  slogan: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  logoUrl?: string;
}

/** Textes d’interface et CSS additionnel — entièrement éditables depuis l’admin. */
export interface LayoutCopy {
  headerTagline: string;
  announcementBadge: string;
  homeHeroBadge: string;
  homeJoinCfx: string;
  homeJoinNoLink: string;
  homeDiscord: string;
  homeSectionWhyTitle: string;
  homeSectionWhyDesc: string;
  homeWhyCta: string;
  homeNewsTitle: string;
  homeNewsCta: string;
  homeStatsTitle: string;
  homeStatsDesc: string;
  homeStatsCta: string;
  /** Bloc forum accueil (visible si module `forum` actif). */
  homeForumTitle: string;
  homeForumDesc: string;
  homeForumCta: string;
  /** Libellé bouton hero vers /forum. */
  homeForumHeroLabel: string;
  serverPanelTitle: string;
  serverPanelSubtitle: string;
  serverLiveBadge: string;
  serverColPlayers: string;
  serverColStatus: string;
  serverColConnection: string;
  serverCopyButton: string;
  serverCopiedButton: string;
  serverStatusOnline: string;
  serverStatusMaintenance: string;
  serverStatusOffline: string;
  footerCommunityEyebrow: string;
  footerLinksEyebrow: string;
  footerLegalEyebrow: string;
  footerLegalBody: string;
  footerContactLink: string;
  footerDiscord: string;
  footerCfx: string;
  footerTebex: string;
  /** CSS brut injecté dans le document (personnalisation avancée). */
  customCss: string;
}

export interface SocialLinks {
  discord: string;
  cfx?: string;
  steam?: string;
  tebex?: string;
  tiktok?: string;
  youtube?: string;
}

export interface Announcement {
  id: string;
  text: string;
  active: boolean;
}

/** Intégrations OAuth / boutiques — les secrets restent côté serveur (.env). */
export interface IntegrationsConfig {
  discordOAuth: {
    enabled: boolean;
  };
  steamOpenId: {
    enabled: boolean;
  };
  tebex: {
    /** Ex. https://monsite.tebex.io — utilisé pour générer des liens package si besoin */
    storeBaseUrl: string;
    /** Si true et `storeBaseUrl` défini, la boutique peut dériver des URLs /package/{id} */
    enableGeneratedPackageLinks: boolean;
  };
}

export interface SiteConfig {
  meta: SiteMeta;
  layoutCopy: LayoutCopy;
  theme: SiteTheme;
  nav: NavItem[];
  modules: ModuleToggles;
  social: SocialLinks;
  server: ServerBlock;
  announcements: Announcement[];
  features: FeatureTile[];
  lore: LoreSection[];
  strengths: string[];
  economyBlurb: string;
  staff: StaffMember[];
  rules: RuleCategory[];
  articles: Article[];
  boutiqueProducts: BoutiqueProduct[];
  gallery: GalleryItem[];
  /** Médias mis en avant sur la page Présentation (images, vidéos locales, YouTube). */
  presentationMedia?: PresentationMedia[];
  statCards: StatCard[];
  statSeries: { label: string; value: number }[];
  faq: FaqItem[];
  /**
   * Définitions de rôles & permissions. Si absent, fallback sur les 3 rôles
   * builtin (admin / moderator / member). Les rôles builtin restent éditables
   * mais ne peuvent pas être supprimés.
   */
  roles?: RoleDefinition[];
  /**
   * Extensions installées sur cette instance (achetées, importées, locales).
   * Le code consommateur lit `extensions[].enabled` pour activer ses fonctions.
   */
  extensions?: Extension[];
  forumCategories: ForumCategory[];
  forumTopics: ForumTopic[];
  /** Journal des actions de modération du forum (capé à 500 entrées). */
  forumLogs?: ForumLogEntry[];
  /** Notifications du forum (capé à 200 entrées par destinataire à l’usage). */
  forumNotifications?: ForumNotification[];
  forms: {
    whitelist: FormField[];
    staff: FormField[];
    business: FormField[];
  };
  contact: {
    supportEmail?: string;
    ticketDiscordChannel?: string;
  };
  locale: "fr" | "en";
  integrations: IntegrationsConfig;
}
