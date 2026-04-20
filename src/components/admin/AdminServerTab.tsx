"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.server");
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
        setProbe({ ok: false, message: t("probeNeedInput") });
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
        <CardHeader title={t("liveTitle")} subtitle={t("liveSubtitle")} />
        <CardBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>{t("cfxCode")}</FieldLabel>
              <Input
                className="mt-2"
                value={server.cfxCode ?? ""}
                onChange={(e) =>
                  setServer({ cfxCode: e.target.value.trim().toLowerCase() || undefined })
                }
                placeholder="ex. abcxyz"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--rp-muted)]">
                {t("cfxHint")}
              </p>
            </div>
            <div>
              <FieldLabel>{t("playersUrl")}</FieldLabel>
              <Input
                className="mt-2"
                value={server.playersJsonUrl ?? ""}
                onChange={(e) => setServer({ playersJsonUrl: e.target.value.trim() || undefined })}
                placeholder="https://ip-publique:30120/players.json"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--rp-muted)]">
                {t("playersHint")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
              <span>
                <span className="block">{t("autoSync")}</span>
                <span className="mt-0.5 block text-[10px] text-[var(--rp-muted)]">
                  {t("autoSyncHint")}
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
              <FieldLabel>{t("refreshSec")}</FieldLabel>
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
                {probing ? t("testing") : t("testConnection")}
              </Button>
              {probe?.ok ? (
                <Button type="button" variant="outline" onClick={applyProbe}>
                  {t("apply")}
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
                      alt={t("serverIconAlt")}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-md border border-[var(--rp-border)] bg-black/30"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--rp-success)]">
                      {t("okTitle", { sources: (probe.source ?? []).join(", ") || "ok" })}
                    </div>
                    <div>
                      <span className="text-[var(--rp-muted)]">{t("hostname")}</span>{" "}
                      <span className="text-[var(--rp-fg)]">{probe.hostname ?? "—"}</span>
                    </div>
                    {probe.description ? (
                      <div>
                        <span className="text-[var(--rp-muted)]">{t("description")}</span>{" "}
                        <span className="text-[var(--rp-fg)]">{probe.description}</span>
                      </div>
                    ) : null}
                    <div>
                      <span className="text-[var(--rp-muted)]">{t("players")}</span>{" "}
                      <span className="text-[var(--rp-fg)]">
                        {probe.playersOnline ?? "?"} / {probe.maxPlayers ?? "?"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--rp-muted)]">{t("status")}</span>{" "}
                      <span className="text-[var(--rp-fg)]">{probe.status ?? "—"}</span>
                    </div>
                    {probe.serverVersion ? (
                      <div>
                        <span className="text-[var(--rp-muted)]">{t("version")}</span>{" "}
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
                        <span className="text-[var(--rp-muted)]">{t("endpoint")}</span>{" "}
                        <span className="font-mono text-[var(--rp-fg)]">{probe.endpoint}</span>
                      </div>
                    ) : null}
                    {probe.errors && Object.keys(probe.errors).length > 0 ? (
                      <div className="pt-1 text-[var(--rp-muted)]">
                        {t("warnings")}{" "}
                        {Object.entries(probe.errors)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--rp-danger)]">{t("failTitle")}</div>
                  <div>{probe.message || probe.error || t("failGeneric")}</div>
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
        <CardHeader title={t("fallbackTitle")} subtitle={t("fallbackSubtitle")} />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>{t("ipCmd")}</FieldLabel>
            <Input
              className="mt-2"
              value={server.ip}
              onChange={(e) => setServer({ ip: e.target.value })}
              placeholder="connect play.harrata-city.fr"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>{t("displayName")}</FieldLabel>
            <Input
              className="mt-2"
              value={server.displayName}
              onChange={(e) => setServer({ displayName: e.target.value })}
              placeholder="Harrata City — Public"
            />
          </div>
          <div>
            <FieldLabel>{t("playersFallback")}</FieldLabel>
            <Input
              className="mt-2"
              type="number"
              value={server.playersOnline}
              onChange={(e) => setServer({ playersOnline: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>{t("maxSlots")}</FieldLabel>
            <Input
              className="mt-2"
              type="number"
              value={server.maxPlayers}
              onChange={(e) => setServer({ maxPlayers: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>{t("statusFallback")}</FieldLabel>
            <select
              className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
              value={server.status}
              onChange={(e) =>
                setServer({ status: e.target.value as ServerBlock["status"] })
              }
            >
              <option value="online">{t("statusOnline")}</option>
              <option value="maintenance">{t("statusMaintenance")}</option>
              <option value="offline">{t("statusOffline")}</option>
            </select>
          </div>
          <div>
            <FieldLabel>{t("cfxJoinUrl")}</FieldLabel>
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
        <CardHeader title={t("socialTitle")} subtitle={t("socialSubtitle")} />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>{t("discordUrl")}</FieldLabel>
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
            <FieldLabel>{t("cfxUrl")}</FieldLabel>
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
            <FieldLabel>{t("tebexUrl")}</FieldLabel>
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
