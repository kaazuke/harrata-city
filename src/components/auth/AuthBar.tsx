"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

type Me = SessionUser | null;

const authErrors: Record<string, string> = {
  discord_missing_env: "Discord OAuth : variables d environnement manquantes.",
  discord_state: "Connexion Discord annulée ou session invalide.",
  discord_error: "Échec de la connexion Discord.",
  steam_invalid: "Réponse Steam OpenID invalide.",
  steam_id: "Impossible de lire l identifiant Steam.",
  steam_mode: "Retour Steam inattendu.",
  steam_error: "Erreur Steam OpenID.",
  missing_auth_secret: "AUTH_SECRET manquant sur le serveur.",
};

export function AuthBar() {
  const { config } = useSiteConfig();
  const sp = useSearchParams();
  const [me, setMe] = useState<Me | undefined>(undefined);

  const showDiscord = config.integrations?.discordOAuth?.enabled ?? false;
  const showSteam = config.integrations?.steamOpenId?.enabled ?? false;

  const refresh = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json() as Promise<{ user: Me }>)
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, sp]);

  const authParam = sp.get("auth");
  const errMsg = useMemo(() => {
    if (!authParam || authParam === "ok") {
      return null;
    }
    return authErrors[authParam] ?? `Authentification : ${authParam}`;
  }, [authParam]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setMe(null);
    window.location.href = "/";
  }

  if (!showDiscord && !showSteam) {
    return errMsg ? (
      <div className="rounded-full border border-[var(--rp-danger)]/30 bg-[var(--rp-danger)]/10 px-3 py-1 text-xs text-[var(--rp-danger)]">
        {errMsg}
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {errMsg && authParam !== "ok" ? (
        <div className="max-w-xs rounded-md border border-[var(--rp-danger)]/30 bg-[var(--rp-danger)]/10 px-2 py-1 text-[10px] text-[var(--rp-danger)]">
          {errMsg}
        </div>
      ) : null}
      {authParam === "ok" ? (
        <div className="text-[10px] font-semibold text-[var(--rp-success)]">Connecté</div>
      ) : null}

      {me === undefined ? (
        <span className="text-xs text-[var(--rp-muted)]">…</span>
      ) : me ? (
        <div className="flex items-center gap-2">
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatar} alt="" className="h-7 w-7 rounded-full border border-white/10" />
          ) : null}
          <span className="max-w-[120px] truncate text-xs text-[var(--rp-fg)]">{me.username}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-[var(--rp-muted)] hover:border-[var(--rp-primary)]/40 hover:text-[var(--rp-fg)]"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {showDiscord ? (
            <Link
              href="/api/auth/discord"
              className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-[var(--rp-muted)] hover:border-[#5865F2]/50 hover:text-[var(--rp-fg)]"
            >
              Discord
            </Link>
          ) : null}
          {showSteam ? (
            <Link
              href="/api/auth/steam"
              className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-[var(--rp-muted)] hover:border-[#66c0f4]/50 hover:text-[var(--rp-fg)]"
            >
              Steam
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
