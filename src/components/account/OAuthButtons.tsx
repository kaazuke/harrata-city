"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

const linkBase =
  "inline-flex w-full items-center justify-center gap-2 rounded-[var(--rp-radius)] border px-4 py-2.5 text-sm font-semibold transition";

const styles: Record<string, string> = {
  discord:
    "border-[#5865F2]/40 bg-[#5865F2]/15 text-[var(--rp-fg)] hover:bg-[#5865F2]/25 hover:border-[#5865F2]/60",
  steam:
    "border-[#66c0f4]/40 bg-[#1b2838]/40 text-[var(--rp-fg)] hover:bg-[#1b2838]/60 hover:border-[#66c0f4]/60",
};

function buildUrl(provider: "discord" | "steam", from: string): string {
  const params = new URLSearchParams();
  params.set("returnTo", from);
  return `/api/auth/${provider}?${params.toString()}`;
}

export function OAuthButtons(props: { intent?: "login" | "register" | "link" }) {
  return (
    <Suspense fallback={<div className="h-20" aria-hidden />}>
      <OAuthButtonsInner {...props} />
    </Suspense>
  );
}

function OAuthButtonsInner({
  intent = "login",
}: {
  intent?: "login" | "register" | "link";
}) {
  const { config } = useSiteConfig();
  const pathname = usePathname() ?? "/";
  const sp = useSearchParams();
  const from = useMemo(() => {
    const qs = sp?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, sp]);

  const showDiscord = config.integrations?.discordOAuth?.enabled ?? false;
  const showSteam = config.integrations?.steamOpenId?.enabled ?? false;

  if (!showDiscord && !showSteam) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-[11px] text-[var(--rp-muted)]">
        Connexion externe désactivée. Activez Discord ou Steam dans le panneau Admin → Intégrations
        (et configurez <span className="font-mono">AUTH_SECRET</span>,{" "}
        <span className="font-mono">DISCORD_CLIENT_ID</span>/<span className="font-mono">_SECRET</span>).
      </p>
    );
  }

  const verb =
    intent === "login" ? "Continuer avec" : intent === "register" ? "S’inscrire avec" : "Lier";

  return (
    <div className="space-y-2">
      {showDiscord ? (
        <a className={`${linkBase} ${styles.discord}`} href={buildUrl("discord", from)}>
          <DiscordIcon />
          {verb} Discord
        </a>
      ) : null}
      {showSteam ? (
        <a className={`${linkBase} ${styles.steam}`} href={buildUrl("steam", from)}>
          <SteamIcon />
          {verb} FiveM (Steam)
        </a>
      ) : null}
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.62 12.62 0 0 0-.617-1.25.07.07 0 0 0-.073-.034c-1.71.295-3.345.81-4.885 1.515a.063.063 0 0 0-.03.025C.533 9.045-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.99 3.027.07.07 0 0 0 .076-.026c.461-.63.872-1.295 1.225-1.994a.07.07 0 0 0-.038-.098 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.372-.291a.07.07 0 0 1 .073-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .073.01c.12.099.246.197.372.291a.07.07 0 0 1-.006.117 12.3 12.3 0 0 1-1.873.892.07.07 0 0 0-.038.098c.36.699.772 1.364 1.225 1.994a.07.07 0 0 0 .076.026 19.9 19.9 0 0 0 6-3.027.07.07 0 0 0 .031-.056c.5-5.177-.838-9.674-3.548-13.663a.06.06 0 0 0-.03-.025zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.957-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.957 2.418-2.157 2.418zm7.974 0c-1.184 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SteamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.55 2 2.05 6.32 2 11.74L7.18 13.9c.46-.32 1.01-.5 1.6-.5l.13.01 2.36-3.42v-.05a3.4 3.4 0 0 1 3.4-3.4 3.4 3.4 0 0 1 3.4 3.4 3.4 3.4 0 0 1-3.4 3.4h-.07l-3.36 2.4v.1a2.86 2.86 0 0 1-2.85 2.85c-1.4 0-2.58-.99-2.83-2.32L2 14.74C3.04 18.83 7.16 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM7.6 17.5l-1.18-.49a2.18 2.18 0 0 0 1.01.93c.97.4 2.07-.06 2.47-1.02.2-.46.2-.97.01-1.43-.2-.46-.56-.83-1.02-1.02a2.16 2.16 0 0 0-1.65 0l1.21.5a1.6 1.6 0 0 1 .87 2.1 1.6 1.6 0 0 1-1.72 1.43zm6.42-4.62a2.27 2.27 0 0 0 2.27-2.27 2.27 2.27 0 0 0-2.27-2.27 2.27 2.27 0 0 0-2.27 2.27 2.27 2.27 0 0 0 2.27 2.27z" />
    </svg>
  );
}
