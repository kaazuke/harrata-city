import { NextResponse } from "next/server";

/**
 * Proxy live des informations d'un serveur FiveM.
 *
 * Query params (tout facultatif) :
 *  - `code`     : code Cfx.re (ex. "abcxyz") → https://servers-frontend.fivem.net/api/servers/single/{code}
 *  - `playersUrl` : URL absolue vers un endpoint `/players.json` public du serveur.
 *
 * Si les deux sont fournis, `playersUrl` l'emporte pour le compteur et la liste
 * des joueurs, tandis que Cfx.re reste la source pour hostname / max slots / statut.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CfxServerData {
  clients?: number;
  sv_maxclients?: number;
  svMaxclients?: number;
  hostname?: string;
  iconVersion?: number;
  joinId?: string;
  vars?: Record<string, string>;
  resources?: string[];
  players?: Array<{ id?: number; name?: string; ping?: number; identifiers?: string[] }>;
}
interface CfxResponse {
  EndPoint?: string;
  Data?: CfxServerData;
}
interface FivemPlayer {
  id?: number;
  name?: string;
  ping?: number;
  identifiers?: string[];
  endpoint?: string;
}

interface FivemInfo {
  /* Version exposée par FXServer (ex. "FXServer-master v1.0.0.25770 linux") */
  server?: string;
  vars?: Record<string, string>;
  resources?: string[];
  /* Icône du serveur au format base64 PNG. */
  icon?: string;
  enhancedHostSupport?: boolean;
  requestSteamTicket?: string;
  version?: number;
}

const TIMEOUT = 8000;

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

function stripTags(s?: string): string | undefined {
  if (!s) return undefined;
  // Les hostnames FiveM embarquent des codes couleur ^1 ^2 … et des tags HTML
  return s.replace(/\^\d/g, "").replace(/<[^>]*>/g, "").trim() || undefined;
}

async function fetchCfx(code: string) {
  const url = `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(code)}`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; HarrataCityBot/1.0; +https://cfx.re)",
      accept: "application/json",
    },
    cache: "no-store",
    signal: timeoutSignal(TIMEOUT),
  });
  if (!res.ok) {
    throw new Error(`cfx HTTP ${res.status}`);
  }
  return (await res.json()) as CfxResponse;
}

