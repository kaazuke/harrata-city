"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { contentEN } from "@/i18n/content-en";
import type { SiteConfig } from "@/config/types";

/**
 * Retourne la `SiteConfig` localisée selon la langue active.
 * - FR : configuration admin inchangée (pilotable depuis le panneau admin).
 * - EN : configuration admin fusionnée avec les overrides textuels `contentEN`.
 *   Les tableaux sont remplacés entièrement (items non comparables cross-locale).
 *   Les objets sont fusionnés récursivement. Les scalaires sont remplacés.
 */
export function useLocalizedConfig(): { config: SiteConfig } {
  const { config } = useSiteConfig();
  const locale = useLocale();

  const localized = useMemo(() => {
    if (locale !== "en") return config;
    return deepMerge(config, contentEN) as SiteConfig;
  }, [config, locale]);

  return { config: localized };
}

/* ----------------------------- deep merge util ----------------------------- */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(override)) return override as unknown as T;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
    }
    return out as T;
  }
  return override as T;
}
