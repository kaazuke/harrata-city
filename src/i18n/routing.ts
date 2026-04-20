import { defineRouting } from "next-intl/routing";

/**
 * Configuration de routage i18n pour Harrata City.
 * - `localePrefix: "always"` → toutes les URLs ont un préfixe explicite (`/fr/...`, `/en/...`).
 *   Évite de repasser en anglais parce qu’une URL sans préfixe était interprétée à tort.
 * - Cookie de locale : 1 an, pour garder le choix FR|EN entre les visites.
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "always",
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});

export type Locale = (typeof routing.locales)[number];
