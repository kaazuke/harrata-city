"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import type {
  Article,
  BoutiqueProduct,
  FaqItem,
  FeatureTile,
  GalleryItem,
  LoreSection,
  PresentationMedia,
  RuleCategory,
  StaffMember,
  StatCard,
} from "@/config/types";

type Section =
  | "presentation"
  | "stats"
  | "staff"
  | "rules"
  | "articles"
  | "boutique"
  | "gallery"
  | "faq"
  | "contact";

const SECTION_IDS: Section[] = [
  "presentation",
  "stats",
  "staff",
  "rules",
  "articles",
  "boutique",
  "gallery",
  "faq",
  "contact",
];

export function AdminContentTab() {
  const [section, setSection] = useState<Section>("presentation");
  const t = useTranslations("admin.content");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title={t("rootTitle")} subtitle={t("rootSubtitle")} />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {SECTION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  section === id
                    ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                    : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
                }`}
                title={t(`sections.${id}.hint` as "sections.presentation.hint")}
              >
                {t(`sections.${id}.label` as "sections.presentation.label")}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {section === "presentation" ? <PresentationEditor /> : null}
      {section === "stats" ? <StatsEditor /> : null}
      {section === "staff" ? <StaffEditor /> : null}
      {section === "rules" ? <RulesEditor /> : null}
      {section === "articles" ? <ArticlesEditor /> : null}
      {section === "boutique" ? <BoutiqueEditor /> : null}
      {section === "gallery" ? <GalleryEditor /> : null}
      {section === "faq" ? <FaqEditor /> : null}
      {section === "contact" ? <ContactEditor /> : null}
    </div>
  );
}

/* ─────────────── Helpers UI ─────────────── */

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-3">
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-[var(--rp-muted)]">{children}</label>;
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function moveItem<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const target = idx + dir;
  if (target < 0 || target >= arr.length) return arr;
  const next = arr.slice();
  const [it] = next.splice(idx, 1);
  next.splice(target, 0, it);
  return next;
}

function ItemControls({
  index,
  total,
  onUp,
  onDown,
  onDelete,
}: {
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("admin.content");
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onUp}
        disabled={index === 0}
        className="rounded border border-[var(--rp-border)] px-2 py-1 text-xs leading-none disabled:opacity-30"
        aria-label={t("moveUp")}
        title={t("moveUp")}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={index === total - 1}
        className="rounded border border-[var(--rp-border)] px-2 py-1 text-xs leading-none disabled:opacity-30"
        aria-label={t("moveDown")}
        title={t("moveDown")}
      >
        ↓
      </button>
      <Button
        type="button"
        variant="ghost"
        onClick={onDelete}
        className="px-2 py-1 text-[var(--rp-danger)]"
      >
        {t("deleteShort")}
      </Button>
    </div>
  );
}

/* ─────────────── Présentation ─────────────── */

const FEATURE_ICONS: FeatureTile["icon"][] = [
  "shield",
  "users",
  "economy",
  "map",
  "discord",
  "spark",
];

function PresentationEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const features = config.features ?? [];
  const lore = config.lore ?? [];
  const strengths = config.strengths ?? [];

  function setFeatures(next: FeatureTile[]) {
    setConfig({ ...config, features: next });
  }
  function setLore(next: LoreSection[]) {
    setConfig({ ...config, lore: next });
  }
  function setStrengths(next: string[]) {
    setConfig({ ...config, strengths: next });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={t("presentation.featuresTitle")}
          subtitle={t("presentation.featuresSubtitle")}
          actions={
            <Button
              onClick={() =>
                setFeatures([
                  ...features,
                  {
                    id: newId("f"),
                    title: tc("featureNewTitle"),
                    description: tc("featureNewDesc"),
                    icon: "spark",
                  },
                ])
              }
            >
              {tc("btnAdd")}
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {features.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{tc("noTiles")}</p>
          ) : (
            features.map((f, i) => (
              <Row key={f.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start">
                  <div className="grid flex-1 gap-2 md:grid-cols-3">
                    <Input
                      value={f.title}
                      onChange={(e) =>
                        setFeatures(
                          features.map((x) => (x.id === f.id ? { ...x, title: e.target.value } : x)),
                        )
                      }
                      placeholder={tc("phLabel")}
                    />
                    <select
                      className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                      value={f.icon}
                      onChange={(e) =>
                        setFeatures(
                          features.map((x) =>
                            x.id === f.id
                              ? { ...x, icon: e.target.value as FeatureTile["icon"] }
                              : x,
                          ),
                        )
                      }
                    >
                      {FEATURE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      className="md:col-span-3 min-h-[60px]"
                      value={f.description}
                      onChange={(e) =>
                        setFeatures(
                          features.map((x) =>
                            x.id === f.id ? { ...x, description: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder={tc("phDescription")}
                    />
                  </div>
                  <ItemControls
                    index={i}
                    total={features.length}
                    onUp={() => setFeatures(moveItem(features, i, -1))}
                    onDown={() => setFeatures(moveItem(features, i, 1))}
                    onDelete={() => setFeatures(features.filter((x) => x.id !== f.id))}
                  />
                </div>
              </Row>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("presentation.loreTitle")}
          subtitle={t("presentation.loreSubtitle")}
          actions={
            <Button
              onClick={() =>
                setLore([
                  ...lore,
                  { title: tc("loreNewTitle"), body: tc("loreNewBody") },
                ])
              }
            >
              {tc("btnAdd")}
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {lore.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{tc("noLore")}</p>
          ) : (
            lore.map((l, i) => (
              <Row key={`lore-${i}`}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start">
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      value={l.title}
                      onChange={(e) =>
                        setLore(lore.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                      }
                      placeholder={tc("loreChapterTitlePh")}
                    />
                    <Textarea
                      value={l.body}
                      onChange={(e) =>
                        setLore(lore.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))
                      }
                      placeholder={tc("loreChapterBodyPh")}
                    />
                  </div>
                  <ItemControls
                    index={i}
                    total={lore.length}
                    onUp={() => setLore(moveItem(lore, i, -1))}
                    onDown={() => setLore(moveItem(lore, i, 1))}
                    onDelete={() => setLore(lore.filter((_, j) => j !== i))}
                  />
                </div>
              </Row>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("presentation.strengthsTitle")}
          subtitle={t("presentation.strengthsSubtitle")}
          actions={
            <Button onClick={() => setStrengths([...strengths, tc("strengthNew")])}>
              {tc("btnAdd")}
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {strengths.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{tc("noStrengths")}</p>
          ) : (
            strengths.map((s, i) => (
              <div key={`str-${i}`} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={s}
                  onChange={(e) =>
                    setStrengths(strengths.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
                <ItemControls
                  index={i}
                  total={strengths.length}
                  onUp={() => setStrengths(moveItem(strengths, i, -1))}
                  onDown={() => setStrengths(moveItem(strengths, i, 1))}
                  onDelete={() => setStrengths(strengths.filter((_, j) => j !== i))}
                />
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("presentation.economyTitle")} subtitle={t("presentation.economySubtitle")} />
        <CardBody>
          <Textarea
            value={config.economyBlurb ?? ""}
            onChange={(e) => setConfig({ ...config, economyBlurb: e.target.value })}
            placeholder={tc("economyPlaceholder")}
          />
        </CardBody>
      </Card>

      <PresentationMediaEditor />
    </div>
  );
}

/* ─────────────── Médias de la page Présentation ─────────────── */

function mediaTypeHelp(tc: (k: string) => string, type: PresentationMedia["type"]): string {
  if (type === "image") return tc("mediaHelpImage");
  if (type === "video") return tc("mediaHelpVideo");
  return tc("mediaHelpYoutube");
}

function PresentationMediaEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const media = config.presentationMedia ?? [];

  function setMedia(next: PresentationMedia[]) {
    setConfig({ ...config, presentationMedia: next });
  }

  function add(type: PresentationMedia["type"]) {
    const sample: Record<PresentationMedia["type"], string> = {
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80",
      video: "",
      youtube: "",
    };
    const title =
      type === "youtube" || type === "video" ? tc("mediaNewVideoTitle") : tc("mediaNewTitle");
    setMedia([
      ...media,
      {
        id: newId("pm"),
        type,
        src: sample[type],
        title,
        caption: "",
      },
    ]);
  }

  function patch(id: string, p: Partial<PresentationMedia>) {
    setMedia(media.map((m) => (m.id === id ? { ...m, ...p } : m)));
  }

  return (
    <Card>
      <CardHeader
        title={t("presentation.mediaTitle")}
        subtitle={t("presentation.mediaSubtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => add("image")}>{tc("mediaAddImage")}</Button>
            <Button variant="outline" onClick={() => add("video")}>
              {tc("mediaAddVideo")}
            </Button>
            <Button variant="outline" onClick={() => add("youtube")}>
              {tc("mediaAddYoutube")}
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-3">
        {media.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("mediaEmpty")}</p>
        ) : (
          media.map((m, i) => (
            <Row key={m.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <MediaPreview item={m} />
                <div className="grid flex-1 gap-2 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <FieldLabel>{tc("mediaType")}</FieldLabel>
                    <select
                      className="mt-1 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                      value={m.type}
                      onChange={(e) =>
                        patch(m.id, { type: e.target.value as PresentationMedia["type"] })
                      }
                    >
                      <option value="image">{tc("mediaOptImage")}</option>
                      <option value="video">{tc("mediaOptVideoFile")}</option>
                      <option value="youtube">{tc("mediaOptYoutube")}</option>
                    </select>
                  </div>
                  <div className="md:col-span-9">
                    <FieldLabel>{tc("mediaTitleOptional")}</FieldLabel>
                    <Input
                      className="mt-1"
                      value={m.title ?? ""}
                      onChange={(e) => patch(m.id, { title: e.target.value })}
                      placeholder={tc("mediaShortTitle")}
                    />
                  </div>
                  <div className="md:col-span-12">
                    <FieldLabel>
                      {tc("mediaSource")} —{" "}
                      <span className="text-[var(--rp-muted)]">{mediaTypeHelp(tc, m.type)}</span>
                    </FieldLabel>
                    <Input
                      className="mt-1"
                      value={m.src}
                      onChange={(e) => patch(m.id, { src: e.target.value })}
                      placeholder={
                        m.type === "youtube"
                          ? tc("mediaPhYoutube")
                          : m.type === "video"
                            ? tc("mediaPhVideo")
                            : tc("mediaPhImage")
                      }
                    />
                  </div>
                  {m.type === "video" ? (
                    <div className="md:col-span-12">
                      <FieldLabel>{tc("mediaPoster")}</FieldLabel>
                      <Input
                        className="mt-1"
                        value={m.poster ?? ""}
                        onChange={(e) =>
                          patch(m.id, { poster: e.target.value || undefined })
                        }
                        placeholder={tc("mediaPosterPh")}
                      />
                    </div>
                  ) : null}
                  <div className="md:col-span-12">
                    <FieldLabel>{tc("mediaCaption")}</FieldLabel>
                    <Textarea
                      className="mt-1 min-h-[50px]"
                      value={m.caption ?? ""}
                      onChange={(e) => patch(m.id, { caption: e.target.value })}
                      placeholder={tc("mediaCaptionPh")}
                    />
                  </div>
                </div>
                <ItemControls
                  index={i}
                  total={media.length}
                  onUp={() => setMedia(moveItem(media, i, -1))}
                  onDown={() => setMedia(moveItem(media, i, 1))}
                  onDelete={() => setMedia(media.filter((x) => x.id !== m.id))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

function MediaPreview({ item }: { item: PresentationMedia }) {
  const tc = useTranslations("admin.content.chrome");
  const wrapper =
    "relative h-24 w-40 shrink-0 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/40";
  if (item.type === "youtube") {
    const id = ytId(item.src);
    if (!id) {
      return (
        <div className={wrapper}>
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--rp-muted)]">
            {tc("invalidYoutubeId")}
          </div>
        </div>
      );
    }
    return (
      <div className={wrapper}>
        <img
          // eslint-disable-next-line @next/next/no-img-element
          src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (item.type === "video") {
    return (
      <div className={wrapper}>
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--rp-muted)]">
            {tc("previewVideo")}
          </div>
        )}
      </div>
    );
  }
  // image
  return (
    <div className={wrapper}>
      {item.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--rp-muted)]">
          {tc("previewImage")}
        </div>
      )}
    </div>
  );
}

function ytId(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  try {
    const u = new URL(t);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace(/^\/+/, "") || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* ignore */
  }
  return null;
}

/* ─────────────── Statistiques ─────────────── */

function StatsEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const cards = config.statCards ?? [];
  const series = config.statSeries ?? [];

  function setCards(next: StatCard[]) {
    setConfig({ ...config, statCards: next });
  }
  function setSeries(next: { label: string; value: number }[]) {
    setConfig({ ...config, statSeries: next });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={t("stats.cardsTitle")}
          subtitle={t("stats.cardsSubtitle")}
          actions={
            <Button
              onClick={() =>
                setCards([
                  ...cards,
                  { id: newId("s"), label: tc("statNewLabel"), value: "0", hint: "" },
                ])
              }
            >
              {tc("btnAdd")}
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {cards.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{tc("noStatCards")}</p>
          ) : (
            cards.map((c, i) => (
              <Row key={c.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start">
                  <div className="grid flex-1 gap-2 md:grid-cols-4">
                    <Input
                      value={c.label}
                      onChange={(e) =>
                        setCards(cards.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)))
                      }
                      placeholder={tc("phLabel")}
                    />
                    <Input
                      value={c.value}
                      onChange={(e) =>
                        setCards(cards.map((x) => (x.id === c.id ? { ...x, value: e.target.value } : x)))
                      }
                      placeholder={tc("phValue")}
                    />
                    <Input
                      value={c.trend ?? ""}
                      onChange={(e) =>
                        setCards(
                          cards.map((x) =>
                            x.id === c.id ? { ...x, trend: e.target.value || undefined } : x,
                          ),
                        )
                      }
                      placeholder={tc("phTrend")}
                    />
                    <Input
                      value={c.hint ?? ""}
                      onChange={(e) =>
                        setCards(
                          cards.map((x) =>
                            x.id === c.id ? { ...x, hint: e.target.value || undefined } : x,
                          ),
                        )
                      }
                      placeholder={tc("phHintOptional")}
                    />
                  </div>
                  <ItemControls
                    index={i}
                    total={cards.length}
                    onUp={() => setCards(moveItem(cards, i, -1))}
                    onDown={() => setCards(moveItem(cards, i, 1))}
                    onDelete={() => setCards(cards.filter((x) => x.id !== c.id))}
                  />
                </div>
              </Row>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("stats.seriesTitle")}
          subtitle={t("stats.seriesSubtitle")}
          actions={
            <Button onClick={() => setSeries([...series, { label: tc("seriesNewLabel"), value: 0 }])}>
              {tc("btnAdd")}
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {series.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{tc("noStatSeries")}</p>
          ) : (
            series.map((p, i) => (
              <div key={`series-${i}`} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={p.label}
                  onChange={(e) =>
                    setSeries(series.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder={tc("phSeriesLabel")}
                />
                <Input
                  className="w-32"
                  type="number"
                  value={p.value}
                  onChange={(e) =>
                    setSeries(
                      series.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)),
                    )
                  }
                  placeholder={tc("phSeriesValue")}
                />
                <ItemControls
                  index={i}
                  total={series.length}
                  onUp={() => setSeries(moveItem(series, i, -1))}
                  onDown={() => setSeries(moveItem(series, i, 1))}
                  onDelete={() => setSeries(series.filter((_, j) => j !== i))}
                />
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/* ─────────────── Équipe ─────────────── */

const STAFF_TIERS: StaffMember["tier"][] = ["founder", "admin", "mod", "dev", "support"];

function StaffEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const staff = config.staff ?? [];

  function setStaff(next: StaffMember[]) {
    setConfig({ ...config, staff: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("staff.title")}
        subtitle={t("staff.subtitle")}
        actions={
          <Button
            onClick={() =>
              setStaff([
                ...staff,
                {
                  id: newId("st"),
                  name: tc("staffNewName"),
                  role: tc("staffNewRole"),
                  tier: "mod",
                  bio: tc("staffNewBio"),
                  avatarUrl: "",
                },
              ])
            }
          >
            {tc("btnAdd")}
          </Button>
        }
      />
      <CardBody className="space-y-2">
        {staff.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("staffEmpty")}</p>
        ) : (
          staff.map((m, i) => (
            <Row key={m.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start">
                <div className="grid flex-1 gap-2 md:grid-cols-4">
                  <Input
                    value={m.name}
                    onChange={(e) =>
                      setStaff(staff.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder={tc("phName")}
                  />
                  <Input
                    value={m.role}
                    onChange={(e) =>
                      setStaff(staff.map((x) => (x.id === m.id ? { ...x, role: e.target.value } : x)))
                    }
                    placeholder={tc("phRoleLabel")}
                  />
                  <select
                    className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                    value={m.tier}
                    onChange={(e) =>
                      setStaff(
                        staff.map((x) =>
                          x.id === m.id ? { ...x, tier: e.target.value as StaffMember["tier"] } : x,
                        ),
                      )
                    }
                  >
                    {STAFF_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={m.avatarUrl ?? ""}
                    onChange={(e) =>
                      setStaff(
                        staff.map((x) =>
                          x.id === m.id ? { ...x, avatarUrl: e.target.value || undefined } : x,
                        ),
                      )
                    }
                    placeholder={tc("phAvatarUrl")}
                  />
                  <Textarea
                    className="md:col-span-4 min-h-[60px]"
                    value={m.bio}
                    onChange={(e) =>
                      setStaff(staff.map((x) => (x.id === m.id ? { ...x, bio: e.target.value } : x)))
                    }
                    placeholder={tc("phBioShort")}
                  />
                </div>
                <ItemControls
                  index={i}
                  total={staff.length}
                  onUp={() => setStaff(moveItem(staff, i, -1))}
                  onDown={() => setStaff(moveItem(staff, i, 1))}
                  onDelete={() => setStaff(staff.filter((x) => x.id !== m.id))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── Règlement ─────────────── */

function RulesEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const rules = config.rules ?? [];

  function setRules(next: RuleCategory[]) {
    setConfig({ ...config, rules: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("rules.title")}
        subtitle={t("rules.subtitle")}
        actions={
          <Button
            onClick={() =>
              setRules([
                ...rules,
                { id: newId("r"), title: tc("rulesNewCatTitle"), items: [tc("rulesFirstRule")] },
              ])
            }
          >
            {tc("btnCategory")}
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("rulesEmpty")}</p>
        ) : (
          rules.map((cat, i) => (
            <Row key={cat.id}>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      value={cat.title}
                      onChange={(e) =>
                        setRules(
                          rules.map((x) => (x.id === cat.id ? { ...x, title: e.target.value } : x)),
                        )
                      }
                      placeholder={tc("rulesCatTitlePh")}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setRules(
                          rules.map((x) =>
                            x.id === cat.id ? { ...x, items: [...x.items, tc("rulesNewRule")] } : x,
                          ),
                        )
                      }
                    >
                      {tc("btnRule")}
                    </Button>
                  </div>
                  {cat.items.map((it, j) => (
                    <div key={`${cat.id}-${j}`} className="flex items-center gap-2">
                      <span className="w-6 text-right text-xs text-[var(--rp-muted)]">{j + 1}.</span>
                      <Input
                        className="flex-1"
                        value={it}
                        onChange={(e) =>
                          setRules(
                            rules.map((x) =>
                              x.id === cat.id
                                ? {
                                    ...x,
                                    items: x.items.map((y, k) => (k === j ? e.target.value : y)),
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="rounded border border-[var(--rp-border)] px-2 py-1 text-xs text-[var(--rp-danger)]"
                        onClick={() =>
                          setRules(
                            rules.map((x) =>
                              x.id === cat.id
                                ? { ...x, items: x.items.filter((_, k) => k !== j) }
                                : x,
                            ),
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <ItemControls
                  index={i}
                  total={rules.length}
                  onUp={() => setRules(moveItem(rules, i, -1))}
                  onDown={() => setRules(moveItem(rules, i, 1))}
                  onDelete={() => setRules(rules.filter((x) => x.id !== cat.id))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── Articles / Actualités ─────────────── */

const ARTICLE_CATEGORIES: Article["category"][] = ["patch", "news", "event", "community"];

function ArticlesEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const articles = config.articles ?? [];

  function setArticles(next: Article[]) {
    setConfig({ ...config, articles: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("articles.title")}
        subtitle={t("articles.subtitle")}
        actions={
          <Button
            onClick={() =>
              setArticles([
                {
                  slug: `${tc("articleSlugPrefix")}-${Date.now().toString(36)}`,
                  title: tc("articleNewTitle"),
                  excerpt: tc("articleNewExcerpt"),
                  date: new Date().toISOString().slice(0, 10),
                  category: "news",
                  bodyMarkdown: tc("articleNewBody"),
                },
                ...articles,
              ])
            }
          >
            {tc("btnArticle")}
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("articlesEmpty")}</p>
        ) : (
          articles.map((a, i) => (
            <Row key={a.slug}>
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 md:grid-cols-12">
                  <Input
                    className="md:col-span-5"
                    value={a.title}
                    onChange={(e) =>
                      setArticles(
                        articles.map((x) => (x.slug === a.slug ? { ...x, title: e.target.value } : x)),
                      )
                    }
                    placeholder={tc("phTitle")}
                  />
                  <Input
                    className="md:col-span-3"
                    value={a.slug}
                    onChange={(e) => {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      setArticles(
                        articles.map((x, j) => (j === i ? { ...x, slug: slug || a.slug } : x)),
                      );
                    }}
                    placeholder="slug-url"
                  />
                  <Input
                    className="md:col-span-2"
                    type="date"
                    value={a.date}
                    onChange={(e) =>
                      setArticles(
                        articles.map((x) => (x.slug === a.slug ? { ...x, date: e.target.value } : x)),
                      )
                    }
                  />
                  <select
                    className="md:col-span-2 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                    value={a.category}
                    onChange={(e) =>
                      setArticles(
                        articles.map((x) =>
                          x.slug === a.slug
                            ? { ...x, category: e.target.value as Article["category"] }
                            : x,
                        ),
                      )
                    }
                  >
                    {ARTICLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    className="md:col-span-12 min-h-[60px]"
                    value={a.excerpt}
                    onChange={(e) =>
                      setArticles(
                        articles.map((x) =>
                          x.slug === a.slug ? { ...x, excerpt: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder={tc("phExcerpt")}
                  />
                  <Textarea
                    className="md:col-span-12 min-h-[140px] font-mono text-xs"
                    value={a.bodyMarkdown}
                    onChange={(e) =>
                      setArticles(
                        articles.map((x) =>
                          x.slug === a.slug ? { ...x, bodyMarkdown: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder={tc("phMarkdown")}
                  />
                  <label className="md:col-span-12 inline-flex items-center gap-2 text-xs text-[var(--rp-muted)]">
                    <input
                      type="checkbox"
                      checked={!!a.featured}
                      onChange={(e) =>
                        setArticles(
                          articles.map((x) =>
                            x.slug === a.slug ? { ...x, featured: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                    {tc("featuredLabel")}
                  </label>
                </div>
                <ItemControls
                  index={i}
                  total={articles.length}
                  onUp={() => setArticles(moveItem(articles, i, -1))}
                  onDown={() => setArticles(moveItem(articles, i, 1))}
                  onDelete={() => setArticles(articles.filter((x) => x.slug !== a.slug))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── Boutique ─────────────── */

const BOUTIQUE_BADGES: NonNullable<BoutiqueProduct["badge"]>[] = [
  "vip",
  "new",
  "promo",
  "limited",
];

function BoutiqueEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const products = config.boutiqueProducts ?? [];

  function setProducts(next: BoutiqueProduct[]) {
    setConfig({ ...config, boutiqueProducts: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("boutique.title")}
        subtitle={t("boutique.subtitle")}
        actions={
          <Button
            onClick={() =>
              setProducts([
                ...products,
                {
                  id: newId("p"),
                  title: tc("boutiqueNewTitle"),
                  description: tc("boutiqueNewDesc"),
                  priceLabel: tc("boutiqueDefaultPrice"),
                  perks: [tc("boutiquePerk1"), tc("boutiquePerk2")],
                },
              ])
            }
          >
            {tc("btnProduct")}
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("boutiqueNoProducts")}</p>
        ) : (
          products.map((p, i) => (
            <Row key={p.id}>
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 md:grid-cols-12">
                  <Input
                    className="md:col-span-5"
                    value={p.title}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x)),
                      )
                    }
                    placeholder={tc("phTitle")}
                  />
                  <Input
                    className="md:col-span-3"
                    value={p.priceLabel}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) =>
                          x.id === p.id ? { ...x, priceLabel: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder={tc("phPrice")}
                  />
                  <select
                    className="md:col-span-2 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                    value={p.badge ?? ""}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) =>
                          x.id === p.id
                            ? {
                                ...x,
                                badge: e.target.value
                                  ? (e.target.value as BoutiqueProduct["badge"])
                                  : undefined,
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="">{tc("badgeNone")}</option>
                    {BOUTIQUE_BADGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="md:col-span-2"
                    value={p.tebexPackageId ?? ""}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) =>
                          x.id === p.id
                            ? { ...x, tebexPackageId: e.target.value || undefined }
                            : x,
                        ),
                      )
                    }
                    placeholder={tc("phTebexPkg")}
                  />
                  <Input
                    className="md:col-span-12"
                    value={p.tebexUrl ?? ""}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) =>
                          x.id === p.id ? { ...x, tebexUrl: e.target.value || undefined } : x,
                        ),
                      )
                    }
                    placeholder={tc("phTebex")}
                  />
                  <Textarea
                    className="md:col-span-12 min-h-[60px]"
                    value={p.description}
                    onChange={(e) =>
                      setProducts(
                        products.map((x) =>
                          x.id === p.id ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder={tc("phDescription")}
                  />
                  <div className="md:col-span-12">
                    <FieldLabel>{tc("perksLabel")}</FieldLabel>
                    <Textarea
                      className="mt-1 min-h-[80px]"
                      value={p.perks.join("\n")}
                      onChange={(e) =>
                        setProducts(
                          products.map((x) =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  perks: e.target.value
                                    .split("\n")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
                <ItemControls
                  index={i}
                  total={products.length}
                  onUp={() => setProducts(moveItem(products, i, -1))}
                  onDown={() => setProducts(moveItem(products, i, 1))}
                  onDelete={() => setProducts(products.filter((x) => x.id !== p.id))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── Galerie ─────────────── */

const GALLERY_CATEGORIES: GalleryItem["category"][] = ["screenshot", "video", "clip"];

function GalleryEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const gallery = config.gallery ?? [];

  function setGallery(next: GalleryItem[]) {
    setConfig({ ...config, gallery: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("gallery.title")}
        subtitle={t("gallery.subtitle")}
        actions={
          <Button
            onClick={() =>
              setGallery([
                ...gallery,
                {
                  id: newId("g"),
                  title: tc("galleryNewTitle"),
                  src: tc("galleryDefaultSrc"),
                  category: "screenshot",
                },
              ])
            }
          >
            {tc("btnMedia")}
          </Button>
        }
      />
      <CardBody className="space-y-2">
        {gallery.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("galleryEmpty")}</p>
        ) : (
          gallery.map((g, i) => (
            <Row key={g.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start">
                <div className="grid flex-1 gap-2 md:grid-cols-12">
                  <Input
                    className="md:col-span-4"
                    value={g.title}
                    onChange={(e) =>
                      setGallery(
                        gallery.map((x) => (x.id === g.id ? { ...x, title: e.target.value } : x)),
                      )
                    }
                    placeholder={tc("phTitle")}
                  />
                  <select
                    className="md:col-span-2 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2 text-sm text-[var(--rp-fg)]"
                    value={g.category}
                    onChange={(e) =>
                      setGallery(
                        gallery.map((x) =>
                          x.id === g.id
                            ? { ...x, category: e.target.value as GalleryItem["category"] }
                            : x,
                        ),
                      )
                    }
                  >
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="md:col-span-6"
                    value={g.src}
                    onChange={(e) =>
                      setGallery(
                        gallery.map((x) => (x.id === g.id ? { ...x, src: e.target.value } : x)),
                      )
                    }
                    placeholder={tc("galleryMediaUrlPh")}
                  />
                  <Input
                    className="md:col-span-12"
                    value={g.href ?? ""}
                    onChange={(e) =>
                      setGallery(
                        gallery.map((x) =>
                          x.id === g.id ? { ...x, href: e.target.value || undefined } : x,
                        ),
                      )
                    }
                    placeholder={tc("galleryExternalUrlPh")}
                  />
                </div>
                <ItemControls
                  index={i}
                  total={gallery.length}
                  onUp={() => setGallery(moveItem(gallery, i, -1))}
                  onDown={() => setGallery(moveItem(gallery, i, 1))}
                  onDelete={() => setGallery(gallery.filter((x) => x.id !== g.id))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── FAQ ─────────────── */

function FaqEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const faq = config.faq ?? [];

  function setFaq(next: FaqItem[]) {
    setConfig({ ...config, faq: next });
  }

  return (
    <Card>
      <CardHeader
        title={t("faq.title")}
        subtitle={t("faq.subtitle")}
        actions={
          <Button
            onClick={() =>
              setFaq([
                ...faq,
                { question: tc("faqNewQ"), answer: tc("faqNewA") },
              ])
            }
          >
            {tc("btnQuestion")}
          </Button>
        }
      />
      <CardBody className="space-y-2">
        {faq.length === 0 ? (
          <p className="text-sm text-[var(--rp-muted)]">{tc("faqNoQuestions")}</p>
        ) : (
          faq.map((q, i) => (
            <Row key={`faq-${i}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      setFaq(faq.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))
                    }
                    placeholder={tc("phQuestion")}
                  />
                  <Textarea
                    value={q.answer}
                    onChange={(e) =>
                      setFaq(faq.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))
                    }
                    placeholder={tc("phAnswer")}
                  />
                </div>
                <ItemControls
                  index={i}
                  total={faq.length}
                  onUp={() => setFaq(moveItem(faq, i, -1))}
                  onDown={() => setFaq(moveItem(faq, i, 1))}
                  onDelete={() => setFaq(faq.filter((_, j) => j !== i))}
                />
              </div>
            </Row>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────────── Contact ─────────────── */

function ContactEditor() {
  const { config, setConfig } = useSiteConfig();
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.content.chrome");
  const contact = config.contact ?? {};

  return (
    <Card>
      <CardHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />
      <CardBody className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>{tc("contactSupportEmail")}</FieldLabel>
          <Input
            className="mt-2"
            type="email"
            value={contact.supportEmail ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                contact: { ...contact, supportEmail: e.target.value || undefined },
              })
            }
            placeholder={tc("contactEmailPh")}
          />
        </div>
        <div>
          <FieldLabel>{tc("contactDiscordRoom")}</FieldLabel>
          <Input
            className="mt-2"
            value={contact.ticketDiscordChannel ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                contact: { ...contact, ticketDiscordChannel: e.target.value || undefined },
              })
            }
            placeholder={tc("phDiscordChannel")}
          />
        </div>
      </CardBody>
    </Card>
  );
}
