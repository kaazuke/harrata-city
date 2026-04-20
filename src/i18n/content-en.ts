import type { SiteConfig } from "@/config/types";

/**
 * Overrides de contenu pour la version anglaise du site.
 * Fusionnés avec la `SiteConfig` FR par défaut via `useLocalizedConfig()` côté composants.
 * Structure miroir de `default-site.ts` — on ne redéfinit que les champs textuels.
 */
export const contentEN: DeepPartial<SiteConfig> = {
  meta: {
    siteName: "Harrata City",
    slogan: "The city never sleeps. Your story might.",
    description:
      "Harrata City — FiveM Roleplay server: living economy, factions, jobs and realistic urban experience.",
    keywords: [
      "Harrata City",
      "FiveM",
      "GTA RP",
      "roleplay",
      "whitelist",
      "french server",
      "english friendly",
    ],
  },
  layoutCopy: {
    headerTagline: "FiveM Roleplay",
    announcementBadge: "Info",
    homeHeroBadge: "FiveM Roleplay",
    homeJoinCfx: "Join (Cfx.re)",
    homeJoinNoLink: "Join",
    homeDiscord: "Discord",
    homeSectionWhyTitle: "Why join us",
    homeSectionWhyDesc:
      "Features and content managed from admin: text, Discord / Cfx.re links, Tebex, colors and modules.",
    homeWhyCta: "Discover the project →",
    homeNewsTitle: "Latest news",
    homeNewsCta: "See all →",
    homeStatsTitle: "Statistics (overview)",
    homeStatsDesc:
      "Example numbers — replace them with your data (API, database) from the site configuration.",
    homeStatsCta: "View charts →",
    homeForumTitle: "Community forum",
    homeForumDesc:
      "Chat with players: introductions, lore, scene ideas and mutual aid. Open a topic or reply — everything is saved with the site configuration (browser / JSON export).",
    homeForumCta: "Open the forum →",
    homeForumHeroLabel: "Forum",
    serverPanelTitle: "Server",
    serverPanelSubtitle: "Editable indicators (admin)",
    serverLiveBadge: "Live",
    serverColPlayers: "Players online",
    serverColStatus: "Status",
    serverColConnection: "Connection",
    serverCopyButton: "Copy IP / command",
    serverCopiedButton: "Copied",
    serverStatusOnline: "Online",
    serverStatusMaintenance: "Maintenance",
    serverStatusOffline: "Offline",
    footerCommunityEyebrow: "Community",
    footerLinksEyebrow: "Quick links",
    footerLegalEyebrow: "Legal",
    footerLegalBody:
      "Editable template. GTA V and associated trademarks belong to their owners. Independent community hub.",
    footerContactLink: "Contact & support",
    footerDiscord: "Discord",
    footerCfx: "Cfx.re — join",
    footerTebex: "Shop",
  },
  nav: [
    { id: "home", href: "/", label: "Home", enabled: true },
    { id: "presentation", href: "/presentation", label: "About", enabled: true },
    { id: "reglement", href: "/reglement", label: "Rules", enabled: true },
    { id: "candidatures", href: "/candidatures", label: "Whitelist", enabled: true },
    { id: "boutique", href: "/boutique", label: "Shop", enabled: true },
    { id: "equipe", href: "/equipe", label: "Team", enabled: true },
    { id: "actualites", href: "/actualites", label: "News", enabled: true },
    { id: "forum", href: "/forum", label: "Forum", enabled: true },
    { id: "galerie", href: "/galerie", label: "Gallery", enabled: true },
    { id: "statistiques", href: "/statistiques", label: "Stats", enabled: true },
    { id: "contact", href: "/contact", label: "Contact", enabled: true },
  ],
  server: {
    displayName: "Harrata Community — Main",
  },
  announcements: [
    {
      id: "a1",
      text: "Patch 2.4: police rework & local economy — read the notes in News.",
      active: true,
    },
    {
      id: "a2",
      text: "Special event this weekend: illegal race at Sandy Shores, sign-up on Discord.",
      active: true,
    },
    {
      id: "a3",
      text: "EMS / LSPD recruitment open — apply via the forum applications section.",
      active: true,
    },
  ],
  features: [
    {
      id: "f1",
      title: "RP Quality",
      description: "Coherent scenes, fair-play and responsive staff for lasting immersion.",
      icon: "shield",
    },
    {
      id: "f2",
      title: "Living economy",
      description: "Legal & illegal jobs, controlled money flows, RP-minded anti-grind.",
      icon: "economy",
    },
    {
      id: "f3",
      title: "Factions & companies",
      description: "Playable structures, documents, territories and narrative events.",
      icon: "users",
    },
    {
      id: "f4",
      title: "Optimized map",
      description: "Performance, clean props, clear RP zones and polished MLOs.",
      icon: "map",
    },
  ],
  lore: [
    {
      title: "Los Santos, differently",
      body: "Every street here tells a story of debt, alliance or betrayal. You're not a scoreboard: you're a resident.",
    },
    {
      title: "Philosophy",
      body: "We prioritize narrative, respect for the setting, and slow but meaningful progression. Grinding isn't the protagonist.",
    },
  ],
  strengths: [
    "Experienced & transparent staff",
    "Internal tools (dispatch, records, companies)",
    "Seasonality: narrative arcs & events",
    "Anti-cheat & structured logs",
  ],
  economyBlurb:
    "A circular economy: salaries, stocks, fictional taxes, gray market and real risks. Money has weight here.",
  rules: [
    {
      id: "general",
      title: "General rules",
      items: [
        "Respect players and staff (zero tolerance for harassment / discrimination).",
        "No cheating, exploits, meta-gaming or power-gaming.",
        "Use the appropriate channels (Discord / tickets) for disputes.",
      ],
    },
    {
      id: "rp",
      title: "RP rules",
      items: [
        "Value your life: your character values their survival.",
        "RP prevails over technical rules when the scene requires it (fair-play).",
        "Sensitive scenes require consent from all involved parties.",
      ],
    },
    {
      id: "staff",
      title: "Staff rules",
      items: [
        "Staff remain neutral and document important decisions.",
        "No favoritism tied to donations or personal relationships.",
        "Sanctions are proportionate and explained when possible.",
      ],
    },
    {
      id: "wl",
      title: "Whitelist rules",
      items: [
        "Your application must reflect your character, not a technical CV.",
        "Copy-pasted answers from other servers will be rejected.",
        "Whitelist can be revoked for repeated serious offenses.",
      ],
    },
  ],
  articles: [
    {
      slug: "patch-2-4-economie",
      title: "Patch 2.4 — Local economy & police",
      excerpt:
        "Price stability, RP seizures and new dispatch tools for law enforcement.",
      date: "2026-04-12",
      category: "patch",
      featured: true,
      bodyMarkdown:
        "## Major changes\n\n- Wholesale price revision.\n- New RP seizure module.\n- Sync fixes.\n\n> Tebex & Discord exports compatibility coming soon.",
    },
    {
      slug: "event-urban-nights",
      title: "Event: Urban Nights",
      excerpt: "An evening narrated by the city: concerts, tensions and opportunities.",
      date: "2026-03-28",
      category: "event",
      featured: false,
      bodyMarkdown: "Prepare your outfits and alliances. Line-up & schedule on Discord.",
    },
    {
      slug: "communaute-spotlight",
      title: "Spotlight: local businesses",
      excerpt: "Showcasing the SMBs that shape daily life on the server.",
      date: "2026-03-02",
      category: "community",
      featured: false,
      bodyMarkdown:
        "Share your business story via the **Company / Faction** form.",
    },
  ],
  boutiqueProducts: [
    {
      id: "vip-30",
      title: "VIP 30 days",
      description: "Light cosmetics, priority support queue & dedicated Discord role.",
      priceLabel: "€9.99",
      perks: ["Discord tag", "RP-safe cosmetic kit", "Priority support"],
      badge: "vip",
      promoLabel: "-15% this weekend",
    },
    {
      id: "pack-starter",
      title: "Starter Vehicle Pack",
      description: "A balanced civilian vehicle + business garage slot (no pay-to-win).",
      priceLabel: "€14.99",
      perks: ["Whitelisted vehicle", "1 garage slot", "RP plate skin"],
      badge: "new",
    },
    {
      id: "cosmetic-bundle",
      title: "Accessory bundle",
      description: "Outfits & props validated by the lore staff.",
      priceLabel: "€4.99",
      perks: ["5 accessories", "Fast validation"],
      badge: "limited",
    },
  ],
  gallery: [
    { id: "g1", title: "Downtown at night", category: "screenshot" },
    { id: "g2", title: "RP convoy", category: "screenshot" },
    { id: "g3", title: "Season teaser", category: "video" },
  ],
  presentationMedia: [
    { id: "pm1", title: "Urban skyline", caption: "The heart of the city where it all begins." },
    { id: "pm2", title: "Night life", caption: "Streets come alive after dusk." },
    { id: "pm3", title: "Official trailer", caption: "Dive into the universe in 90 seconds." },
  ],
  statCards: [
    {
      id: "st1",
      label: "Connected players",
      value: "128",
      hint: "To be connected to your API or database (admin).",
    },
    { id: "st2", label: "Accounts created", value: "18,420", trend: "+6% this month" },
    { id: "st3", label: "Money in circulation (RP)", value: "$2.1M", hint: "Fictional economy aggregate." },
    { id: "st4", label: "Active factions", value: "37" },
  ],
  statSeries: [
    { label: "Mon", value: 62 },
    { label: "Tue", value: 74 },
    { label: "Wed", value: 81 },
    { label: "Thu", value: 96 },
    { label: "Fri", value: 118 },
    { label: "Sat", value: 132 },
    { label: "Sun", value: 128 },
  ],
  faq: [
    {
      question: "How do I join the server?",
      answer:
        "Read the rules, pass the whitelist if required, then use the Cfx.re button or the command shown on the home page.",
    },
    {
      question: "Is the server pay-to-win?",
      answer:
        "No. The shop offers cosmetics & convenience without any direct competitive advantage.",
    },
    {
      question: "Where do I report a problem?",
      answer: "Via the Contact form or a Discord ticket in the channels displayed.",
    },
  ],
  forumCategories: [
    {
      id: "general",
      title: "General",
      description: "Introductions, free discussions and server mood.",
      accent: "var(--rp-primary)",
    },
    {
      id: "rp",
      title: "Roleplay & lore",
      description: "Stories, consistency questions and scene ideas.",
      accent: "var(--rp-secondary)",
    },
    {
      id: "support",
      title: "Help & suggestions",
      description: "Constructive feedback and guidance requests.",
      accent: "var(--rp-accent)",
    },
  ],
  forumTopics: [
    {
      id: "topic-welcome",
      categoryId: "general",
      title: "Welcome to the forum",
      author: "Team",
      body: "Use this thread to briefly introduce yourself (in-game nickname, RP style). Stay respectful: staff can moderate or remove messages via the exported configuration.",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T11:30:00.000Z",
      pinned: true,
      views: 42,
      replies: [
        {
          id: "r1",
          author: "Mod",
          body: "Please read the rules before posting. Have fun!",
          createdAt: "2026-04-01T11:30:00.000Z",
        },
      ],
    },
    {
      id: "topic-lore",
      categoryId: "rp",
      title: "Season storyline",
      author: "Lore",
      body: "Which narrative arcs interest you the most for the coming weeks?",
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
        label: "Discord ID",
        type: "text",
        required: true,
        placeholder: "nickname#0000 or @handle",
      },
      { id: "age", label: "Real-life age", type: "number", required: true },
      {
        id: "experience",
        label: "RP experience",
        type: "textarea",
        required: true,
        placeholder: "Servers, RP styles, duration…",
      },
      { id: "character", label: "Character concept", type: "textarea", required: true },
    ],
    staff: [
      { id: "discord", label: "Discord", type: "text", required: true },
      { id: "timezone", label: "Timezone", type: "text", required: true },
      {
        id: "skills",
        label: "Skills (mod, dev, lore…)",
        type: "textarea",
        required: true,
      },
    ],
    business: [
      { id: "name", label: "Company / faction name", type: "text", required: true },
      {
        id: "type",
        label: "Type",
        type: "select",
        required: true,
        options: ["Civilian company", "Illegal organization", "Public service"],
      },
      { id: "pitch", label: "Pitch & needs", type: "textarea", required: true },
    ],
  },
};

/** Deep partial générique pour les overrides de config. Supporte aussi les arrays d'objets partiels. */
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;
