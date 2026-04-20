import { BUILTIN_ROLE_DEFINITIONS } from "@/lib/account/types";
import type { SiteConfig } from "./types";

/**
 * Démo publique du template : pas d’IP réelle ni de /players.json par défaut.
 * Branchez votre serveur depuis l’admin (code Cfx.re ou URL players.json).
 */
const DEMO_CONNECT_PLACEHOLDER = "connect votre-serveur.example:30120";

export const defaultSiteConfig: SiteConfig = {
  locale: "fr",
  meta: {
    siteName: "Hub RP — démo",
    slogan: "Aperçu du site communautaire FiveM (open source).",
    description:
      "Parcourez toutes les pages : ce sont des exemples pour montrer le rendu du template Next.js (admin, forum, actus, boutique…). Remplacez tout depuis le panneau admin ou le dépôt GitHub.",
    keywords: [
      "FiveM",
      "hub communautaire",
      "Next.js",
      "template",
      "open source",
      "démo",
      "roleplay",
    ],
    ogImage: "/brand/logo-banner.png",
    logoUrl: "/brand/icon.png",
  },
  layoutCopy: {
    headerTagline: "Démo template",
    announcementBadge: "Démo",
    homeHeroBadge: "Démo interactive",
    homeJoinCfx: "Exemple Cfx.re",
    homeJoinNoLink: "Bouton exemple",
    homeDiscord: "Discord",
    homeSectionWhyTitle: "Ce que montre cette démo",
    homeSectionWhyDesc:
      "Tuiles, textes et modules d’exemple : en production, tu remplaces le tout par ton lore, tes liens Discord / Cfx.re, Tebex, couleurs et navigation depuis l’admin.",
    homeWhyCta: "Voir la page « Hub open source » →",
    homeNewsTitle: "Dernières actualités",
    homeNewsCta: "Voir tout →",
    homeStatsTitle: "Statistiques (aperçu)",
    homeStatsDesc:
      "Chiffres d’exemple — remplacez-les par vos données (API, base) depuis la configuration du site.",
    homeStatsCta: "Voir les graphiques →",
    homeForumTitle: "Forum (exemple)",
    homeForumDesc:
      "Sujets et catégories fictifs pour illustrer le forum intégré. Les données suivent la configuration du site (navigateur / export JSON).",
    homeForumCta: "Ouvrir le forum →",
    homeForumHeroLabel: "Forum",
    serverPanelTitle: "Bloc serveur",
    serverPanelSubtitle: "Exemple — branchez votre API Cfx.re ou players.json",
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
    {
      id: "hubOpenSource",
      href: "/hub-open-source",
      label: "Hub open source",
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
    discord: "https://discord.gg/7XVtaRnpQe",
    cfx: "",
    tebex: "",
    youtube: "",
  },
  server: {
    ip: DEMO_CONNECT_PLACEHOLDER,
    displayName: "Exemple — jauges serveur (données statiques)",
    cfxJoinUrl: "",
    status: "online",
    playersOnline: 42,
    maxPlayers: 128,
    metricsApiUrl: "",
    playersJsonUrl: "",
    autoLive: false,
    liveRefreshSeconds: 30,
  },
  announcements: [
    {
      id: "a1",
      text: "Démo : ce site illustre le template open source — clonez le dépôt GitHub pour votre communauté.",
      active: true,
    },
    {
      id: "a2",
      text: "Astuce : ouvrez l’admin (première visite) pour voir comment le contenu est éditable sans toucher au code.",
      active: true,
    },
    {
      id: "a3",
      text: "Les actualités, règles et forum ci-dessous sont des exemples — remplacez-les par vos vrais contenus.",
      active: true,
    },
  ],
  features: [
    {
      id: "f1",
      title: "Admin sans redeploy",
      description:
        "Textes, navigation, couleurs, annonces et bien plus : une grande partie se configure depuis le panneau.",
      icon: "shield",
    },
    {
      id: "f2",
      title: "FR / EN",
      description:
        "Internationalisation avec préfixe d’URL explicite pour éviter les mélanges de langue.",
      icon: "economy",
    },
    {
      id: "f3",
      title: "Forum & comptes",
      description:
        "Forum intégré, notifications, authentification Discord et Steam — prêt à brancher sur votre infra.",
      icon: "users",
    },
    {
      id: "f4",
      title: "Thème sombre soigné",
      description:
        "UI moderne (Tailwind) : couleurs, polices et image de hero modifiables depuis la config.",
      icon: "map",
    },
  ],
  lore: [
    {
      title: "Texte d’exemple (config)",
      body: "Ces paragraphes viennent du fichier de configuration par défaut. Après fork, remplacez-les par le lore de votre serveur ou chargez vos textes via l’admin.",
    },
    {
      title: "Objectif de la démo",
      body: "Montrer la mise en page, les cartes et la hiérarchie visuelle — pas une histoire canonique.",
    },
  ],
  strengths: [
    "Code TypeScript structuré (App Router Next.js 15)",
    "Déployable sur Vercel ou tout hébergeur Node",
    "Licence MIT — voir le README du dépôt",
    "Extensible : API routes, formulaires, uploads",
  ],
  economyBlurb:
    "Paragraphe d’exemple : ici vous décririez l’économie de votre serveur. Les chiffres des statistiques sont également factices et servent d’aperçu graphique.",
  staff: [],
  rules: [
    {
      id: "general",
      title: "Exemple — règles générales",
      items: [
        "Texte fictif : ici vous listeriez le respect entre joueurs et les interdictions de base.",
        "Remplacez ces lignes par votre vrai règlement depuis l’admin.",
        "Les ancres d’URL (#general, #rp…) restent valables pour partager une section.",
      ],
    },
    {
      id: "rp",
      title: "Exemple — cadre RP",
      items: [
        "Illustration d’une section « roleplay » (value your life, fair-play, etc.).",
        "Le rendu Markdown / listes est celui que verront vos joueurs.",
        "Modifiez le contenu sans redéployer le site.",
      ],
    },
    {
      id: "staff",
      title: "Exemple — staff",
      items: [
        "Paragraphes type pour la transparence staff.",
        "À adapter à votre structure (hiérarchie, tickets, sanctions).",
      ],
    },
    {
      id: "wl",
      title: "Exemple — whitelist",
      items: [
        "Conditions d’accès fictives pour la maquette.",
        "Liez ce texte à votre vrai processus de candidature.",
      ],
    },
  ],
  articles: [
    {
      slug: "template-notes-1",
      title: "Notes de version — template hub",
      excerpt:
        "Article d’exemple : ainsi s’affichent les patch notes sur l’accueil et la page Actualités.",
      date: "2026-04-12",
      category: "patch",
      featured: true,
      bodyMarkdown:
        "## Contenu fictif\n\n- Liste à puces pour montrer le rendu Markdown.\n- Liens et emphases **possibles**.\n\n> Remplacez cet article par vos vraies notes de patch.",
    },
    {
      slug: "template-event-demo",
      title: "Événement (exemple)",
      excerpt:
        "Démonstration d’un encart « événement » — dates, extrait et page détail.",
      date: "2026-03-28",
      category: "event",
      featured: false,
      bodyMarkdown:
        "Texte d’exemple pour un événement communautaire. Ajoutez vos dates et votre lien Discord dans l’admin.",
    },
    {
      slug: "template-community-demo",
      title: "Communauté — article d’aperçu",
      excerpt:
        "Troisième article pour remplir la grille et tester les catégories.",
      date: "2026-03-02",
      category: "community",
      featured: false,
      bodyMarkdown:
        "Utilisez cette section pour des interviews, spotlights ou annonces staff.",
    },
  ],
  boutiqueProducts: [
    {
      id: "vip-30",
      title: "Produit exemple A",
      description:
        "Carte boutique fictive — branchez votre boutique Tebex dans la config.",
      priceLabel: "9,99 €",
      perks: ["Ligne 1", "Ligne 2", "Ligne 3"],
      badge: "vip",
      promoLabel: "Label promo (démo)",
    },
    {
      id: "pack-starter",
      title: "Produit exemple B",
      description:
        "Deuxième fiche pour montrer la grille et les badges.",
      priceLabel: "14,99 €",
      perks: ["Aperçu", "Mise en page", "Prix factice"],
      badge: "new",
    },
    {
      id: "cosmetic-bundle",
      title: "Produit exemple C",
      description: "Troisième produit — tout est modifiable dans l’admin.",
      priceLabel: "4,99 €",
      perks: ["Démo", "Cosmétique", "Sans valeur réelle"],
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
      title: "Image d’illustration",
      caption: "Photo Unsplash — remplacez par vos captures in-game.",
    },
    {
      id: "pm2",
      type: "image",
      src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80",
      title: "Deuxième visuel",
      caption: "La grille Présentation montre comment aligner médias et textes.",
    },
    {
      id: "pm3",
      type: "youtube",
      src: "dQw4w9WgXcQ",
      title: "Vidéo YouTube (exemple)",
      caption: "Remplacez l’ID par votre trailer ou supprimez ce bloc.",
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
      question: "Ce site est-il un vrai serveur RP ?",
      answer:
        "Non : c’est une démo du template. Les textes et chiffres servent à montrer le rendu. Clonez le dépôt et remplacez le contenu par le vôtre.",
    },
    {
      question: "Comment obtenir le code source ?",
      answer:
        "Voir la page « Hub open source » ou le dépôt GitHub indiqué dans le README (licence MIT).",
    },
    {
      question: "Puis-je retirer des pages (forum, boutique…) ?",
      answer:
        "Oui : désactivez les modules dans le panneau admin ou adaptez la navigation.",
    },
  ],
  roles: BUILTIN_ROLE_DEFINITIONS,
  forumCategories: [
    {
      id: "general",
      title: "Général",
      description: "Catégorie d’exemple — présentations, discussions.",
      accent: "var(--rp-primary)",
    },
    {
      id: "rp",
      title: "Roleplay & lore",
      description: "Exemple de fils pour le lore et les idées de scènes.",
      accent: "var(--rp-secondary)",
    },
    {
      id: "support",
      title: "Aide & suggestions",
      description: "Exemple pour l’entraide et les retours.",
      accent: "var(--rp-accent)",
    },
  ],
  forumTopics: [
    {
      id: "topic-welcome",
      categoryId: "general",
      title: "Sujet d’exemple — bienvenue",
      author: "Démo",
      body: "Ce message illustre un fil de forum. Les réponses et vues sont stockées avec la configuration du site (navigateur / export). Remplacez ce contenu après installation.",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T11:30:00.000Z",
      pinned: true,
      views: 42,
      replies: [
        {
          id: "r1",
          author: "Démo",
          body: "Réponse d’exemple pour montrer l’enfilade des messages.",
          createdAt: "2026-04-01T11:30:00.000Z",
        },
      ],
    },
    {
      id: "topic-lore",
      categoryId: "rp",
      title: "Deuxième sujet (exemple)",
      author: "Démo",
      body: "Texte factice pour tester la liste des sujets et la page catégorie.",
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
