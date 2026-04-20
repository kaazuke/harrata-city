"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "harrata:beta-banner-dismissed";

/**
 * Bandeau de bêta gratuite affiché en haut du site.
 * - Couleurs cohérentes avec la charte (turquoise → indigo).
 * - Dismissable par le visiteur (persistence localStorage).
 * - Ne clignote pas au chargement grâce à un rendu conditionnel après hydration.
 */
export function BetaBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* localStorage indisponible : on ignore */
    }
  }, []);

  if (!mounted || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="region"
      aria-label="Annonce bêta gratuite"
      className="relative isolate overflow-hidden border-b border-[color:var(--rp-border)]/70 bg-gradient-to-r from-[#5eead4]/15 via-[#818cf8]/15 to-[#f472b6]/15"
    >
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-8 left-10 h-24 w-24 rounded-full bg-[#5eead4]/30 blur-3xl" />
        <div className="absolute -bottom-8 right-10 h-24 w-24 rounded-full bg-[#818cf8]/30 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm sm:gap-4 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5eead4]/40 bg-[#5eead4]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#5eead4]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5eead4] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#5eead4]" />
          </span>
          Beta
        </span>

        <p className="flex-1 text-[13px] leading-tight text-[var(--rp-fg)] sm:text-sm">
          <span className="font-semibold text-white">Accès gratuit pendant la bêta.</span>{" "}
          <span className="text-[var(--rp-fg-muted)]">
            Rejoignez la whitelist, aucun achat requis, zéro pay-to-win.
          </span>
        </p>

        <a
          href="/candidatures"
          className="hidden shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10 sm:inline-flex"
        >
          Candidater →
        </a>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Masquer le bandeau bêta"
          className="shrink-0 rounded-full p-1 text-[var(--rp-fg-muted)] transition hover:bg-white/10 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
