"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { SimpleMarkdown } from "@/lib/simple-md";

export function ArticleClient({ slug }: { slug: string }) {
  const { config } = useLocalizedConfig();
  const t = useTranslations("news");
  const article = useMemo(
    () => config.articles.find((a) => a.slug === slug),
    [config.articles, slug],
  );

  const categoryLabel = (id: string): string => {
    const known: Record<string, string> = {
      patch: t("categories.patch"),
      news: t("categories.news"),
      event: t("categories.event"),
      community: t("categories.community"),
    };
    return known[id] ?? id;
  };

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-[var(--rp-fg)]">{t("article.notFound")}</h1>
        <p className="mt-2 text-sm text-[var(--rp-muted)]">{t("article.notFoundHint")}</p>
        <Link
          className="mt-6 inline-block text-sm font-semibold text-[var(--rp-primary)]"
          href="/actualites"
        >
          {t("article.back")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={categoryLabel(article.category)}
        title={article.title}
        subtitle={article.excerpt}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{article.date}</Badge>
          {article.featured ? <Badge tone="accent">{t("article.featured")}</Badge> : null}
        </div>

        <Card className="mt-8">
          <CardBody>
            <SimpleMarkdown text={article.bodyMarkdown} />
          </CardBody>
        </Card>

        <div className="mt-10">
          <Link
            className="text-sm font-semibold text-[var(--rp-primary)] hover:underline"
            href="/actualites"
          >
            {t("article.backShort")}
          </Link>
        </div>
      </div>
    </div>
  );
}
