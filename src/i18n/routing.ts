import { defineRouting } from "next-intl/routing";

/**
 * Configuration de routage i18n pour Harrata City.
 * - `fr` : langue par défaut, URLs sans préfixe (ex: `/presentation`).
 * - `en` : URLs préfixées (ex: `/en/presentation`).
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
