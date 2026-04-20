"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import type { ServerBlock } from "@/config/types";

export interface LivePlayer {
  id: number | null;
  name: string;
  ping: number | null;
}

export interface LiveServerState {
  /** Valeurs finales à afficher (live si dispo, sinon config manuelle). */
  playersOnline: number;
  maxPlayers: number;
  status: "online" | "offline" | "maintenance";
  hostname: string | null;
  /** Description "marketing" (sv_projectDesc) remontée par info.json. */
  description: string | null;
  /** Version brute FXServer (info.json → server). */
  serverVersion: string | null;
  /** Icône base64 du serveur (info.json → icon), sans préfixe data:. */
  iconBase64: string | null;
  /** Liste des joueurs si disponible. */
  players: LivePlayer[] | null;
  /** Moment de la dernière mise à jour live réussie. */
  updatedAt: number | null;
  /** État interne : `live` = réponse API ok, `fallback` = valeurs config, `error` = tentative ratée. */
  mode: "live" | "fallback" | "loading" | "error";
  errorMessage?: string;
  /** Sources ayant répondu (cfx / players.json / info.json). */
  source: string[];
}

function deriveEnabled(server: ServerBlock): boolean {
  if (server.autoLive === false) return false;
  return Boolean(server.cfxCode?.trim() || server.playersJsonUrl?.trim());
}

function buildUrl(server: ServerBlock): string {
  const params = new URLSearchParams();
  if (server.cfxCode?.trim()) params.set("code", server.cfxCode.trim());
  if (server.playersJsonUrl?.trim()) params.set("playersUrl", server.playersJsonUrl.trim());
  return `/api/server/live?${params.toString()}`;
}

export function useLiveServer(): LiveServerState {
  const { config } = useSiteConfig();
  const server = config.server;

  const enabled = deriveEnabled(server);
  const url = useMemo(() => (enabled ? buildUrl(server) : null), [
    enabled,
    server.cfxCode,
    server.playersJsonUrl,
  ]);
  const refreshSeconds = Math.max(Number(server.liveRefreshSeconds) || 30, 10);

  const [state, setState] = useState<LiveServerState>(() => ({
    playersOnline: Number(server.playersOnline) || 0,
    maxPlayers: Number(server.maxPlayers) || 0,
    status: server.status,
    hostname: null,
    description: null,
    serverVersion: null,
    iconBase64: null,
    players: null,
    updatedAt: null,
    mode: enabled ? "loading" : "fallback",
    source: [],
  }));

  // Si l'admin modifie manuellement les valeurs alors que le live est OFF,
  // on reflète ces changements dans state.
  useEffect(() => {
    if (enabled) return;
    setState((prev) => ({
      ...prev,
      playersOnline: Number(server.playersOnline) || 0,
      maxPlayers: Number(server.maxPlayers) || 0,
      status: server.status,
      mode: "fallback",
    }));
  }, [enabled, server.playersOnline, server.maxPlayers, server.status]);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !url) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const res = await fetch(url!, { cache: "no-store", signal: controller.signal });
        const body = (await res.json()) as {
          ok?: boolean;
          status?: "online" | "offline";
          playersOnline?: number | null;
          maxPlayers?: number | null;
          hostname?: string | null;
          description?: string | null;
          serverVersion?: string | null;
          iconBase64?: string | null;
          players?: LivePlayer[] | null;
          source?: string[];
          errors?: Record<string, string>;
          error?: string;
          message?: string;
          fetchedAt?: string;
        };
        if (cancelled) return;

        if (!res.ok || !body.ok) {
          setState((prev) => ({
            ...prev,
            mode: "error",
            errorMessage: body.message || body.error || `HTTP ${res.status}`,
          }));
        } else {
          // Merge live + fallback config pour les valeurs manquantes.
          const online =
            typeof body.playersOnline === "number"
              ? body.playersOnline
              : Number(server.playersOnline) || 0;
          const max =
            typeof body.maxPlayers === "number" && body.maxPlayers > 0
              ? body.maxPlayers
              : Number(server.maxPlayers) || 0;
          const status = body.status ?? (online > 0 ? "online" : "offline");
          setState({
            playersOnline: online,
            maxPlayers: max,
            status: server.status === "maintenance" ? "maintenance" : status,
            hostname: body.hostname ?? null,
            description: body.description ?? null,
            serverVersion: body.serverVersion ?? null,
            iconBase64: body.iconBase64 ?? null,
            players: body.players ?? null,
            updatedAt: Date.now(),
            mode: "live",
            source: body.source ?? [],
          });
        }
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).name !== "AbortError") {
          setState((prev) => ({
            ...prev,
            mode: "error",
            errorMessage: (err as Error).message,
          }));
        }
      } finally {
        if (!cancelled) {
          timer = setTimeout(tick, refreshSeconds * 1000);
        }
      }
    }

    void tick();
    return () => {
      cancelled = true;
      controllerRef.current?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [enabled, url, refreshSeconds, server.status, server.playersOnline, server.maxPlayers]);

  return state;
}
