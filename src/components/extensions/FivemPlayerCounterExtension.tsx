"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

interface CounterSettings {
  serverUrl?: string;
  refreshSeconds?: number;
  label?: string;
  position?: "top-right" | "top-left";
  accentColor?: string;
  maxPlayers?: number;
}

interface FivemPlayer {
  endpoint?: string;
  id?: number;
  identifiers?: string[];
  name?: string;
  ping?: number;
}

const CACHE_KEY = "ext:fivem-counter:cache";
const CACHE_TTL_MS = 5_000;

interface CacheEntry {
  url: string;
  ts: number;
  count: number;
}

function readCache(url: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CacheEntry;
    if (c.url !== url) return null;
    if (Date.now() - c.ts > CACHE_TTL_MS) return null;
    return c;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

export function FivemPlayerCounterExtension() {
  const { config } = useSiteConfig();
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
  const [hydrated, setHydrated] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const lastFetchRef = useRef(0);

  const enabled = isExtensionEnabled(config, "fivem-player-counter");
  const ext = getExtension(config, "fivem-player-counter");
  const settings = (ext?.settings ?? {}) as CounterSettings;

  const url = settings.serverUrl?.trim();
  const interval = Math.max(Number(settings.refreshSeconds) || 30, 5);
  const accent = settings.accentColor?.trim() || "#52e3a3";
  const label = settings.label?.trim() || "Joueurs FiveM";
  const max = Math.max(Number(settings.maxPlayers) || config.server.maxPlayers || 64, 0);
  const position = settings.position === "top-left" ? "top-left" : "top-right";

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!enabled || !url || !hydrated) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      const now = Date.now();
      const cached = readCache(url!);
      if (cached) {
        if (!cancelled) {
          setCount(cached.count);
          setStatus("online");
          setUpdatedAt(cached.ts);
        }
      } else if (now - lastFetchRef.current > 1000) {
        lastFetchRef.current = now;
        try {
          const res = await fetch(`${url!.replace(/\/$/, "")}/players.json`, {
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as FivemPlayer[];
          const c = Array.isArray(data) ? data.length : 0;
          if (!cancelled) {
            setCount(c);
            setStatus("online");
            setUpdatedAt(Date.now());
          }
          writeCache({ url: url!, ts: Date.now(), count: c });
        } catch {
          if (!cancelled) {
            setStatus("offline");
            setCount(null);
          }
        }
      }
      if (!cancelled) {
        timer = setTimeout(tick, interval * 1000);
      }
    }

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, url, interval, hydrated]);

  if (!hydrated || !enabled) return null;

  const positionClass =
    position === "top-left" ? "left-4 top-20 sm:left-6" : "right-4 top-20 sm:right-6";

  const pct = max > 0 && count !== null ? Math.min(100, Math.round((count / max) * 100)) : 0;

  return (
    <div
      className={`fixed z-30 ${positionClass} rounded-2xl border bg-[var(--rp-surface)]/95 px-3 py-2 shadow-xl backdrop-blur`}
      style={{
        borderColor: `color-mix(in oklab, ${accent} 35%, var(--rp-border))`,
        minWidth: 180,
      }}
      role="status"
      aria-label={`${label}: ${status === "online" ? `${count} joueurs` : "hors ligne"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className="relative flex h-2 w-2"
          aria-hidden
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:animate-none"
            style={{ background: status === "online" ? accent : "var(--rp-danger)" }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: status === "online" ? accent : "var(--rp-danger)" }}
          />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--rp-muted)]">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        {!url ? (
          <span className="text-[11px] text-[var(--rp-danger)]">URL serveur manquante</span>
        ) : status === "loading" ? (
          <span className="text-xs text-[var(--rp-muted)]">…</span>
        ) : status === "offline" ? (
          <span className="text-sm font-bold text-[var(--rp-danger)]">Hors ligne</span>
        ) : (
          <>
            <span
              className="font-heading text-2xl font-bold tabular-nums"
              style={{ color: accent }}
            >
              {count}
            </span>
            <span className="text-xs text-[var(--rp-muted)]">/ {max || "?"}</span>
          </>
        )}
      </div>
      {status === "online" && max > 0 ? (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
      ) : null}
      {updatedAt > 0 ? (
        <p className="mt-1 text-right text-[9px] text-[var(--rp-muted)]">
          {new Date(updatedAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
      ) : null}
    </div>
  );
}
