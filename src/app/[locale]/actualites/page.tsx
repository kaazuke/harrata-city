"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";

const categories = ["all", "patch", "news", "event", "community"] as const;

export default function ActualitesPage() {
  const { config } = useSiteConfig();
  const [cat, setCat] = useState<(typeof categories)[number]>("all");

  const items = useMemo(() => {
    const sorted = [...config.articles].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (cat === "all") {
      return sorted;
    }
    return sorted.filter((a) => a.category === cat);
  }, [config.articles, cat]);

  return (
    <div>
      <PageHero
        eyebrow="Actualités"
        title="Patch notes, annonces, événements"
        subtitle="Catégories, mise en avant, et pages article prêtes pour un futur CMS."
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                c === cat
                  ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                  : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
              }`}
            >
              {c === "all" ? "Tout" : c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <Link key={a.slug} href={`/actualites/${a.slug}`}>
              <Card className="h-full transition hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))]">
                <CardBody>
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="primary">{a.category}</Badge>
                    {a.featured ? <Badge tone="accent">À la une</Badge> : null}
                    <span className="text-xs text-[var(--rp-muted)]">{a.date}</span>
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[var(--rp-fg)]">
                    {a.title}
                  </div>
                  <p className="mt-2 text-sm text-[var(--rp-muted)]">{a.excerpt}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
