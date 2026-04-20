"use client";

import { useEffect, useState } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

interface DiscordSettings {
  serverId?: string;
  refreshSeconds?: number;
  position?: "bottom-left" | "top-left";
  inviteUrl?: string;
  accentColor?: string;
  collapsedByDefault?: boolean;
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  members: Array<{
    id: string;
    username: string;
    discriminator?: string;
    avatar_url?: string;
    status?: string;
  }>;
}

const STATE_KEY = "ext:discord-widget:open";

export function DiscordWidgetExtension() {
  const { config } = useSiteConfig();
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<DiscordWidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const enabled = isExtensionEnabled(config, "discord-widget");
  const ext = getExtension(config, "discord-widget");
  const settings = (ext?.settings ?? {}) as DiscordSettings;

  const serverId = settings.serverId?.trim();
  const interval = Math.max(Number(settings.refreshSeconds) || 60, 15);
  const accent = settings.accentColor?.trim() || "#5865F2";
  const position = settings.position === "top-left" ? "top-left" : "bottom-left";
  const inviteUrl = settings.inviteUrl?.trim() || data?.instant_invite || config.social.discord;

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STATE_KEY);
      setOpen(raw === null ? !(settings.collapsedByDefault ?? true) : raw === "1");
    } catch {
      setOpen(!(settings.collapsedByDefault ?? true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled || !serverId || !hydrated) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch(
          `https://discord.com/api/guilds/${serverId}/widget.json`,
          { cache: "no-store", signal: AbortSignal.timeout(8000) },
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Widget Discord non activé sur ce serveur."
              : `HTTP ${res.status}`,
          );
        }
        const json = (await res.json()) as DiscordWidgetData;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
      if (!cancelled) timer = setTimeout(tick, interval * 1000);
    }

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, serverId, interval, hydrated]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem(STATE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (!hydrated || !enabled) return null;

  const positionClass =
    position === "top-left"
      ? "left-4 top-20 sm:left-6"
      : "left-4 bottom-4 sm:left-6 sm:bottom-6";

  const onlineMembers = data?.members ?? [];
  const presenceCount = data?.presence_count ?? onlineMembers.length;

  return (
    <div className={`fixed z-30 ${positionClass}`}>
      {open ? (
        <div
          className="w-[280px] overflow-hidden rounded-2xl border bg-[var(--rp-surface)]/95 shadow-2xl backdrop-blur"
          style={{
            borderColor: `color-mix(in oklab, ${accent} 35%, var(--rp-border))`,
          }}
        >
          <header
            className="flex items-center justify-between gap-2 border-b px-3 py-2"
            style={{
              borderColor: `color-mix(in oklab, ${accent} 25%, var(--rp-border))`,
              background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 22%, transparent), transparent)`,
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <svg
                width="18"
                height="14"
                viewBox="0 0 71 55"
                fill={accent}
                aria-hidden
              >
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6 0c-.6 1.1-1.4 2.6-1.9 3.8a54.6 54.6 0 0 0-16.4 0C26.8 2.6 26 1.1 25.4 0a58.5 58.5 0 0 0-14.5 4.9C2.4 17.4-.5 29.5.6 41.5a59 59 0 0 0 18 9.1c1.4-2 2.7-4.1 3.8-6.3a37.7 37.7 0 0 1-6-2.9c.5-.4 1-.8 1.5-1.2 11.5 5.4 24 5.4 35.4 0 .5.4 1 .8 1.5 1.2-1.9 1.1-3.9 2.1-6 2.9 1.1 2.2 2.4 4.3 3.8 6.3a59 59 0 0 0 18-9.1c1.4-13.9-2-25.9-9.5-36.6zM23.7 34.3c-3.5 0-6.4-3.2-6.4-7.2 0-4 2.8-7.2 6.4-7.2 3.5 0 6.4 3.2 6.4 7.2 0 4-2.9 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2 0-4 2.8-7.2 6.4-7.2 3.5 0 6.4 3.2 6.4 7.2 0 4-2.9 7.2-6.4 7.2z" />
              </svg>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--rp-fg)]">
                  {data?.name || "Discord"}
                </p>
                <p className="text-[10px] text-[var(--rp-muted)]">
                  {error
                    ? "Indisponible"
                    : data
                      ? `${presenceCount} en ligne`
                      : "Chargement…"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-[var(--rp-muted)] hover:bg-white/10"
              aria-label="Réduire"
            >
              –
            </button>
          </header>

          <div className="px-3 py-3">
            {error ? (
              <p className="text-[11px] text-[var(--rp-danger)]">
                {error}
                <br />
                <span className="text-[10px] text-[var(--rp-muted)]">
                  Activez le widget dans Paramètres serveur Discord → Widget.
                </span>
              </p>
            ) : !data ? (
              <p className="text-[11px] text-[var(--rp-muted)]">Chargement…</p>
            ) : (
              <>
                <ul className="max-h-[140px] space-y-1.5 overflow-y-auto">
                  {onlineMembers.slice(0, 8).map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-xs">
                      {m.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatar_url}
                          alt=""
                          className="h-5 w-5 rounded-full border border-white/10"
                        />
                      ) : (
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: accent }}
                          aria-hidden
                        >
                          {m.username.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="truncate text-[var(--rp-fg)]">
                        {m.username}
                      </span>
                      <span
                        className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${
                          m.status === "online"
                            ? "bg-[var(--rp-success)]"
                            : m.status === "idle"
                              ? "bg-[var(--rp-accent)]"
                              : "bg-[var(--rp-muted)]"
                        }`}
                        aria-hidden
                      />
                    </li>
                  ))}
                  {onlineMembers.length === 0 ? (
                    <li className="text-[11px] text-[var(--rp-muted)]">
                      Aucun membre visible.
                    </li>
                  ) : null}
                </ul>
                {onlineMembers.length > 8 ? (
                  <p className="mt-1 text-right text-[10px] text-[var(--rp-muted)]">
                    +{onlineMembers.length - 8} autres…
                  </p>
                ) : null}
              </>
            )}

            {inviteUrl ? (
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-full px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:brightness-110"
                style={{ background: accent }}
              >
                Rejoindre le Discord
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggle}
          className="grid h-12 w-12 place-items-center rounded-full text-white shadow-xl transition hover:scale-105"
          style={{ background: accent }}
          aria-label="Ouvrir le widget Discord"
        >
          <svg width="20" height="16" viewBox="0 0 71 55" fill="currentColor" aria-hidden>
            <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6 0c-.6 1.1-1.4 2.6-1.9 3.8a54.6 54.6 0 0 0-16.4 0C26.8 2.6 26 1.1 25.4 0a58.5 58.5 0 0 0-14.5 4.9C2.4 17.4-.5 29.5.6 41.5a59 59 0 0 0 18 9.1c1.4-2 2.7-4.1 3.8-6.3a37.7 37.7 0 0 1-6-2.9c.5-.4 1-.8 1.5-1.2 11.5 5.4 24 5.4 35.4 0 .5.4 1 .8 1.5 1.2-1.9 1.1-3.9 2.1-6 2.9 1.1 2.2 2.4 4.3 3.8 6.3a59 59 0 0 0 18-9.1c1.4-13.9-2-25.9-9.5-36.6zM23.7 34.3c-3.5 0-6.4-3.2-6.4-7.2 0-4 2.8-7.2 6.4-7.2 3.5 0 6.4 3.2 6.4 7.2 0 4-2.9 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2 0-4 2.8-7.2 6.4-7.2 3.5 0 6.4 3.2 6.4 7.2 0 4-2.9 7.2-6.4 7.2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
