"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Card, CardBody } from "@/components/ui/Card";
import type { PresentationMedia } from "@/config/types";

type LoreItem = { title: string; body: string };

export default function PresentationPage() {
  const { config } = useLocalizedConfig();
  const t = useTranslations("presentation");
  const media: PresentationMedia[] = config.presentationMedia ?? [];

  /** next-intl typed arrays : on récupère les listes via `raw` pour simplifier. */
  const loreItems = t.raw("lore") as LoreItem[];
  const strengths = t.raw("strengths") as string[];

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {loreItems.map((s) => (
            <Card key={s.title}>
              <CardBody>
                <h2 className="text-xl font-semibold text-[var(--rp-fg)]">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--rp-muted)]">{s.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-[var(--rp-fg)]">{t("strengthsTitle")}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--rp-muted)]">
                {strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-[var(--rp-fg)]">{t("economyTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--rp-muted)]">
                {t("economyBlurb")}
              </p>
              <div className="mt-6 text-sm font-semibold text-[var(--rp-primary)]">
                <Link href="/statistiques">{t("statsLink")}</Link>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--rp-fg)]">{t("mediaTitle")}</h2>
              <p className="mt-2 text-sm text-[var(--rp-muted)]">{t("mediaDescription")}</p>
            </div>
            <Link
              href="/galerie"
              className="text-sm font-semibold text-[var(--rp-primary)] hover:underline"
            >
              {t("mediaOpenGallery")}
            </Link>
          </div>

          {media.length === 0 ? (
            <p className="mt-8 rounded-[var(--rp-radius)] border border-dashed border-[var(--rp-border)] bg-black/15 px-6 py-8 text-center text-sm text-[var(--rp-muted)]">
              {t("mediaEmpty")}
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((m) => (
                <MediaCard key={m.id} item={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Carte média (image / vidéo / YouTube) ─────────────── */

function MediaCard({ item }: { item: PresentationMedia }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-black/40">
        <MediaPlayer item={item} />
      </div>
      {item.title || item.caption ? (
        <CardBody>
          {item.title ? (
            <div className="text-sm font-semibold text-[var(--rp-fg)]">{item.title}</div>
          ) : null}
          {item.caption ? (
            <div className="mt-1 text-xs text-[var(--rp-muted)]">{item.caption}</div>
          ) : null}
        </CardBody>
      ) : null}
    </Card>
  );
}

function youTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\/+/, "") || null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const m = url.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* ignore */
  }
  return null;
}

function MediaPlayer({ item }: { item: PresentationMedia }) {
  const t = useTranslations("presentation");
  if (item.type === "youtube") {
    const id = youTubeId(item.src);
    if (!id) return <BrokenMedia label={t("errorInvalidYoutube")} />;
    return (
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={item.title ?? t("youtubeVideo")}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        poster={item.poster}
        controls
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }
  if (!item.src) return <BrokenMedia label={t("missingUrl")} />;
  return (
    <Image
      src={item.src}
      alt={item.title ?? ""}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      unoptimized
    />
  );
}

function BrokenMedia({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--rp-muted)]">
      {label}
    </div>
  );
}
