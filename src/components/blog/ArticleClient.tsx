"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { SimpleMarkdown } from "@/lib/simple-md";

export function ArticleClient({ slug }: { slug: string }) {
  const { config } = useSiteConfig();
  const article = useMemo(
    () => config.articles.find((a) => a.slug === slug),
    [config.articles, slug],
  );

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-[var(--rp-fg)]">Article introuvable</h1>
        <p className="mt-2 text-sm text-[var(--rp-muted)]">
          Ce slug n existe pas dans la configuration actuelle.
        </p>
        <Link className="mt-6 inline-block text-sm font-semibold text-[var(--rp-primary)]" href="/actualites">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero eyebrow={article.category} title={article.title} subtitle={article.excerpt} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{article.date}</Badge>
          {article.featured ? <Badge tone="accent">À la une</Badge> : null}
        </div>

        <Card className="mt-8">
          <CardBody>
            <SimpleMarkdown text={article.bodyMarkdown} />
          </CardBody>
        </Card>

        <div className="mt-10">
          <Link className="text-sm font-semibold text-[var(--rp-primary)] hover:underline" href="/actualites">
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  );
}
