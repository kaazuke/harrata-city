import { promises as fs } from "fs";
import path from "path";

/**
 * Configuration runtime éditée depuis le panneau admin.
 * Stockée dans `.runtime/auth-config.json` (hors git, voir .gitignore).
 * Les routes OAuth lisent cette config en priorité, puis tombent sur process.env.
 */

export type RuntimeAuthConfig = {
  authSecret?: string;
  discord?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  steam?: {
    /** OpenID realm (origin). Optionnel : sinon dérivé de la requête. */
    realm?: string;
  };
  /** Token attendu pour modifier la config (créé à la 1ʳᵉ écriture). */
  ownerToken?: string;
  /** ISO date de la dernière mise à jour. */
  updatedAt?: string;
};

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const RUNTIME_FILE = path.join(RUNTIME_DIR, "auth-config.json");

let cached: RuntimeAuthConfig | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 2_000;

export async function readRuntimeAuthConfig(): Promise<RuntimeAuthConfig> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) return cached;
  try {
    const raw = await fs.readFile(RUNTIME_FILE, "utf8");
    const parsed = JSON.parse(raw) as RuntimeAuthConfig;
    cached = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    cached = {};
  }
  cachedAt = now;
  return cached;
}

export async function writeRuntimeAuthConfig(next: RuntimeAuthConfig): Promise<void> {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  const payload: RuntimeAuthConfig = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(payload, null, 2), "utf8");
  cached = payload;
  cachedAt = Date.now();
}

export async function deleteRuntimeAuthConfig(): Promise<void> {
  try {
    await fs.unlink(RUNTIME_FILE);
  } catch {
    /* ignore */
  }
  cached = {};
  cachedAt = Date.now();
}

export async function resolveAuthSecret(): Promise<string | undefined> {
  const cfg = await readRuntimeAuthConfig();
  return cfg.authSecret?.trim() || process.env.AUTH_SECRET || undefined;
}

export async function resolveDiscord(): Promise<{
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}> {
  const cfg = await readRuntimeAuthConfig();
  return {
    clientId: cfg.discord?.clientId?.trim() || process.env.DISCORD_CLIENT_ID || undefined,
    clientSecret:
      cfg.discord?.clientSecret?.trim() || process.env.DISCORD_CLIENT_SECRET || undefined,
    redirectUri:
      cfg.discord?.redirectUri?.trim() || process.env.DISCORD_REDIRECT_URI || undefined,
  };
}

export async function resolveSteam(): Promise<{ realm?: string }> {
  const cfg = await readRuntimeAuthConfig();
  return { realm: cfg.steam?.realm?.trim() || process.env.STEAM_REALM || undefined };
}

/** True si l’API peut être utilisée pour écrire (dev par défaut, opt-in en prod). */
export function isRuntimeWriteAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_RUNTIME_AUTH_CONFIG === "true";
}

/** Status sans secrets pour l’UI. */
export type PublicAuthConfigStatus = {
  hasAuthSecret: boolean;
  authSecretSource: "runtime" | "env" | "none";
  discord: {
    clientId: string;
    redirectUri: string;
    hasClientSecret: boolean;
    source: "runtime" | "env" | "mixed" | "none";
  };
  steam: {
    realm: string;
  };
  hasOwnerToken: boolean;
  updatedAt?: string;
  writeAllowed: boolean;
};

function sourceOf(runtime: string | undefined, env: string | undefined): "runtime" | "env" | "none" {
  if (runtime?.trim()) return "runtime";
  if (env?.trim()) return "env";
  return "none";
}

export async function getPublicStatus(): Promise<PublicAuthConfigStatus> {
  const cfg = await readRuntimeAuthConfig();
  const authSecretSource = sourceOf(cfg.authSecret, process.env.AUTH_SECRET);
  const idSrc = sourceOf(cfg.discord?.clientId, process.env.DISCORD_CLIENT_ID);
  const secSrc = sourceOf(cfg.discord?.clientSecret, process.env.DISCORD_CLIENT_SECRET);
  const sources = new Set([idSrc, secSrc].filter((s) => s !== "none"));
  let discordSource: "runtime" | "env" | "mixed" | "none" = "none";
  if (sources.size === 1) discordSource = [...sources][0]!;
  else if (sources.size > 1) discordSource = "mixed";
  return {
    hasAuthSecret: authSecretSource !== "none",
    authSecretSource,
    discord: {
      clientId: cfg.discord?.clientId ?? process.env.DISCORD_CLIENT_ID ?? "",
      redirectUri: cfg.discord?.redirectUri ?? process.env.DISCORD_REDIRECT_URI ?? "",
      hasClientSecret: secSrc !== "none",
      source: discordSource,
    },
    steam: {
      realm: cfg.steam?.realm ?? process.env.STEAM_REALM ?? "",
    },
    hasOwnerToken: !!cfg.ownerToken,
    updatedAt: cfg.updatedAt,
    writeAllowed: isRuntimeWriteAllowed(),
  };
}

export function generateOwnerToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, "0");
  return out;
}
