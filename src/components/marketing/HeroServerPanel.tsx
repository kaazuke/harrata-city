"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { defaultSiteConfig } from "@/config/default-site";
import { Button } from "@/components/ui/Button";

type ServerStatus = "online" | "offline" | "maintenance";

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPulse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTerminal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m4 17 6-6-6-6M12 19h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroServerPanel({
  playersOnline,
  maxPlayers,
  status,
  ip,
  showPlayers,
  showStatus,
  showIp,
  copied,
  onCopyIp,
  liveMode,
  lastUpdatedAt,
  hostname,
}: {
  playersOnline: number;
  maxPlayers: number;
  status: ServerStatus;
  ip: string;
  showPlayers: boolean;
  showStatus: boolean;
  showIp: boolean;
  copied: boolean;
  onCopyIp: () => void;
  /** Mode live : indicateur visuel selon l’état du polling. */
  liveMode?: "live" | "fallback" | "loading" | "error";
  /** Timestamp de la dernière synchro réussie. */
  lastUpdatedAt?: number | null;
  /** Hostname retourné par Cfx.re (optionnel, affiché en sous-titre si présent). */
  hostname?: string | null;
}) {
  const { config } = useLocalizedConfig();
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
  const t = useTranslations("serverPanel");
  const locale = useLocale();

  const cap = Number(maxPlayers);
  const safeMax = Number.isFinite(cap) && cap > 0 ? cap : 0;
  const safeOnline = Number.isFinite(Number(playersOnline)) ? Math.max(0, Number(playersOnline)) : 0;
  const pct =
    safeMax > 0 ? Math.min(100, Math.round((safeOnline / safeMax) * 100)) : 0;

  const statusLabel =
    status === "online"
      ? lc.serverStatusOnline
      : status === "maintenance"
        ? lc.serverStatusMaintenance
        : lc.serverStatusOffline;

  const statusRing =
    status === "online"
      ? "border-[var(--rp-success)]/50 bg-[var(--rp-success)]/10 text-[var(--rp-success)]"
      : status === "maintenance"
        ? "border-[var(--rp-accent)]/50 bg-[var(--rp-accent)]/10 text-[var(--rp-accent)]"
        : "border-[var(--rp-danger)]/50 bg-[var(--rp-danger)]/10 text-[var(--rp-danger)]";

  const dotClass =
    status === "online"
      ? "bg-[var(--rp-success)] shadow-[0_0_14px_var(--rp-success)]"
      : status === "maintenance"
        ? "bg-[var(--rp-accent)]"
        : "bg-[var(--rp-danger)]";

  if (!showPlayers && !showStatus && !showIp) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            {lc.serverPanelTitle}
          </span>
          <span
            className="hidden h-4 w-px bg-white/15 sm:block"
            aria-hidden
          />
          <span className="truncate text-[11px] text-white/40">
            {hostname?.trim() || lc.serverPanelSubtitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {liveMode === "live" ? (
            <span
              className="flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--rp-success)_45%,transparent)] bg-[color-mix(in_oklab,var(--rp-success)_12%,transparent)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--rp-success)]"
              title={
                lastUpdatedAt
                  ? t("syncedAt", {
                      time: new Date(lastUpdatedAt).toLocaleTimeString(
                        locale === "en" ? "en-US" : "fr-FR",
                      ),
                    })
                  : t("syncedLive")
              }
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--rp-success)] opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--rp-success)]" />
              </span>
              {lc.serverLiveBadge}
            </span>
          ) : liveMode === "loading" ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
              {t("sync")}
            </span>
          ) : liveMode === "error" ? (
            <span
              className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,transparent)] bg-[color-mix(in_oklab,var(--rp-danger)_12%,transparent)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--rp-danger)]"
              title={t("apiUnreachable")}
            >
              {t("offlineApi")}
            </span>
          ) : status === "online" ? (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--rp-success)] opacity-40 motion-reduce:animate-none" />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
              </span>
              {lc.serverLiveBadge}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="rounded-2xl border border-white/[0.14] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        <div className="p-[1px]">
          <div className="flex flex-col divide-y divide-white/[0.08] rounded-[15px] bg-black/55 backdrop-blur-2xl">
            {showPlayers ? (
              <div className="relative flex min-w-0 flex-col gap-3 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-[var(--rp-primary)]">
                      <IconUsers className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                        {lc.serverColPlayers}
                      </p>
                      <p className="mt-0.5 break-words font-heading text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                        {safeOnline}
                        <span className="text-base font-medium text-white/45 sm:text-lg">
                          {" "}
                          / {safeMax > 0 ? safeMax : "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs font-semibold tabular-nums text-white/70">
                    {safeMax > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--rp-primary)] to-[color-mix(in_oklab,var(--rp-secondary)_70%,var(--rp-primary))] transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ) : null}

            {showStatus ? (
              <div className="flex min-w-0 flex-col justify-center gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
                    <IconPulse className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    {lc.serverColStatus}
                  </p>
                </div>
                <div
                  className={`inline-flex w-fit items-center gap-2.5 rounded-xl border px-3 py-2.5 ${statusRing}`}
                >
                  <span className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
                  <span className="font-heading text-base font-semibold tracking-tight">
                    {statusLabel}
                  </span>
                </div>
              </div>
            ) : null}

            {showIp ? (
              <div className="flex min-w-0 flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
                    <IconTerminal className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    {lc.serverColConnection}
                  </p>
                </div>
                <div className="min-w-0 rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5">
                  <p className="break-all font-mono text-[11px] leading-relaxed text-white/85 sm:text-xs">
                    {ip || "—"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shrink-0 border-white/20 text-white hover:border-white/35 hover:bg-white/[0.08]"
                  onClick={onCopyIp}
                >
                  {copied ? lc.serverCopiedButton : lc.serverCopyButton}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
