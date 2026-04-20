"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { contentEN } from "@/i18n/content-en";
import type { SiteConfig } from "@/config/types";
import { mergeLocalizedConfig } from "@/lib/i18n/merge-localized-config";

/**
 * Retourne la `SiteConfig` localisée selon la langue active.
 * - FR : configuration admin inchangée (pilotable depuis le panneau admin).
 * - EN : fusion avec `contentEN` (textes) — tableaux d'objets avec `id` / `slug`
 *   fusionnés entrée par entrée pour conserver URLs, médias, etc.
 */
export function useLocalizedConfig(): { config: SiteConfig } {
  const { config } = useSiteConfig();
  const locale = useLocale();

  const localized = useMemo(() => {
    if (locale !== "en") return config;
    return mergeLocalizedConfig(config, contentEN) as SiteConfig;
  }, [config, locale]);

  return { config: localized };
}
