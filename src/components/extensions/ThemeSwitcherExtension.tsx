"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";
import type { SiteTheme } from "@/config/types";

interface ThemePreset {
  id: string;
  name: string;
  emoji?: string;
  colors: Partial<SiteTheme["colors"]>;
}

interface ThemeSwitcherSettings {
  presets?: ThemePreset[];
  currentPresetId?: string;
}

const DEFAULT_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    colors: {
      primary: "#7aa2f7",
      secondary: "#bb9af7",
      accent: "#7dcfff",
      background: "#0a0e17",
      surface: "#1a1f2e",
      foreground: "#e6e9ef",
    },
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    colors: {
      primary: "#00ffaa",
      secondary: "#ff00ff",
      accent: "#ffff00",
      background: "#0a0014",
      surface: "#1a0028",
      foreground: "#ffffff",
    },
  },
  {
    id: "sakura",
    name: "Sakura",
    emoji: "🌸",
    colors: {
      primary: "#ff6b9d",
      secondary: "#c084fc",
      accent: "#fbbf24",
      background: "#1a0a14",
      surface: "#2a1525",
      foreground: "#fef3f2",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    colors: {
      primary: "#ff8c42",
      secondary: "#ff3864",
      accent: "#ffd166",
      background: "#1a0f0a",
      surface: "#2a1810",
      foreground: "#fff5eb",
    },
  },
  {
    id: "mint",
    name: "Mint",
    emoji: "🌿",
    colors: {
      primary: "#52e3a3",
      secondary: "#4ecdc4",
      accent: "#95e1d3",
      background: "#0a1814",
      surface: "#15281f",
      foreground: "#ecfdf5",
    },
  },
];

export function ThemeSwitcherExtension() {
  const { config, setConfig, persist } = useSiteConfig();
  const t = useTranslations("themeSwitcher");
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const enabled = isExtensionEnabled(config, "theme-presets");
  const ext = getExtension(config, "theme-presets");
  const settings = (ext?.settings ?? {}) as ThemeSwitcherSettings;
  const presets = settings.presets?.length ? settings.presets : DEFAULT_PRESETS;
  const currentId = settings.currentPresetId;

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!hydrated || !enabled) return null;

  function applyPreset(preset: ThemePreset) {
    const next = {
      ...config,
      theme: {
        ...config.theme,
        colors: { ...config.theme.colors, ...preset.colors },
      },
      extensions: (config.extensions ?? []).map((e) =>
        e.id === "theme-presets"
          ? { ...e, settings: { ...e.settings, currentPresetId: preset.id } }
          : e,
      ),
    };
    setConfig(next);
    persist(next);
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-[var(--rp-fg)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_40%,var(--rp-border))]"
        aria-label={t("ariaLabel")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden>🎨</span>
        <span className="hidden sm:inline">{t("label")}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[var(--rp-surface)] shadow-2xl backdrop-blur"
        >
          <div className="border-b border-[var(--rp-border)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
              {t("presets")}
            </p>
          </div>
          <ul className="max-h-[320px] overflow-y-auto p-1">
            {presets.map((p) => {
              const active = p.id === currentId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`flex w-full items-center gap-2.5 rounded-[var(--rp-radius)] px-2.5 py-2 text-left text-xs transition ${
                      active
                        ? "bg-white/10 text-[var(--rp-fg)]"
                        : "text-[var(--rp-muted)] hover:bg-white/5 hover:text-[var(--rp-fg)]"
                    }`}
                  >
                    <span className="text-base" aria-hidden>
                      {p.emoji || "🎨"}
                    </span>
                    <span className="flex-1 font-medium">{p.name}</span>
                    <span className="flex gap-0.5">
                      {(["primary", "secondary", "accent"] as const).map((k) => (
                        <span
                          key={k}
                          className="h-3 w-3 rounded-full border border-white/15"
                          style={{ background: p.colors[k] }}
                          aria-hidden
                        />
                      ))}
                    </span>
                    {active ? (
                      <span className="text-[var(--rp-success)]" aria-label={t("active")}>
                        ✓
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
