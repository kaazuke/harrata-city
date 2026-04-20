/**
 * Liens publics Tebex (pas d’API clé requise).
 * Pour panier headless / checkout serveur : voir Tebex API (clé privée côté serveur uniquement).
 */

export function normalizeTebexBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

/** URL d’un package Tebex (format web classique). */
export function tebexPackageUrl(storeBaseUrl: string, packageId: string | number) {
  const base = normalizeTebexBaseUrl(storeBaseUrl);
  return `${base}/package/${packageId}`;
}

/** URL d’accueil boutique */
export function tebexStoreUrl(storeBaseUrl: string) {
  return normalizeTebexBaseUrl(storeBaseUrl);
}
