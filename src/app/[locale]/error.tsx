"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-[var(--rp-fg,#e8edf7)]">
        Une erreur a bloqué l affichage
      </h1>
      <p className="text-sm text-[var(--rp-muted,#94a3b8)]">
        {error.message || "Erreur inconnue"}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-teal-400/90 px-4 py-2 text-sm font-semibold text-black"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-[var(--rp-fg,#e8edf7)]"
        >
          Accueil
        </Link>
      </div>
      <p className="text-xs text-[var(--rp-muted,#94a3b8)]">
        Si vous aviez personnalisé le site dans l admin : essayez de vider le
        stockage local du site (F12 → Application → Local Storage → supprimer{" "}
        <span className="font-mono">rp-site-config-full</span>) puis rechargez.
      </p>
    </div>
  );
}
