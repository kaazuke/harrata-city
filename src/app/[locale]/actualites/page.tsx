"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";

const categories = ["all", "patch", "news", "event", "community"] as const;
type Category = (typeof categories)[number];

export default function ActualitesPage() {
  const { config } = useLocalizedConfig();
  const t = useTranslations("news");
  const [cat, setCat] = useState<Category>("all");

  const items = useMemo(() => {
    const sorted = [...config.articles].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (cat === "all") {
      return sorted;
    }
    return sorted.filter((a) => a.category === cat);
  }, [config.articles, cat]);

  const label = (c: Category) => {
    if (c === "all") return t("all");
    return t(`categories.${c}` as "categories.patch");
  };

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

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
              {label(c)}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <Link key={a.slug} href={`/actualites/${a.slug}`}>
              <Card className="h-full transition hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))]">
                <CardBody>
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="primary">{label(a.category as Category)}</Badge>
                    {a.featured ? <Badge tone="accent">{t("featured")}</Badge> : null}
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
