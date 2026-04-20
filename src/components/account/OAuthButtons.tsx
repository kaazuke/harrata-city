"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("authOAuth");
  const pathname = usePathname() ?? "/";
  const sp = useSearchParams();
  const from = useMemo(() => {
    const qs = sp?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, sp]);

  const showDiscord = config.integrations?.discordOAuth?.enabled ?? false;
  const showSteam = config.integrations?.steamOpenId?.enabled ?? false;

  const lineKey =
    intent === "login" ? "lineLogin" : intent === "register" ? "lineRegister" : "lineLink";

  if (!showDiscord && !showSteam) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-[11px] text-[var(--rp-muted)]">
        {t("externalDisabled")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {showDiscord ? (
        <a className={`${linkBase} ${styles.discord}`} href={buildUrl("discord", from)}>
          <DiscordIcon />
          {t(lineKey, { provider: t("providerDiscord") })}
        </a>
      ) : null}
      {showSteam ? (
        <a className={`${linkBase} ${styles.steam}`} href={buildUrl("steam", from)}>
          <SteamIcon />
          {t(lineKey, { provider: t("providerSteam") })}
        </a>
      ) : null}
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SteamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 1-9.95 9h7.07l1.29-1.29a2.5 2.5 0 0 1 3.54 0L16.5 12H22A10 10 0 0 1 12 2zm0 4a6 6 0 1 0 6 6h-2.09l-1.71-1.71a.5.5 0 0 0-.7 0L12 12h-2a6 6 0 0 0-6-6z" />
    </svg>
  );
}
