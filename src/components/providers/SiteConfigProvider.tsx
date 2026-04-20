"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultSiteConfig } from "@/config/default-site";
import type { SiteConfig } from "@/config/types";
import { deepMerge } from "@/lib/merge";
import { sanitizeSiteConfig } from "@/lib/sanitize-site-config";

/** Clé actuelle — les anciennes (`rp-site-config-full`) sont migrées une fois au chargement. */
const STORAGE_KEY = "rp-site-config-v3";
const LEGACY_STORAGE_KEYS = ["rp-site-config-full"] as const;

type Actions = {
  setConfig: (next: SiteConfig) => void;
  resetConfig: () => void;
  /** Sauvegarde immédiate. Passez `next` pour éviter une closure périmée. */
  persist: (next?: SiteConfig) => void;
  importFromJson: (json: string) => { ok: true } | { ok: false; error: string };
  exportJson: () => string;
};

type Ctx = Actions & { config: SiteConfig };

const SiteConfigStateContext = createContext<SiteConfig | null>(null);
const SiteConfigActionsContext = createContext<Actions | null>(null);

function applyThemeCss(cfg: SiteConfig) {
  const root = document.documentElement;
  const t = cfg.theme ?? defaultSiteConfig.theme;
  const colors = t.colors ?? defaultSiteConfig.theme.colors;
  root.style.setProperty("--rp-primary", colors.primary);
  root.style.setProperty("--rp-secondary", colors.secondary);
  root.style.setProperty("--rp-accent", colors.accent);
  root.style.setProperty("--rp-bg", colors.background);
  root.style.setProperty("--rp-surface", colors.surface);
  root.style.setProperty("--rp-muted", colors.muted);
  root.style.setProperty("--rp-border", colors.border);
  root.style.setProperty("--rp-fg", colors.foreground);
  root.style.setProperty("--rp-danger", colors.danger);
  root.style.setProperty("--rp-success", colors.success);
  root.style.setProperty("--rp-hero-overlay", String(t.heroOverlayOpacity ?? 0.72));
  root.style.setProperty(
    "--rp-radius",
    t.radius === "sm" ? "10px" : t.radius === "lg" ? "22px" : "14px",
  );
  root.dataset.noise = t.noiseOverlay ? "on" : "off";
  root.dataset.layout = t.layout ?? "wide";

  const modeKey = t.mode ?? defaultSiteConfig.theme.mode;
  const mode =
    modeKey === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : modeKey;
  root.dataset.theme = mode;
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(defaultSiteConfig);
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<number | null>(null);
  const customSiteCss =
    (config.layoutCopy ?? defaultSiteConfig.layoutCopy).customCss?.trim() ?? "";

  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      let fromLegacy = false;
      if (!raw) {
        for (const old of LEGACY_STORAGE_KEYS) {
          const legacy = localStorage.getItem(old);
          if (legacy) {
            raw = legacy;
            fromLegacy = true;
            break;
          }
        }
      }
      if (!raw) {
        applyThemeCss(defaultSiteConfig);
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const merged = deepMerge(defaultSiteConfig, parsed);
      const { config: clean, changed } = sanitizeSiteConfig(merged);
      setConfigState(clean);
      applyThemeCss(clean);
      if (fromLegacy || changed || !localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
      for (const old of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(old);
      }
    } catch {
      applyThemeCss(defaultSiteConfig);
    } finally {
      setHydrated(true);
    }
  }, []);

  /** Auto-sauvegarde en localStorage à chaque modification (debounce 250 ms). */
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        /* quota exceeded ou storage indisponible */
      }
    }, 250);
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
    };
  }, [hydrated, config]);

  useEffect(() => {
    applyThemeCss(config);
  }, [config]);

  useEffect(() => {
    const id = "rp-custom-site-css";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!customSiteCss) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = customSiteCss;
  }, [customSiteCss]);

  useEffect(() => {
    return () => {
      document.getElementById("rp-custom-site-css")?.remove();
    };
  }, []);

  const setConfig = useCallback((next: SiteConfig) => {
    setConfigState(next);
  }, []);

  const resetConfig = useCallback(() => {
    setConfigState(defaultSiteConfig);
    localStorage.removeItem(STORAGE_KEY);
    applyThemeCss(defaultSiteConfig);
  }, []);

  const persist = useCallback(
    (next?: SiteConfig) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next ?? config));
      } catch {
        /* quota exceeded */
      }
    },
    [config],
  );

  const exportJson = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importFromJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as unknown;
      const merged = deepMerge(defaultSiteConfig, parsed);
      const { config: clean } = sanitizeSiteConfig(merged);
      setConfigState(clean);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      for (const old of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(old);
      }
      applyThemeCss(clean);
      return { ok: true as const };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "JSON invalide",
      };
    }
  }, []);

  const actions = useMemo<Actions>(
    () => ({ setConfig, resetConfig, persist, importFromJson, exportJson }),
    [setConfig, resetConfig, persist, importFromJson, exportJson],
  );

  return (
    <SiteConfigActionsContext.Provider value={actions}>
      <SiteConfigStateContext.Provider value={config}>
        {children}
      </SiteConfigStateContext.Provider>
    </SiteConfigActionsContext.Provider>
  );
}

/** Lecture seule de la config (re-render seulement quand la config change). */
export function useSiteConfigState(): SiteConfig {
  const ctx = useContext(SiteConfigStateContext);
  if (!ctx) {
    throw new Error("useSiteConfigState doit être utilisé dans SiteConfigProvider");
  }
  return ctx;
}

/** Setters stables (ne re-render jamais). */
export function useSiteConfigActions(): Actions {
  const ctx = useContext(SiteConfigActionsContext);
  if (!ctx) {
    throw new Error("useSiteConfigActions doit être utilisé dans SiteConfigProvider");
  }
  return ctx;
}

/** API rétro-compatible : combine state + actions. */
export function useSiteConfig(): Ctx {
  const config = useSiteConfigState();
  const actions = useSiteConfigActions();
  return useMemo(() => ({ config, ...actions }), [config, actions]);
}
