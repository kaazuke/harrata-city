"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AccountMenu } from "@/components/account/AccountMenu";
import { AuthBar } from "@/components/auth/AuthBar";
import { ThemeSwitcherExtension } from "@/components/extensions/ThemeSwitcherExtension";
import { NotificationBell } from "@/components/forum/NotificationBell";
import { useAccount } from "@/components/providers/AccountProvider";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { defaultSiteConfig } from "@/config/default-site";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const NAV_I18N_KEYS: Record<string, string> = {
  home: "home",
  presentation: "presentation",
  hubOpenSource: "hubOpenSource",
  reglement: "rules",
  candidatures: "applications",
  boutique: "shop",
  equipe: "team",
  actualites: "news",
  forum: "forum",
  galerie: "gallery",
  statistiques: "stats",
  contact: "contact",
};

export function SiteHeader() {
  const { config } = useLocalizedConfig();
  const { accounts, ready, hasPermission } = useAccount();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const showAdminLink = ready && (hasPermission("admin.access") || accounts.length === 0);

  const nav = useMemo(
    () =>
      config.nav.filter((n) => {
        if (!n.enabled) return false;
        if (n.href === "/forum" && !config.modules.forum) return false;
        return true;
      }),
    [config.nav, config.modules.forum],
  );
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;

  /** Retourne le libellé traduit s'il existe, sinon le label FR brut de config. */
  const navLabel = (id: string, fallback: string) => {
    const key = NAV_I18N_KEYS[id];
    if (!key) return fallback;
    try {
      return t(key);
    } catch {
      return fallback;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-bg)_82%,transparent)] shadow-[var(--rp-shadow-sm)] backdrop-blur-xl backdrop-saturate-150">
      <div
        className={`mx-auto flex w-full max-w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-3.5 ${
          config.theme.layout === "boxed" ? "max-w-6xl" : "max-w-7xl"
        }`}
      >
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-[var(--rp-radius)] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--rp-primary)]"
          onClick={() => setOpen(false)}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--rp-radius)] border border-white/12 bg-gradient-to-br from-[var(--rp-primary)]/30 to-[var(--rp-secondary)]/25 text-sm font-black tracking-tight text-[var(--rp-fg)] shadow-[var(--rp-shadow-sm)] transition duration-200 group-hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,transparent)] group-hover:shadow-[var(--rp-shadow-glow)]">
            {config.meta.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.meta.logoUrl}
                alt=""
                className="h-full w-full rounded-[var(--rp-radius)] object-cover"
              />
            ) : (
              config.meta.siteName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-heading text-sm font-semibold tracking-tight text-[var(--rp-fg)] sm:text-base">
              {config.meta.siteName}
            </div>
            <div className="truncate text-[11px] text-[var(--rp-muted)] sm:text-xs">
              {lc.headerTagline}
            </div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex lg:gap-3">
          <nav className="flex flex-wrap items-center justify-end gap-0.5" aria-label={t("mainNavigation")}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition duration-200 ${
                    active
                      ? "text-[var(--rp-fg)]"
                      : "text-[var(--rp-muted)] hover:bg-white/[0.06] hover:text-[var(--rp-fg)]"
                  }`}
                >
                  {navLabel(item.id, item.label)}
                  {active ? (
                    <span
                      className="absolute bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[var(--rp-primary)]"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
          <LanguageSwitcher />
          <Suspense fallback={null}>
            <AuthBar />
          </Suspense>
          {config.modules.forum ? <NotificationBell /> : null}
          <ThemeSwitcherExtension />
          <AccountMenu />
          {showAdminLink ? (
            <Link
              href="/admin"
              className="rounded-full border border-white/12 px-3 py-2 text-xs font-semibold text-[var(--rp-muted)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_40%,var(--rp-border))] hover:text-[var(--rp-fg)]"
            >
              {t("admin")}
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--rp-radius)] border border-white/12 text-[var(--rp-fg)] transition hover:bg-white/[0.06] lg:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
            aria-label={t("closeMenu")}
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-t border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-bg)_96%,black)] px-4 py-4 shadow-[var(--rp-shadow-md)] lg:hidden">
            <nav className="flex flex-col gap-1" aria-label={t("mobileNavigation")}>
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`rounded-[var(--rp-radius)] px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-white/10 text-[var(--rp-fg)]"
                        : "text-[var(--rp-muted)] hover:bg-white/[0.06] hover:text-[var(--rp-fg)]"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {navLabel(item.id, item.label)}
                  </Link>
                );
              })}
              {showAdminLink ? (
                <Link
                  href="/admin"
                  className="rounded-[var(--rp-radius)] px-4 py-3 text-sm text-[var(--rp-muted)] hover:bg-white/[0.06]"
                  onClick={() => setOpen(false)}
                >
                  {t("admin")}
                </Link>
              ) : null}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--rp-border)] pt-3">
                <LanguageSwitcher />
                <div className="flex items-center gap-2">
                  <AccountMenu />
                  {config.modules.forum ? <NotificationBell /> : null}
                </div>
                <Suspense>
                  <AuthBar />
                </Suspense>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
