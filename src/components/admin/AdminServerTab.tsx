"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import type { ServerBlock } from "@/config/types";

interface LiveProbeResult {
  ok: boolean;
  status?: "online" | "offline";
  playersOnline?: number | null;
  maxPlayers?: number | null;
  hostname?: string | null;
  description?: string | null;
  gamename?: string | null;
  locale?: string | null;
  serverVersion?: string | null;
  iconBase64?: string | null;
  endpoint?: string | null;
  players?: Array<{ id: number | null; name: string; ping: number | null }> | null;
  source?: string[];
  errors?: Record<string, string>;
  error?: string;
  message?: string;
  fetchedAt?: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-[var(--rp-muted)]">{children}</label>;
}

export function AdminServerTab() {
  const { config, setConfig } = useSiteConfig();
  const server = config.server;
  const [probing, setProbing] = useState(false);
  const [probe, setProbe] = useState<LiveProbeResult | null>(null);

  function setServer(patch: Partial<ServerBlock>) {
    setConfig({ ...config, server: { ...config.server, ...patch } });
  }

  async function runProbe() {
    setProbing(true);
    setProbe(null);
    try {
      const params = new URLSearchParams();
      if (server.cfxCode?.trim()) params.set("code", server.cfxCode.trim());
      if (server.playersJsonUrl?.trim()) params.set("playersUrl", server.playersJsonUrl.trim());
      if (!params.toString()) {
        setProbe({ ok: false, message: "Renseigne un code Cfx.re ou une URL /players.json d’abord." });
      } else {
        const res = await fetch(`/api/server/live?${params.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as LiveProbeResult;
        setProbe(data);
      }
    } catch (err) {
      setProbe({ ok: false, message: (err as Error).message });
    } finally {
      setProbing(false);
    }
  }

  function applyProbe() {
    if (!probe?.ok) return;
    setServer({
      playersOnline:
        typeof probe.playersOnline === "number" ? probe.playersOnline : server.playersOnline,
      maxPlayers:
        typeof probe.maxPlayers === "number" && probe.maxPlayers > 0
          ? probe.maxPlayers
          : server.maxPlayers,
      status: probe.status ?? server.status,
      displayName: probe.hostname?.trim() || server.displayName,
    });
  }

  const hasLive = Boolean(server.cfxCode?.trim() || server.playersJsonUrl?.trim());
  const autoLive = server.autoLive !== false && hasLive;
  const refreshSec = Math.max(Number(server.liveRefreshSeconds) || 30, 10);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Serveur FiveM — connexion live"
          subtitle="Synchronise automatiquement le nombre de joueurs, le max et le statut depuis Cfx.re et/ou ton endpoint /players.json."
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Code Cfx.re (partage)</FieldLabel>
              <Input
                className="mt-2"
                value={server.cfxCode ?? ""}
                onChange={(e) =>
                  setServer({ cfxCode: e.target.value.trim().toLowerCase() || undefined })
                }
                placeholder="ex. abcxyz"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--rp-muted)]">
                Récupère-le sur la fiche du serveur sur servers.fivem.net : URL de type{" "}
                <span className="font-mono">servers.fivem.net/servers/detail/abcxyz</span>. Le code est
                la partie finale.
              </p>
            </div>
            <div>
              <FieldLabel>URL publique /players.json</FieldLabel>
              <Input
                className="mt-2"
                value={server.playersJsonUrl ?? ""}
                onChange={(e) => setServer({ playersJsonUrl: e.target.value.trim() || undefined })}
                placeholder="https://ip-publique:30120/players.json"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--rp-muted)]">
                Endpoint natif FiveM. Doit être accessible publiquement (IP + port, généralement{" "}
                <span className="font-mono">30120</span>). Pas de loopback / LAN accepté.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
              <span>
                <span className="block">Synchro automatique</span>
                <span className="mt-0.5 block text-[10px] text-[var(--rp-muted)]">
                  Poll l’API live sur toutes les pages.
                </span>
              </span>
              <input
                type="checkbox"
                checked={autoLive}
                disabled={!hasLive}
                onChange={(e) => setServer({ autoLive: e.target.checked })}
              />
            </label>
            <div>
              <FieldLabel>Rafraîchissement (secondes)</FieldLabel>
              <Input
                className="mt-2"
                type="number"
                min={10}
                step={5}
                value={refreshSec}
                onChange={(e) =>
                  setServer({ liveRefreshSeconds: Math.max(10, Number(e.target.value) || 30) })
                }
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="button" onClick={runProbe} disabled={probing || !hasLive}>
                {probing ? "Test…" : "Tester la connexion"}
              </Button>
              {probe?.ok ? (
                <Button type="button" variant="outline" onClick={applyProbe}>
                  Appliquer
                </Button>
              ) : null}
            </div>
          </div>

          {probe ? (
            <div
              className={`rounded-[var(--rp-radius)] border p-3 text-xs ${
                probe.ok
                  ? "border-[color-mix(in_oklab,var(--rp-success)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-success)_8%,transparent)]"
                  : "border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-danger)_8%,transparent)]"
              }`}
            >
              {probe.ok ? (
                <div className="flex gap-3">
                  {probe.iconBase64 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`data:image/png;base64,${probe.iconBase64}`}
                      alt="Icône serveur"
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-md border border-[var(--rp-border)] bg-black/30"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--rp-success)]">
                      Connexion réussie ({(probe.source ?? []).join(", ") || "ok"})
                    </div>
                    <div>
                      <span className="text-[var(--rp-muted)]">Hostname :</span>{" "}
                      <span className="text-[var(--rp-fg)]">{probe.hostname ?? "—"}</span>
                    </div>
                    {probe.description ? (
                      <div>
                        <span className="text-[var(--rp-muted)]">Description :</span>{" "}
                        <span className="text-[var(--rp-fg)]">{probe.description}</span>
                      </div>
                    ) : null}
                    <div>
                      <span className="text-[var(--rp-muted)]">Joueurs :</span>{" "}
                      <span className="text-[var(--rp-fg)]">
                        {probe.playersOnline ?? "?"} / {probe.maxPlayers ?? "?"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--rp-muted)]">Statut :</span>{" "}
                      <span className="text-[var(--rp-fg)]">{probe.status ?? "—"}</span>
                    </div>
                    {probe.serverVersion ? (
                      <div>
                        <span className="text-[var(--rp-muted)]">Version :</span>{" "}
                        <span className="font-mono text-[var(--rp-fg)]">{probe.serverVersion}</span>
                        {probe.gamename ? (
                          <span className="text-[var(--rp-muted)]"> · {probe.gamename}</span>
                        ) : null}
                        {probe.locale ? (
                          <span className="text-[var(--rp-muted)]"> · {probe.locale}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {probe.endpoint ? (
                      <div>
                        <span className="text-[var(--rp-muted)]">Endpoint :</span>{" "}
                        <span className="font-mono text-[var(--rp-fg)]">{probe.endpoint}</span>
                      </div>
                    ) : null}
                    {probe.errors && Object.keys(probe.errors).length > 0 ? (
                      <div className="pt-1 text-[var(--rp-muted)]">
                        Avertissements :{" "}
                        {Object.entries(probe.errors)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--rp-danger)]">Échec de la connexion</div>
                  <div>{probe.message || probe.error || "Impossible de contacter les sources."}</div>
                  {probe.errors ? (
                    <div className="text-[var(--rp-muted)]">
                      {Object.entries(probe.errors)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Affichage & valeurs de secours"
          subtitle="Utilisées si la synchro live est désactivée ou injoignable."
        />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>IP / commande à afficher</FieldLabel>
            <Input
              className="mt-2"
              value={server.ip}
              onChange={(e) => setServer({ ip: e.target.value })}
              placeholder="connect play.harrata-city.fr"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Nom affiché (displayName)</FieldLabel>
            <Input
              className="mt-2"
              value={server.displayName}
              onChange={(e) => setServer({ displayName: e.target.value })}
              placeholder="Harrata City — Public"
            />
          </div>
          <div>
            <FieldLabel>Joueurs en ligne (fallback)</FieldLabel>
            <Input
              className="mt-2"
              type="number"
              value={server.playersOnline}
              onChange={(e) => setServer({ playersOnline: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>Slots max (fallback)</FieldLabel>
            <Input
              className="mt-2"
              type="number"
              value={server.maxPlayers}
              onChange={(e) => setServer({ maxPlayers: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>Statut (fallback)</FieldLabel>
            <select
              className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
              value={server.status}
              onChange={(e) =>
                setServer({ status: e.target.value as ServerBlock["status"] })
              }
            >
              <option value="online">En ligne</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Hors ligne</option>
            </select>
          </div>
          <div>
            <FieldLabel>URL Cfx.re (bouton « rejoindre »)</FieldLabel>
            <Input
              className="mt-2"
              value={server.cfxJoinUrl ?? ""}
              onChange={(e) => setServer({ cfxJoinUrl: e.target.value || undefined })}
              placeholder="https://cfx.re/join/abcxyz"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Réseaux sociaux & boutique"
          subtitle="URLs utilisées dans le header, footer et boutons hero."
        />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>Discord URL</FieldLabel>
            <Input
              className="mt-2"
              value={config.social.discord}
              onChange={(e) =>
                setConfig({ ...config, social: { ...config.social, discord: e.target.value } })
              }
              placeholder="https://discord.gg/…"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Cfx.re URL (page serveur publique)</FieldLabel>
            <Input
              className="mt-2"
              value={config.social.cfx ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  social: { ...config.social, cfx: e.target.value || undefined },
                })
              }
              placeholder="https://servers.fivem.net/servers/detail/abcxyz"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Tebex URL</FieldLabel>
            <Input
              className="mt-2"
              value={config.social.tebex ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  social: { ...config.social, tebex: e.target.value || undefined },
                })
              }
              placeholder="https://votre-boutique.tebex.io"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
