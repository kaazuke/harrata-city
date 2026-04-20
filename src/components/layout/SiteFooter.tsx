"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { defaultSiteConfig } from "@/config/default-site";

export function SiteFooter() {
  const { config } = useLocalizedConfig();
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
  const t = useTranslations("nav");
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto border-t border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_75%,black)]">
      <div
        className={`mx-auto grid w-full gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 ${
          config.theme.layout === "boxed" ? "max-w-6xl" : "max-w-7xl"
        }`}
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rp-primary)]">
            {lc.footerCommunityEyebrow}
          </p>
          <div className="mt-2 font-heading text-base font-semibold text-[var(--rp-fg)]">
            {config.meta.siteName}
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--rp-muted)]">
            {config.meta.description}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rp-muted)]">
            {lc.footerLinksEyebrow}
          </p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            {config.social.discord ? (
              <a
                className="text-[var(--rp-muted)] transition hover:text-[var(--rp-primary)]"
                href={config.social.discord}
              >
                {lc.footerDiscord}
              </a>
            ) : null}
            {config.social.cfx ? (
              <a
                className="text-[var(--rp-muted)] transition hover:text-[var(--rp-primary)]"
                href={config.social.cfx}
              >
                {lc.footerCfx}
              </a>
            ) : null}
            {config.social.tebex ? (
              <a
                className="text-[var(--rp-muted)] transition hover:text-[var(--rp-primary)]"
                href={config.social.tebex}
              >
                {lc.footerTebex}
              </a>
            ) : null}
            <Link
              className="text-[var(--rp-muted)] transition hover:text-[var(--rp-primary)]"
              href="/contact"
            >
              {lc.footerContactLink}
            </Link>
            {config.modules.forum ? (
              <Link
                className="text-[var(--rp-muted)] transition hover:text-[var(--rp-primary)]"
                href="/forum"
              >
                {t("forum")}
              </Link>
            ) : null}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rp-muted)]">
            {lc.footerLegalEyebrow}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-[var(--rp-muted)]">{lc.footerLegalBody}</p>
        </div>
      </div>
      <div className="border-t border-[var(--rp-border)] py-4 text-center text-[11px] text-[var(--rp-muted)]">
        © {year} {config.meta.siteName}
      </div>
    </footer>
  );
}
