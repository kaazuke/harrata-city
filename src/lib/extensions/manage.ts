import type { Extension, SiteConfig } from "@/config/types";
import type { ExtensionListing } from "@/lib/extensions/catalog";

/** Renvoie la liste d'extensions installées (jamais undefined). */
export function getExtensions(config: SiteConfig): Extension[] {
  return Array.isArray(config.extensions) ? config.extensions : [];
}

/** Récupère une extension installée par ID. */
export function getExtension(config: SiteConfig, id: string): Extension | null {
  return getExtensions(config).find((e) => e.id === id) ?? null;
}

/**
 * Vrai si l'extension est installée ET activée. Utilisé par le code consommateur
 * pour activer / désactiver une fonctionnalité conditionnellement.
 */
export function isExtensionEnabled(config: SiteConfig, id: string): boolean {
  const ext = getExtension(config, id);
  return !!ext && ext.enabled;
}

/** Vrai si l'extension est juste installée (peu importe son état activé). */
export function isExtensionInstalled(config: SiteConfig, id: string): boolean {
  return !!getExtension(config, id);
}

/** Installe (ou réinstalle) une extension à partir d'un listing du catalogue. */
export function installFromListing(
  config: SiteConfig,
  listing: ExtensionListing,
): SiteConfig {
  const list = getExtensions(config);
  const without = list.filter((e) => e.id !== listing.id);
  const ext: Extension = {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    version: listing.version,
    author: listing.author,
    iconUrl: listing.iconUrl,
    category: listing.category,
    enabled: true,
    installedAt: new Date().toISOString(),
    settings: { ...(listing.defaultSettings ?? {}) },
    source: "catalog",
  };
  return { ...config, extensions: [...without, ext] };
}

/** Installe une extension à partir d'un objet libre (import manuel JSON). */
export function installManual(
  config: SiteConfig,
  partial: Pick<Extension, "id" | "name" | "version"> & Partial<Extension>,
): { ok: true; config: SiteConfig } | { ok: false; error: string } {
  const id = partial.id?.trim();
  if (!id) return { ok: false, error: "Identifiant requis." };
  if (!/^[a-z0-9_-]{2,40}$/.test(id)) {
    return {
      ok: false,
      error: "Identifiant : 2 à 40 caractères [a-z0-9_-].",
    };
  }
  const list = getExtensions(config);
  const without = list.filter((e) => e.id !== id);
  const ext: Extension = {
    id,
    name: partial.name?.trim() || id,
    description: partial.description,
    version: partial.version?.trim() || "0.0.1",
    author: partial.author,
    iconUrl: partial.iconUrl,
    category: partial.category,
    enabled: partial.enabled ?? true,
    installedAt: new Date().toISOString(),
    settings: partial.settings ?? {},
    source: "manual",
  };
  return { ok: true, config: { ...config, extensions: [...without, ext] } };
}

export function uninstallExtension(config: SiteConfig, id: string): SiteConfig {
  const list = getExtensions(config).filter((e) => e.id !== id);
  return { ...config, extensions: list };
}

export function setExtensionEnabled(
  config: SiteConfig,
  id: string,
  enabled: boolean,
): SiteConfig {
  const list = getExtensions(config).map((e) =>
    e.id === id ? { ...e, enabled } : e,
  );
  return { ...config, extensions: list };
}

export function updateExtensionSettings(
  config: SiteConfig,
  id: string,
  settings: Record<string, unknown>,
): SiteConfig {
  const list = getExtensions(config).map((e) =>
    e.id === id ? { ...e, settings } : e,
  );
  return { ...config, extensions: list };
}
