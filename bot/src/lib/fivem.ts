import { env } from "../config/env.js";
import { logger } from "./logger.js";

export interface FivemPlayer {
  id: number;
  name: string;
  identifiers: string[];
  ping: number;
}

export interface FivemInfo {
  vars?: Record<string, string>;
  icon?: string;
  server?: string;
  resources?: string[];
}

export interface FivemLiveStatus {
  online: boolean;
  hostname: string | null;
  playersOnline: number;
  maxPlayers: number;
  description: string | null;
  iconBase64: string | null;
  gamename: string | null;
  players: FivemPlayer[];
  source: "site" | "direct" | "none";
}

async function fetchJson<T>(url: string, timeoutMs = 5_000): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    logger.debug({ err, url }, "fetchJson échec");
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Essaie d'abord le site Harrata City (qui agrège déjà players + info),
 * sinon tombe directement sur le serveur FiveM.
 */
export async function fetchFivemStatus(): Promise<FivemLiveStatus> {
  const siteUrl = `${env.site.apiUrl.replace(/\/$/, "")}/api/server/live`;
  const fromSite = await fetchJson<Partial<FivemLiveStatus> & { online?: boolean }>(siteUrl);

  if (fromSite && typeof fromSite.playersOnline === "number") {
    return {
      online: fromSite.online ?? fromSite.playersOnline >= 0,
      hostname: fromSite.hostname ?? null,
      playersOnline: fromSite.playersOnline ?? 0,
      maxPlayers: fromSite.maxPlayers ?? 0,
      description: fromSite.description ?? null,
      iconBase64: fromSite.iconBase64 ?? null,
      gamename: fromSite.gamename ?? null,
      players: (fromSite.players as FivemPlayer[]) ?? [],
      source: "site",
    };
  }

  if (env.fivem.playersUrl) {
    const players = (await fetchJson<FivemPlayer[]>(env.fivem.playersUrl)) ?? [];
    const info = env.fivem.infoUrl
      ? await fetchJson<FivemInfo>(env.fivem.infoUrl)
      : null;
    const max = Number(info?.vars?.sv_maxClients ?? 0);
    return {
      online: Array.isArray(players),
      hostname: info?.vars?.sv_hostname ?? null,
      playersOnline: players.length,
      maxPlayers: Number.isFinite(max) ? max : 0,
      description: info?.vars?.sv_projectDesc ?? null,
      iconBase64: info?.icon ? `data:image/png;base64,${info.icon}` : null,
      gamename: info?.vars?.gamename ?? null,
      players,
      source: "direct",
    };
  }

  return {
    online: false,
    hostname: null,
    playersOnline: 0,
    maxPlayers: 0,
    description: null,
    iconBase64: null,
    gamename: null,
    players: [],
    source: "none",
  };
}
