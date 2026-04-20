"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/layout/PageHero";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Card } from "@/components/ui/Card";

type Cat = "all" | "screenshot" | "video" | "clip";

export default function GaleriePage() {
  const { config } = useLocalizedConfig();
  const t = useTranslations("gallery");
  const [cat, setCat] = useState<Cat>("all");

  const items = useMemo(() => {
    if (!config.modules.galleryFilters || cat === "all") {
      return config.gallery;
    }
    return config.gallery.filter((g) => g.category === cat);
  }, [cat, config.gallery, config.modules.galleryFilters]);

  const label = (c: Cat) => {
    if (c === "all") return t("all");
    return t(`categories.${c}` as "categories.screenshot" | "categories.video" | "categories.clip");
  };

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-7xl px-4 py-12">
        {config.modules.galleryFilters ? (
          <div className="flex flex-wrap gap-2">
            {(["all", "screenshot", "video", "clip"] as const).map((c) => (
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
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => {
            const inner = (
              <Card className="overflow-hidden">
                <div className="relative h-56 w-full">
                  <Image src={g.src} alt={g.title} fill className="object-cover" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-sm font-semibold text-white">{g.title}</div>
                    <div className="text-xs text-white/70">{label(g.category as Cat)}</div>
                  </div>
                </div>
              </Card>
            );
            return g.href ? (
              <a key={g.id} href={g.href} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div key={g.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
