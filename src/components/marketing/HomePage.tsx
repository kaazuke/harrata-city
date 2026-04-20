"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { defaultSiteConfig } from "@/config/default-site";
import { FeatureIcon } from "@/components/icons/FeatureIcons";

type FeatureIconName = "shield" | "users" | "economy" | "map" | "discord" | "spark";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { HeroServerPanel } from "@/components/marketing/HeroServerPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLiveServer } from "@/lib/server/useLiveServer";

type FeatureItem = { id: string; icon: string; title: string; description: string };

export function HomePage() {
  const { config } = useSiteConfig();
  const [copied, setCopied] = useState(false);
  const live = useLiveServer();
  const locale = useLocale();
  const t = useTranslations("home");

  const heroSrc = config.theme?.heroBackground?.trim() || defaultSiteConfig.theme.heroBackground;
  const heroOverlay = config.theme?.heroOverlayOpacity ?? defaultSiteConfig.theme.heroOverlayOpacity;

  const featured = useMemo(() => {
    const articles = Array.isArray(config.articles) ? config.articles : [];
    return articles.filter((a) => a.featured).slice(0, 2);
  }, [config.articles]);

  const statCards = Array.isArray(config.statCards) ? config.statCards : [];
  const forumTopics = Array.isArray(config.forumTopics)
    ? config.forumTopics
    : defaultSiteConfig.forumTopics;
  const forumCategories = Array.isArray(config.forumCategories)
    ? config.forumCategories
    : defaultSiteConfig.forumCategories;

  /**
   * Features : en FR on laisse l'admin piloter (config.features) ;
   * en EN on utilise la traduction statique depuis messages/en.json.
   */
  const features: FeatureItem[] =
    locale === "fr"
      ? (Array.isArray(config.features) ? config.features : []).map((f) => ({
          id: f.id,
          icon: f.icon,
          title: f.title,
          description: f.description,
        }))
      : (t.raw("features") as FeatureItem[]);

  /** Idem pour textes hero : config en FR (admin-editable), messages en EN. */
  const heroTitle = locale === "fr" ? config.meta.siteName : t("hero.title");
  const heroTagline = locale === "fr" ? config.meta.slogan : t("hero.tagline");
  const heroDescription = locale === "fr" ? config.meta.description : t("hero.description");

  async function copyIp() {
    try {
      await navigator.clipboard.writeText(config.server?.ip ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroSrc}
            alt=""
            fill
            priority
            className="scale-105 object-cover motion-reduce:scale-100"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[var(--rp-bg)]" style={{ opacity: heroOverlay }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(255,255,255,0.12), transparent 55%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:pb-24 sm:pt-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-14">
            <div className="max-w-3xl min-w-0 flex-1">
              <Badge tone="primary">{t("hero.badge")}</Badge>
              <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-[3.25rem]">
                {heroTitle}
              </h1>
              <p className="mt-4 text-lg leading-snug text-white/85 sm:text-xl">{heroTagline}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                {heroDescription}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {config.social.cfx ? (
                  <a href={config.social.cfx} target="_blank" rel="noreferrer" className="sm:w-auto">
                    <Button type="button" className="w-full min-w-[11rem] sm:w-auto">
                      {t("hero.ctaJoin")}
                    </Button>
                  </a>
                ) : (
                  <Button type="button" className="w-full sm:w-auto">
                    {t("hero.ctaJoinAlt")}
                  </Button>
                )}
                {config.social.discord ? (
                  <a href={config.social.discord} target="_blank" rel="noreferrer" className="sm:w-auto">
                    <Button type="button" variant="ghost" className="w-full sm:w-auto">
                      {t("hero.ctaDiscord")}
                    </Button>
                  </a>
                ) : null}
                {config.modules.forum ? (
                  <Link href="/forum" className="sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-white/25 bg-white/[0.06] text-white hover:bg-white/12 sm:w-auto"
                    >
                      {t("hero.ctaForum")}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="w-full min-w-0 max-w-lg shrink-0 self-end lg:self-start lg:max-w-md xl:max-w-lg lg:pt-1">
              <HeroServerPanel
                playersOnline={live.playersOnline}
                maxPlayers={live.maxPlayers}
                status={live.status}
                ip={config.server?.ip ?? ""}
                showPlayers={!!config.modules.playerCounter}
                showStatus={!!config.modules.serverStatus}
                showIp={!!config.modules.ipCopy}
                copied={copied}
                onCopyIp={copyIp}
                liveMode={live.mode}
                lastUpdatedAt={live.updatedAt}
                hostname={live.hostname}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <SectionHeader
          title={t("why.title")}
          description={t("why.description")}
          action={{ href: "/presentation", label: t("why.cta") }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.id} interactive>
              <CardBody className="flex h-full flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_28%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_10%,transparent)] text-[var(--rp-primary)]">
                  <FeatureIcon name={f.icon as FeatureIconName} className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-heading text-sm font-semibold text-[var(--rp-fg)]">
                    {f.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)]">
                    {f.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {config.modules.forum ? (
        <section className="border-t border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_45%,black)] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title={t("forum.title")}
              description={t("forum.description")}
              action={{ href: "/forum", label: t("forum.cta") }}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Card className="border-[color-mix(in_oklab,var(--rp-primary)_22%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_6%,transparent)]">
                <CardBody>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-primary)]">
                    {t("forum.categories")}
                  </div>
                  <div className="mt-2 font-heading text-3xl font-semibold tabular-nums text-[var(--rp-fg)]">
                    {forumCategories.length}
                  </div>
                </CardBody>
              </Card>
              <Card className="border-[color-mix(in_oklab,var(--rp-primary)_22%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_6%,transparent)]">
                <CardBody>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-primary)]">
                    {t("forum.topics")}
                  </div>
                  <div className="mt-2 font-heading text-3xl font-semibold tabular-nums text-[var(--rp-fg)]">
                    {forumTopics.length}
                  </div>
                </CardBody>
              </Card>
              <Link href="/forum" className="block h-full sm:col-span-1">
                <Card interactive className="h-full">
                  <CardBody className="flex h-full min-h-[8.5rem] flex-col justify-center">
                    <p className="text-sm font-semibold text-[var(--rp-fg)]">
                      {t("forum.joinDiscussion")}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)]">
                      {t("forum.joinDiscussionDescription")}
                    </p>
                    <span className="mt-4 text-xs font-semibold text-[var(--rp-primary)]">
                      {t("forum.cta")}
                    </span>
                  </CardBody>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {config.modules.newsHighlight && featured.length ? (
        <section className="border-t border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_50%,black)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title={t("news.title")}
              action={{ href: "/actualites", label: t("news.seeAll") }}
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {featured.map((a) => (
                <Link key={a.slug} href={`/actualites/${a.slug}`} className="block h-full">
                  <Card interactive className="h-full">
                    <CardBody>
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone="accent">{a.category}</Badge>
                        <time className="text-xs tabular-nums text-[var(--rp-muted)]" dateTime={a.date}>
                          {a.date}
                        </time>
                      </div>
                      <div className="mt-3 font-heading text-lg font-semibold leading-snug text-[var(--rp-fg)]">
                        {a.title}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--rp-muted)]">
                        {a.excerpt}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.modules.statsPreview ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <SectionHeader
            title={t("stats.title")}
            description={t("stats.description")}
            action={{ href: "/statistiques", label: t("stats.cta") }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s) => (
              <Card key={s.id} interactive>
                <CardBody>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                    {s.label}
                  </div>
                  <div className="mt-2 font-heading text-2xl font-semibold tabular-nums text-[var(--rp-fg)]">
                    {s.value}
                  </div>
                  {s.hint ? (
                    <div className="mt-2 text-xs leading-relaxed text-[var(--rp-muted)]">{s.hint}</div>
                  ) : null}
                  {s.trend ? (
                    <div className="mt-2 text-xs font-semibold text-[var(--rp-success)]">{s.trend}</div>
                  ) : null}
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
