"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

interface BannerSettings {
  message?: string;
  color?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  dismissible?: boolean;
}

const DISMISS_KEY = "ext:welcome-banner:dismissed-at";

export function WelcomeBannerExtension() {
  const { config } = useSiteConfig();
  const t = useTranslations("welcomeBanner");
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      setDismissedFor(localStorage.getItem(DISMISS_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  if (!hydrated) return null;
  if (!isExtensionEnabled(config, "welcome-banner")) return null;

  const ext = getExtension(config, "welcome-banner");
  const settings = (ext?.settings ?? {}) as BannerSettings;
  const message = settings.message?.trim() || t("defaultMessage");
  if (settings.dismissible !== false && dismissedFor === ext?.installedAt) return null;

  const color = settings.color?.trim() || "#7aa2f7";
  const ctaLabel = settings.ctaLabel?.trim();
  const ctaUrl = settings.ctaUrl?.trim();
  const showCta = ctaLabel && ctaUrl;
  const isDismissible = settings.dismissible !== false;

  function dismiss() {
    const stamp = ext?.installedAt ?? "1";
    setDismissedFor(stamp);
    try {
      localStorage.setItem(DISMISS_KEY, stamp);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="relative z-30 flex flex-wrap items-center justify-center gap-3 border-b px-4 py-2.5 text-center text-xs sm:text-sm"
      style={{
        borderColor: `color-mix(in oklab, ${color} 35%, var(--rp-border))`,
        background: `linear-gradient(90deg, color-mix(in oklab, ${color} 18%, transparent), color-mix(in oklab, ${color} 6%, transparent))`,
        color: "var(--rp-fg)",
      }}
    >
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: `color-mix(in oklab, ${color} 25%, transparent)`,
          color,
        }}
      >
        {t("extension")}
      </span>
      <span className="text-balance">{message}</span>
      {showCta ? (
        <a
          href={ctaUrl}
          target={ctaUrl.startsWith("http") ? "_blank" : undefined}
          rel={ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          className="rounded-full px-3 py-1 text-[11px] font-semibold transition hover:brightness-110"
          style={{ background: color, color: "#041016" }}
        >
          {ctaLabel}
        </a>
      ) : null}
      {isDismissible ? (
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("close")}
          className="ml-1 rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[10px] text-[var(--rp-muted)] hover:bg-black/40 hover:text-[var(--rp-fg)]"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
