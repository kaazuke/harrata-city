import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Avec `localePrefix: "always"`, la locale est dans l’URL (`/fr/...`, `/en/...`).
 * localeDetection: true → sur `/` sans locale, on utilise d’abord le cookie (choix FR|EN),
 * puis Accept-Language. Les navigations internes restent sur l’URL courante.
 */
export default createMiddleware({
  ...routing,
  localeDetection: true,
});

export const config = {
  /**
   * Exécute le middleware pour toute route non-API, non-statique, non-fichier.
   * Volontairement explicite : on ignore `api`, `_next`, `icons`, `images` et les fichiers avec extension.
   */
  matcher: ["/((?!api|_next|_vercel|brand|.*\\..*).*)"],
};
