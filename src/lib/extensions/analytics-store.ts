/**
 * Stockage local pour l'extension `analytics-pageviews`.
 * 100% client : tout est dans localStorage, donc isolé par navigateur.
 */

const EVENTS_KEY = "ext:analytics:events";
const SESSION_KEY = "ext:analytics:sessions";
const HARD_CAP = 5000;

export interface PageViewEvent {
  path: string;
  ts: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function recordPageView(path: string) {
  if (typeof window === "undefined") return;
  const events = readJson<PageViewEvent[]>(EVENTS_KEY, []);
  events.push({ path, ts: Date.now() });
  writeJson(EVENTS_KEY, events.slice(-HARD_CAP));
}

/** Marque une nouvelle session (1 seule par onglet, fenêtre de 30min). */
export function startSession() {
  if (typeof window === "undefined") return;
  const sessions = readJson<number[]>(SESSION_KEY, []);
  const last = sessions[sessions.length - 1] ?? 0;
  const now = Date.now();
  if (now - last > 30 * 60 * 1000) {
    sessions.push(now);
    writeJson(SESSION_KEY, sessions.slice(-HARD_CAP));
  }
}

export function getEvents(): PageViewEvent[] {
  if (typeof window === "undefined") return [];
  return readJson<PageViewEvent[]>(EVENTS_KEY, []);
}

export function getSessions(): number[] {
  if (typeof window === "undefined") return [];
  return readJson<number[]>(SESSION_KEY, []);
}

export function clearAnalytics() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueSessions: number;
  topPages: Array<{ path: string; count: number }>;
  daily: Array<{ day: string; count: number }>;
  last24h: number;
}

export function buildSummary(): AnalyticsSummary {
  const events = getEvents();
  const sessions = getSessions();
  const counts = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  let last24h = 0;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const e of events) {
    counts.set(e.path, (counts.get(e.path) ?? 0) + 1);
    const day = new Date(e.ts).toISOString().slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    if (e.ts >= cutoff) last24h += 1;
  }
  return {
    totalViews: events.length,
    uniqueSessions: sessions.length,
    last24h,
    topPages: Array.from(counts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    daily: Array.from(dayCounts.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14),
  };
}
