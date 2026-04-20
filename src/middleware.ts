import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Exécute le middleware pour toute route non-API, non-statique, non-fichier.
   * Volontairement explicite : on ignore `api`, `_next`, `icons`, `images` et les fichiers avec extension.
   */
  matcher: ["/((?!api|_next|_vercel|brand|.*\\..*).*)"],
};
