"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const GITHUB_URL = "https://github.com/kaazuke/harrata-city";

type Feature = { title: string; description: string };

export function HubOpenSourceClient() {
  const t = useTranslations("hubOpenSource");
  const locale = useLocale();
  const features = t.raw("features") as Feature[];
  const stackItems = t.raw("stackItems") as string[];
  const audienceItems = t.raw("audienceItems") as string[];

  const shareUrl = useMemo(() => {
    const base =
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
      "https://fivem-rp-community.vercel.app";
    try {
      const u = new URL(base);
      return `${u.origin}/${locale}/hub-open-source`;
    } catch {
      return `https://fivem-rp-community.vercel.app/${locale}/hub-open-source`;
    }
  }, [locale]);

  const [copied, setCopied] = useState(false);
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--rp-muted)]">{t("intro1")}</p>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--rp-muted)]">{t("intro2")}</p>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--rp-muted)]">{t("intro3")}</p>
        </div>

        <section className="space-y-6">
          <SectionHeader title={t("stackTitle")} description={t("stackDescription")} />
          <Card>
            <CardBody>
              <ul className="grid list-none gap-2 sm:grid-cols-2">
                {stackItems.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-sm text-[var(--rp-muted)] before:mt-1.5 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-[var(--rp-primary)]"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>

        <section className="space-y-6">
          <SectionHeader title={t("featuresTitle")} description={t("featuresDescription")} />
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title}>
                <CardBody>
                  <h3 className="font-heading text-lg font-semibold text-[var(--rp-fg)]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)]">{f.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader title={t("audienceTitle")} description={t("audienceDescription")} />
          <Card>
            <CardBody>
              <ul className="space-y-2">
                {audienceItems.map((line) => (
                  <li key={line} className="text-sm text-[var(--rp-muted)]">
                    {line}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>

        <section className="space-y-6">
          <SectionHeader title={t("selfHostTitle")} description={t("selfHostDescription")} />
          <Card>
            <CardBody>
              <p className="text-sm leading-relaxed text-[var(--rp-muted)]">{t("selfHostBody")}</p>
            </CardBody>
          </Card>
        </section>

        <section className="space-y-6">
          <SectionHeader title={t("linksTitle")} />
          <div className="flex flex-wrap gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--rp-radius)] border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--rp-fg)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,transparent)] hover:bg-white/[0.07]"
            >
              {t("githubLabel")}
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_40%,transparent)] bg-[color-mix(in_oklab,var(--rp-primary)_12%,transparent)] px-4 py-2.5 text-sm font-semibold text-[var(--rp-primary)] transition hover:bg-[color-mix(in_oklab,var(--rp-primary)_18%,transparent)]"
            >
              {t("demoLabel")}
            </Link>
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_25%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-surface)_88%,black)] p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--rp-fg)]">{t("forumShareTitle")}</h2>
          <p className="text-sm text-[var(--rp-muted)]">{t("forumShareDescription")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="block flex-1 overflow-x-auto rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-[var(--rp-primary)]">
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={() => void copyShare()}
              className="shrink-0 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-[var(--rp-fg)] transition hover:bg-white/10"
            >
              {copied ? t("copied") : t("copyLink")}
            </button>
          </div>
        </section>

        <section>
          <p className="text-xs leading-relaxed text-[var(--rp-muted)]">{t("legal")}</p>
        </section>
      </div>
    </div>
  );
}
