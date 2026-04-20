import { BUILTIN_ROLE_DEFINITIONS } from "@/lib/account/types";
import type { SiteConfig } from "./types";

/* IP & port publics du serveur FiveM — utilisés partout (admin panel, hero, players.json). */
const FIVEM_SERVER_IP = "51.68.125.155";
const FIVEM_SERVER_PORT = 30120;
const FIVEM_SERVER_ENDPOINT = `${FIVEM_SERVER_IP}:${FIVEM_SERVER_PORT}`;

export const defaultSiteConfig: SiteConfig = {
  locale: "fr",
  meta: {
    siteName: "Harrata City",
    slogan: "La ville ne dort jamais. Votre histoire, si.",
    description:
      "Harrata City — serveur FiveM Roleplay : économie vivante, factions, métiers et expérience urbaine réaliste.",
    keywords: [
      "Harrata City",
      "FiveM",
      "GTA RP",
      "roleplay",
      "whitelist",
      "serveur français",
    ],
    ogImage: "/brand/logo-banner.png",
    logoUrl: "/brand/icon.png",
  },
  layoutCopy: {
    headerTagline: "FiveM Roleplay",
    announcementBadge: "Info",
    homeHeroBadge: "FiveM Roleplay",
    homeJoinCfx: "Rejoindre (Cfx.re)",
    homeJoinNoLink: "Rejoindre",
    homeDiscord: "Discord",
    homeSectionWhyTitle: "Pourquoi nous rejoindre",
    homeSectionWhyDesc:
      "Fonctionnalités et contenus pilotés depuis l’admin : textes, liens Discord / Cfx.re, Tebex, couleurs et modules.",
    homeWhyCta: "Découvrir le projet →",
    homeNewsTitle: "Dernières actualités",
    homeNewsCta: "Voir tout →",
    homeStatsTitle: "Statistiques (aperçu)",
    homeStatsDesc:
      "Chiffres d’exemple — remplacez-les par vos données (API, base) depuis la configuration du site.",
    homeStatsCta: "Voir les graphiques →",
    homeForumTitle: "Forum communautaire",
    homeForumDesc:
      "Échangez avec les joueurs : présentations, lore, idées de scènes et entraide. Ouvrez un sujet ou répondez — tout est enregistré avec la configuration du site (navigateur / export JSON).",
    homeForumCta: "Ouvrir le forum →",
    homeForumHeroLabel: "Forum",
    serverPanelTitle: "Serveur",
    serverPanelSubtitle: "Indicateurs éditables (admin)",
    serverLiveBadge: "Live",
    serverColPlayers: "Joueurs en ligne",
    serverColStatus: "Statut",
    serverColConnection: "Connexion",
    serverCopyButton: "Copier l’IP / commande",
    serverCopiedButton: "Copié",
    serverStatusOnline: "En ligne",
    serverStatusMaintenance: "Maintenance",
    serverStatusOffline: "Hors ligne",
    footerCommunityEyebrow: "Communauté",
    footerLinksEyebrow: "Liens rapides",
    footerLegalEyebrow: "Légal",
    footerLegalBody:
      "Template modifiable. GTA V et marques associées appartiennent à leurs détenteurs. Hub communautaire indépendant.",
    footerContactLink: "Contact & support",
    footerDiscord: "Discord",
    footerCfx: "Cfx.re — rejoindre",
    footerTebex: "Boutique",
    customCss: "",
  },
  theme: {
    mode: "dark",
    layout: "wide",
    radius: "md",
    colors: {
      primary: "#5eead4",
      secondary: "#818cf8",
      accent: "#f472b6",
      background: "#06070d",
      surface: "#0a0c14",
      muted: "#94a3b8",
      border: "#1a2130",
      foreground: "#e8edf7",
      danger: "#fb7185",
      success: "#4ade80",
    },
    fonts: {
      heading: "Syne",
      body: "DM Sans",
    },
    heroBackground:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80",
    heroOverlayOpacity: 0.72,
    noiseOverlay: true,
  },
  nav: [
    { id: "home", href: "/", label: "Accueil", enabled: true },
    {
      id: "presentation",
      href: "/presentation",
      label: "Présentation",
      enabled: true,
    },
    { id: "reglement", href: "/reglement", label: "Règlement", enabled: true },
    {
      id: "candidatures",
      href: "/candidatures",
      label: "Candidatures",
      enabled: true,
    },
    { id: "boutique", href: "/boutique", label: "Boutique", enabled: true },
    { id: "equipe", href: "/equipe", label: "Équipe", enabled: true },
    {
      id: "actualites",
      href: "/actualites",
      label: "Actualités",
      enabled: true,
    },
    { id: "forum", href: "/forum", label: "Forum", enabled: true },
    { id: "galerie", href: "/galerie", label: "Galerie", enabled: true },
    {
      id: "statistiques",
      href: "/statistiques",
      label: "Statistiques",
      enabled: true,
    },
    { id: "contact", href: "/contact", label: "Contact", enabled: true },
  ],
  modules: {
    announcementBar: true,
    playerCounter: true,
    serverStatus: true,
    ipCopy: true,
    statsPreview: true,
    boutiquePromo: true,
    newsHighlight: true,
    galleryFilters: true,
    ticketVisual: true,
    forum: true,
    staffAutoFromAccounts: true,
  },
  social: {
    discord: "",
    cfx: "",
    tebex: "",
    youtube: "",
  },
  server: {
    ip: `connect ${FIVEM_SERVER_ENDPOINT}`,
    displayName: "Harrata Community — Principal",
    cfxJoinUrl: "",
    status: "online",
    playersOnline: 0,
    maxPlayers: 64,
    metricsApiUrl: "",
    /* Synchro live : on a l'endpoint public du /players.json natif FiveM. */
    playersJsonUrl: `http://${FIVEM_SERVER_ENDPOINT}/players.json`,
    autoLive: true,
    liveRefreshSeconds: 30,
  },
  announcements: [
    {
      id: "a1",
      text: "Patch 2.4 : refonte police & économie locale — lisez les notes sur Actualités.",
      active: true,
    },
    {
      id: "a2",
      text: "Événement spécial ce week-end : course illégale à Sandy Shores, inscriptions sur Discord.",
      active: true,
    },
    {
      id: "a3",
      text: "Recrutement EMS / LSPD ouvert — postulez via le forum dans la section candidatures.",
      active: true,
    },
  ],
  features: [
    {
      id: "f1",
      title: "Qualité RP",
      description:
        "Scènes cohérentes, fair-play et staff réactif pour une immersion durable.",
      icon: "shield",
    },
    {
      id: "f2",
      title: "Économie vivante",
      description:
        "Métiers légaux & illégaux, flux d argent maîtrisés, anti-grind pensé RP.",
      icon: "economy",
    },
    {
      id: "f3",
      title: "Factions & entreprises",
      description:
        "Structures jouables, documents, territoires et événements narratifs.",
      icon: "users",
    },
    {
      id: "f4",
      title: "Carte optimisée",
      description:
        "Performance, props propres, zones RP claires et MLO soignés.",
      icon: "map",
    },
  ],
  lore: [
    {
      title: "Los Santos, autrement",
      body: "Ici, chaque rue raconte une dette, une alliance ou une trahison. Vous n êtes pas un scoreboard : vous êtes un habitant.",
    },
    {
      title: "Philosophie",
      body: "Nous privilégions la narration, le respect du cadre et la progression lente mais signifiante. Le grind n est pas le protagoniste.",
    },
  ],
  strengths: [
    "Staff expérimenté & transparent",
    "Outils internes (dispatch, dossiers, entreprises)",
    "Saisonnalité : arcs narratifs & événements",
    "Anti-cheat & logs structurés",
  ],
  economyBlurb:
    "Une économie circulaire : salaires, stocks, impôts fictifs, marché gris et risques réels. L argent a du poids.",
  staff: [],
  rules: [
    {
      id: "general",
      title: "Règlement général",
      items: [
        "Respect des joueurs et du staff (0 tolérance harcèlement / discrimination).",
        "Interdiction de cheat, exploit, meta-gaming et power-gaming.",
        "Utilisez les canaux appropriés (Discord / tickets) pour les litiges.",
      ],
    },
    {
      id: "rp",
      title: "Règlement RP",
      items: [
        "Value your life : votre personnage valorise sa survie.",
        "Le RP prime sur les règles techniques lorsque la scène l exige (fair-play).",
        "Les scènes sensibles nécessitent consentement des parties impliquées.",
      ],
    },
    {
      id: "staff",
      title: "Règlement staff",
      items: [
        "Le staff reste neutre et documente les décisions importantes.",
        "Aucun favoritisme lié aux donations ou relations personnelles.",
        "Les sanctions sont proportionnées et expliquées lorsque possible.",
      ],
    },
    {
      id: "wl",
      title: "Règlement whitelist",
      items: [
        "La candidature doit refléter votre personnage, pas un CV technique.",
        "Les réponses copiées-collées depuis d autres serveurs sont refusées.",
        "La whitelist peut être retirée en cas de manquements graves répétés.",
      ],
    },
  ],
  articles: [
    {
      slug: "patch-2-4-economie",
      title: "Patch 2.4 — Économie locale & police",
      excerpt:
        "Stabilité des prix, saisies RP et nouveaux outils dispatch pour les forces de l ordre.",
      date: "2026-04-12",
      category: "patch",
      featured: true,
      bodyMarkdown:
        "## Changements majeurs\n\n- Révision des prix de gros.\n- Nouveau module de saisie RP.\n- Correctifs de synchronisation.\n\n> Compatible Tebex & exports Discord à venir.",
    },
    {
      slug: "event-urban-nights",
      title: "Événement : Urban Nights",
      excerpt:
        "Une soirée narrée par la ville : concerts, tensions et opportunités.",
      date: "2026-03-28",
      category: "event",
      featured: false,
      bodyMarkdown:
        "Préparez vos tenues et vos alliances. Line-up & horaires sur Discord.",
    },
    {
      slug: "communaute-spotlight",
      title: "Spotlight : entreprises locales",
      excerpt:
        "Mise en avant des PME qui structurent le quotidien du serveur.",
      date: "2026-03-02",
      category: "community",
      featured: false,
      bodyMarkdown:
        "Envoyez votre histoire d entreprise via le formulaire **Entreprise / Faction**.",
    },
  ],
  boutiqueProducts: [
    {
      id: "vip-30",
      title: "VIP 30 jours",
      description:
        "Cosmétiques légers, file prioritaire support & rôle Discord dédié.",
      priceLabel: "9,99 €",
      perks: ["Tag Discord", "Kit cosmétique RP-safe", "Support prioritaire"],
      badge: "vip",
      promoLabel: "-15% ce week-end",
    },
    {
      id: "pack-starter",
      title: "Pack Starter Véhicule",
      description:
        "Un véhicule civil équilibré + place garage entreprise (non pay-to-win).",
      priceLabel: "14,99 €",
      perks: ["Véhicule whitelisté", "1 slot garage", "Skin plaque RP"],
      badge: "new",
    },
    {
      id: "cosmetic-bundle",
      title: "Bundle accessoires",
      description: "Tenues & props validés par le staff lore.",
      priceLabel: "4,99 €",
      perks: ["5 accessoires", "Validation rapide"],
      badge: "limited",
    },
  ],
  gallery: [
    {
      id: "g1",
      title: "Centre-ville de nuit",
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      category: "screenshot",
    },
    {
      id: "g2",
      title: "Convoi RP",
      src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
      category: "screenshot",
    },
    {
      id: "g3",
      title: "Teaser saison",
      src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      category: "video",
      href: "https://youtube.com",
    },
  ],
  presentationMedia: [
    {
      id: "pm1",
      type: "image",
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80",
      title: "Skyline urbaine",
      caption: "Le cœur de la ville où tout commence.",
    },
    {
      id: "pm2",
      type: "image",
      src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80",
      title: "Vie nocturne",
      caption: "Les rues s’animent à la tombée de la nuit.",
    },
    {
      id: "pm3",
      type: "youtube",
      src: "dQw4w9WgXcQ",
      title: "Trailer officiel",
      caption: "Plongez dans l’univers en 90 secondes.",
    },
  ],
  statCards: [
    {
      id: "st1",
      label: "Joueurs connectés",
      value: "128",
      hint: "À relier à votre API ou base de données (admin).",
    },
    {
      id: "st2",
      label: "Comptes créés",
      value: "18 420",
      trend: "+6% ce mois",
    },
    {
      id: "st3",
      label: "Argent circulant (RP)",
      value: "$2.1M",
      hint: "Agrégat économie fictive.",
    },
    {
      id: "st4",
      label: "Factions actives",
      value: "37",
    },
  ],
  statSeries: [
    { label: "Lun", value: 62 },
    { label: "Mar", value: 74 },
    { label: "Mer", value: 81 },
    { label: "Jeu", value: 96 },
    { label: "Ven", value: 118 },
    { label: "Sam", value: 132 },
    { label: "Dim", value: 128 },
  ],
  faq: [
    {
      question: "Comment rejoindre le serveur ?",
      answer:
        "Lisez le règlement, passez la whitelist si requise, puis utilisez le bouton Cfx.re ou la commande affichée sur l accueil.",
    },
    {
      question: "Le serveur est-il pay-to-win ?",
      answer:
        "Non. La boutique propose cosmétiques & confort sans avantage compétitif direct.",
    },
    {
      question: "Où signaler un problème ?",
      answer:
        "Via le formulaire Contact ou un ticket Discord selon les canaux affichés.",
    },
  ],
  roles: BUILTIN_ROLE_DEFINITIONS,
  forumCategories: [
    {
      id: "general",
      title: "Général",
      description: "Présentations, discussions libres et ambiance serveur.",
      accent: "var(--rp-primary)",
    },
    {
      id: "rp",
      title: "Roleplay & lore",
      description: "Histoires, questions de cohérence et idées de scènes.",
      accent: "var(--rp-secondary)",
    },
    {
      id: "support",
      title: "Aide & suggestions",
      description: "Remontées constructives et demandes d’orientation.",
      accent: "var(--rp-accent)",
    },
  ],
  forumTopics: [
    {
      id: "topic-welcome",
      categoryId: "general",
      title: "Bienvenue sur le forum",
      author: "Équipe",
      body: "Utilisez ce fil pour vous présenter brièvement (pseudo IG, style de RP). Restez respectueux : le staff peut modérer ou retirer des messages via la configuration exportée.",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T11:30:00.000Z",
      pinned: true,
      views: 42,
      replies: [
        {
          id: "r1",
          author: "Modo",
          body: "Pensez à lire le règlement avant de poster. Bon jeu à tous.",
          createdAt: "2026-04-01T11:30:00.000Z",
        },
      ],
    },
    {
      id: "topic-lore",
      categoryId: "rp",
      title: "Fil conducteur de la saison",
      author: "Lore",
      body: "Quels arcs narratifs vous intéressent le plus pour les semaines à venir ?",
      createdAt: "2026-04-05T14:00:00.000Z",
      updatedAt: "2026-04-05T14:00:00.000Z",
      views: 12,
      replies: [],
    },
  ],
  forms: {
    whitelist: [
      {
        id: "discord",
        label: "Identifiant Discord",
        type: "text",
        required: true,
        placeholder: "pseudo#0000 ou @handle",
      },
      {
        id: "age",
        label: "Âge IRL",
        type: "number",
        required: true,
      },
      {
        id: "experience",
        label: "Expérience RP",
        type: "textarea",
        required: true,
        placeholder: "Serveurs, styles de RP, durée…",
      },
      {
        id: "character",
        label: "Concept de personnage",
        type: "textarea",
        required: true,
      },
    ],
    staff: [
      {
        id: "discord",
        label: "Discord",
        type: "text",
        required: true,
      },
      {
        id: "timezone",
        label: "Fuseau horaire",
        type: "text",
        required: true,
      },
      {
        id: "skills",
        label: "Compétences (modo, dev, lore…)",
        type: "textarea",
        required: true,
      },
    ],
    business: [
      {
        id: "name",
        label: "Nom de l entreprise / faction",
        type: "text",
        required: true,
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        required: true,
        options: ["Entreprise civile", "Organisation illégale", "Service public"],
      },
      {
        id: "pitch",
        label: "Pitch & besoins",
        type: "textarea",
        required: true,
      },
    ],
  },
  contact: {
    supportEmail: "",
    ticketDiscordChannel: "",
  },
  integrations: {
    discordOAuth: { enabled: true },
    steamOpenId: { enabled: true },
    tebex: {
      storeBaseUrl: "",
      enableGeneratedPackageLinks: false,
    },
  },
};