async function fetchPlayersJson(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    signal: timeoutSignal(TIMEOUT),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`players.json HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("players.json: format invalide");
  return data as FivemPlayer[];
}

/**
 * Déduit l'URL `/info.json` du serveur à partir de l'URL `players.json`.
 * Ex. `http://1.2.3.4:30120/players.json` → `http://1.2.3.4:30120/info.json`.
 * Renvoie `undefined` si le chemin ne se termine pas par `players.json`.
 */
function deriveInfoUrl(playersUrl: string): string | undefined {
  try {
    const u = new URL(playersUrl);
    if (!/players\.json\/?$/i.test(u.pathname)) return undefined;
    u.pathname = u.pathname.replace(/players\.json\/?$/i, "info.json");
    return u.toString();
  } catch {
    return undefined;
  }
}

async function fetchInfoJson(url: string): Promise<FivemInfo> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: timeoutSignal(TIMEOUT),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`info.json HTTP ${res.status}`);
  const data = (await res.json()) as FivemInfo;
  if (!data || typeof data !== "object") throw new Error("info.json: format invalide");
  return data;
}

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    // Ne pas laisser appeler des hôtes internes/loopback depuis le serveur.
    const host = u.hostname.toLowerCase();
    if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host)) return false;
    if (/^10\./.test(host) || /^192\.168\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim();
  const playersUrlRaw = (searchParams.get("playersUrl") || "").trim();

  if (!code && !playersUrlRaw) {
    return NextResponse.json(
      { ok: false, error: "missing_params", message: "Fournissez `code` (Cfx.re) et/ou `playersUrl`." },
      { status: 400 },
    );
  }

  let hostname: string | undefined;
  let maxPlayers: number | undefined;
  let playersOnline: number | undefined;
  let players: FivemPlayer[] | undefined;
  let endpoint: string | undefined;
  let description: string | undefined;
  let gamename: string | undefined;
  let locale: string | undefined;
  let serverVersion: string | undefined;
  let iconBase64: string | undefined;
  const source: ("cfx" | "players.json" | "info.json")[] = [];
  const errors: Record<string, string> = {};

  if (code) {
    try {
      const cfx = await fetchCfx(code);
      const d = cfx.Data ?? {};
      hostname = stripTags(d.hostname);
      maxPlayers = Number(d.sv_maxclients ?? d.svMaxclients ?? 0) || undefined;
      playersOnline = typeof d.clients === "number" ? d.clients : undefined;
      endpoint = cfx.EndPoint;
      if (Array.isArray(d.players) && d.players.length > 0) {
        players = d.players;
      }
      source.push("cfx");
    } catch (err) {
      errors.cfx = err instanceof Error ? err.message : String(err);
    }
  }

  if (playersUrlRaw) {
    if (!isSafeUrl(playersUrlRaw)) {
      errors.players = "URL invalide ou hôte non autorisé (pas de loopback/LAN).";
    } else {
      /* players.json et info.json se situent à la même racine côté FXServer :
         on les récupère en parallèle pour économiser de la latence. */
      const infoUrl = deriveInfoUrl(playersUrlRaw);
      const [playersRes, infoRes] = await Promise.allSettled([
        fetchPlayersJson(playersUrlRaw),
        infoUrl ? fetchInfoJson(infoUrl) : Promise.reject(new Error("no info url")),
      ]);

      if (playersRes.status === "fulfilled") {
        players = playersRes.value;
        playersOnline = playersRes.value.length;
        source.push("players.json");
      } else {
        errors.players =
          playersRes.reason instanceof Error
            ? playersRes.reason.message
            : String(playersRes.reason);
      }

      if (infoRes.status === "fulfilled") {
        const info = infoRes.value;
        const vars = info.vars ?? {};
        /* sv_projectName est le hostname "marketing" du serveur, sinon
           sv_hostname / sv_projectDesc en secours. */
        hostname = hostname ?? stripTags(vars.sv_projectName) ?? stripTags(vars.sv_hostname);
        description = stripTags(vars.sv_projectDesc);
        const max = Number(vars.sv_maxClients ?? vars.sv_maxclients ?? 0);
        if (!maxPlayers && Number.isFinite(max) && max > 0) maxPlayers = max;
        gamename = vars.gamename;
        locale = vars.locale;
        serverVersion = info.server;
        if (typeof info.icon === "string" && info.icon.length > 0) {
          iconBase64 = info.icon;
        }
        source.push("info.json");
      } else if (infoUrl) {
        errors.info =
          infoRes.reason instanceof Error ? infoRes.reason.message : String(infoRes.reason);
      }
    }
  }

  const anyData =
    typeof playersOnline === "number" ||
    typeof maxPlayers === "number" ||
    typeof hostname === "string";

  if (!anyData) {
    return NextResponse.json(
      {
        ok: false,
        error: "upstream_unreachable",
        message: "Impossible de contacter les sources configurées.",
        errors,
      },
      { status: 502 },
    );
  }

  const status: "online" | "offline" =
    typeof playersOnline === "number" && playersOnline >= 0 ? "online" : "offline";

  return NextResponse.json(
    {
      ok: true,
      status,
      playersOnline: playersOnline ?? null,
      maxPlayers: maxPlayers ?? null,
      hostname: hostname ?? null,
      description: description ?? null,
      gamename: gamename ?? null,
      locale: locale ?? null,
      serverVersion: serverVersion ?? null,
      iconBase64: iconBase64 ?? null,
      endpoint: endpoint ?? null,
      players:
        players?.map((p) => ({ id: p.id ?? null, name: p.name ?? "?", ping: p.ping ?? null })) ??
        null,
      source,
      errors: Object.keys(errors).length ? errors : undefined,
      fetchedAt: new Date().toISOString(),
    },
    {
      // Cache côté edge court : évite de marteler les APIs externes à chaque clic.
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=30",
      },
    },
  );
}
