import type { SiteConfig } from "@/config/types";

/**
 * Overrides de contenu pour la version anglaise du site.
 * Fusionnés avec la `SiteConfig` FR par défaut via `useLocalizedConfig()` côté composants.
 * Structure miroir de `default-site.ts` — on ne redéfinit que les champs textuels.
 */
export const contentEN: DeepPartial<SiteConfig> = {
  meta: {
    siteName: "RP Hub — demo",
    slogan: "Preview of the open-source FiveM community hub.",
    description:
      "Browse every page: sample content shows how the Next.js template looks (admin, forum, news, shop…). Replace everything from the admin panel or your fork.",
    keywords: [
      "FiveM",
      "community hub",
      "Next.js",
      "template",
      "open source",
      "demo",
      "roleplay",
    ],
  },
  layoutCopy: {
    headerTagline: "Template demo",
    announcementBadge: "Demo",
    homeHeroBadge: "Interactive demo",
    homeJoinCfx: "Sample Cfx.re",
    homeJoinNoLink: "Sample button",
    homeDiscord: "Discord",
    homeSectionWhyTitle: "What this demo shows",
    homeSectionWhyDesc:
      "Sample tiles and copy: in production you replace them with your lore, Discord / Cfx.re links, Tebex, colours and navigation from the admin.",
    homeWhyCta: "Open-source hub page →",
    homeNewsTitle: "Latest news",
    homeNewsCta: "See all →",
    homeStatsTitle: "Statistics (overview)",
    homeStatsDesc:
      "Example numbers — replace them with your data (API, database) from the site configuration.",
    homeStatsCta: "View charts →",
    homeForumTitle: "Forum (sample)",
    homeForumDesc:
      "Fictional categories and threads to showcase the built-in forum. Data follows your site configuration (browser / JSON export).",
    homeForumCta: "Open the forum →",
    homeForumHeroLabel: "Forum",
    serverPanelTitle: "Server block",
    serverPanelSubtitle: "Example — connect your Cfx.re code or players.json",
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
    {
      id: "hubOpenSource",
      href: "/hub-open-source",
      label: "Open-source hub",
      enabled: true,
    },
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
    displayName: "Example — server gauges (static data)",
  },
  announcements: [
    {
      id: "a1",
      text: "Demo: this site showcases the open-source template — clone the GitHub repo for your community.",
      active: true,
    },
    {
      id: "a2",
      text: "Tip: open the admin (first visit) to see how content can be edited without touching code.",
      active: true,
    },
    {
      id: "a3",
      text: "News, rules and forum below are samples — replace them with your real content.",
      active: true,
    },
  ],
  features: [
    {
      id: "f1",
      title: "Admin without redeploy",
      description: "Copy, navigation, colours, announcements and more: much of it is configured from the panel.",
      icon: "shield",
    },
    {
      id: "f2",
      title: "FR / EN",
      description: "Internationalisation with explicit URL prefixes to avoid mixed locales.",
      icon: "economy",
    },
    {
      id: "f3",
      title: "Forum & accounts",
      description: "Built-in forum, notifications, Discord and Steam auth — ready to wire to your infra.",
      icon: "users",
    },
    {
      id: "f4",
      title: "Polished dark theme",
      description: "Modern Tailwind UI: colours, fonts and hero image editable from config.",
      icon: "map",
    },
  ],
  lore: [
    {
      title: "Sample text (config)",
      body: "These paragraphs come from the default configuration file. After forking, replace them with your server lore or load copy from the admin.",
    },
    {
      title: "Purpose of the demo",
      body: "Show layout, cards and visual hierarchy — not a canonical story.",
    },
  ],
  strengths: [
    "Structured TypeScript codebase (Next.js 15 App Router)",
    "Deployable on Vercel or any Node host",
    "MIT licence — see the repository README",
    "Extensible: API routes, forms, uploads",
  ],
  economyBlurb:
    "Sample paragraph: here you would describe your server's economy. Statistics numbers are also fictional and only preview charts.",
  rules: [
    {
      id: "general",
      title: "Sample — general rules",
      items: [
        "Fictional text: list here respect between players and baseline bans.",
        "Replace these lines with your real rules from the admin.",
        "URL anchors (#general, #rp…) still work to share a section.",
      ],
    },
    {
      id: "rp",
      title: "Sample — RP framework",
      items: [
        "Illustration of a roleplay section (value your life, fair-play, etc.).",
        "This is the same layout your players will see.",
        "Edit content without redeploying the site.",
      ],
    },
    {
      id: "staff",
      title: "Sample — staff",
      items: [
        "Placeholder paragraphs for staff transparency.",
        "Adapt to your hierarchy, tickets and sanctions.",
      ],
    },
    {
      id: "wl",
      title: "Sample — whitelist",
      items: [
        "Fictional access conditions for the mock-up.",
        "Tie this copy to your real application process.",
      ],
    },
  ],
  articles: [
    {
      slug: "template-notes-1",
      title: "Release notes — hub template",
      excerpt: "Sample article: this is how patch notes look on home and News.",
      date: "2026-04-12",
      category: "patch",
      featured: true,
      bodyMarkdown:
        "## Fictional content\n\n- Bullet list to show Markdown rendering.\n- Links and **emphasis** supported.\n\n> Replace this article with your real patch notes.",
    },
    {
      slug: "template-event-demo",
      title: "Event (sample)",
      excerpt: "Sample event card — dates, excerpt and detail page.",
      date: "2026-03-28",
      category: "event",
      featured: false,
      bodyMarkdown:
        "Placeholder text for a community event. Add your dates and Discord link in the admin.",
    },
    {
      slug: "template-community-demo",
      title: "Community — preview article",
      excerpt: "Third article to fill the grid and test categories.",
      date: "2026-03-02",
      category: "community",
      featured: false,
      bodyMarkdown: "Use this slot for interviews, spotlights or staff announcements.",
    },
  ],
  boutiqueProducts: [
    {
      id: "vip-30",
      title: "Sample product A",
      description: "Fictional shop card — connect your Tebex store in config.",
      priceLabel: "€9.99",
      perks: ["Line 1", "Line 2", "Line 3"],
      badge: "vip",
      promoLabel: "Promo label (demo)",
    },
    {
      id: "pack-starter",
      title: "Sample product B",
      description: "Second card to show the grid and badges.",
      priceLabel: "€14.99",
      perks: ["Preview", "Layout", "Fake price"],
      badge: "new",
    },
    {
      id: "cosmetic-bundle",
      title: "Sample product C",
      description: "Third product — everything is editable in the admin.",
      priceLabel: "€4.99",
      perks: ["Demo", "Cosmetic", "No real value"],
      badge: "limited",
    },
  ],
  gallery: [
    { id: "g1", title: "Downtown at night", category: "screenshot" },
    { id: "g2", title: "RP convoy", category: "screenshot" },
    { id: "g3", title: "Season teaser", category: "video" },
  ],
  presentationMedia: [
    { id: "pm1", title: "Illustration image", caption: "Unsplash photo — replace with your in-game screenshots." },
    { id: "pm2", title: "Second visual", caption: "Presentation grid shows how to align media and copy." },
    { id: "pm3", title: "YouTube video (sample)", caption: "Replace the ID with your trailer or remove this block." },
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
      question: "Is this a real RP server?",
      answer:
        "No — it's a template demo. Text and numbers are for preview only. Fork the repo and replace the content with yours.",
    },
    {
      question: "Where is the source code?",
      answer: 'See the "Open-source hub" page or the GitHub repository linked in the README (MIT licence).',
    },
    {
      question: "Can I disable pages (forum, shop…)?",
      answer: "Yes: turn off modules in the admin panel or adjust navigation.",
    },
  ],
  forumCategories: [
    {
      id: "general",
      title: "General",
      description: "Sample category — introductions and chat.",
      accent: "var(--rp-primary)",
    },
    {
      id: "rp",
      title: "Roleplay & lore",
      description: "Sample threads for lore and scene ideas.",
      accent: "var(--rp-secondary)",
    },
    {
      id: "support",
      title: "Help & suggestions",
      description: "Sample help and feedback area.",
      accent: "var(--rp-accent)",
    },
  ],
  forumTopics: [
    {
      id: "topic-welcome",
      categoryId: "general",
      title: "Sample thread — welcome",
      author: "Demo",
      body: "This post illustrates a forum thread. Replies and views are stored with your site configuration (browser / export). Replace after install.",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T11:30:00.000Z",
      pinned: true,
      views: 42,
      replies: [
        {
          id: "r1",
          author: "Demo",
          body: "Sample reply to show threaded messages.",
          createdAt: "2026-04-01T11:30:00.000Z",
        },
      ],
    },
    {
      id: "topic-lore",
      categoryId: "rp",
      title: "Second topic (sample)",
      author: "Demo",
      body: "Fictional text to test topic lists and category pages.",
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
