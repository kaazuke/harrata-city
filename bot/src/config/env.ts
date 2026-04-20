import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`[env] Variable manquante : ${name}`);
  }
  return v.trim();
}

function optional(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  discord: {
    token: required("DISCORD_TOKEN"),
    clientId: required("DISCORD_CLIENT_ID"),
    guildId: required("DISCORD_GUILD_ID"),
  },
  site: {
    apiUrl: optional("SITE_API_URL", "https://fivem-rp-community.vercel.app"),
    apiToken: optional("SITE_API_TOKEN"),
  },
  fivem: {
    playersUrl: optional("FIVEM_PLAYERS_URL"),
    infoUrl: optional("FIVEM_INFO_URL"),
  },
  channels: {
    status: optional("STATUS_CHANNEL_ID"),
    news: optional("NEWS_CHANNEL_ID"),
    modLog: optional("MOD_LOG_CHANNEL_ID"),
    tickets: optional("TICKETS_CATEGORY_ID"),
    welcome: optional("WELCOME_CHANNEL_ID"),
  },
  roles: {
    linked: optional("LINKED_ROLE_ID"),
    whitelist: optional("WHITELIST_ROLE_ID"),
    staff: optional("STAFF_ROLE_ID"),
  },
  runtime: {
    nodeEnv: optional("NODE_ENV", "development"),
    logLevel: optional("LOG_LEVEL", "info"),
    statusRefreshSeconds: optionalNumber("STATUS_REFRESH_SECONDS", 60),
    newsPollSeconds: optionalNumber("NEWS_POLL_SECONDS", 300),
  },
} as const;

export const isProduction = env.runtime.nodeEnv === "production";
