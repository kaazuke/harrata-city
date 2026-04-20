"use client";

import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { defaultSiteConfig } from "@/config/default-site";
import type { Announcement, LayoutCopy } from "@/config/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

const ROW_KEYS: { key: keyof LayoutCopy; multiline?: boolean }[] = [
  { key: "headerTagline" },
  { key: "announcementBadge" },
  { key: "homeHeroBadge" },
  { key: "homeJoinCfx" },
  { key: "homeJoinNoLink" },
  { key: "homeDiscord" },
  { key: "homeSectionWhyTitle" },
  { key: "homeSectionWhyDesc", multiline: true },
  { key: "homeWhyCta" },
  { key: "homeNewsTitle" },
  { key: "homeNewsCta" },
  { key: "homeStatsTitle" },
  { key: "homeStatsDesc", multiline: true },
  { key: "homeStatsCta" },
  { key: "homeForumTitle" },
  { key: "homeForumDesc", multiline: true },
  { key: "homeForumCta" },
  { key: "homeForumHeroLabel" },
  { key: "serverPanelTitle" },
  { key: "serverPanelSubtitle" },
  { key: "serverLiveBadge" },
  { key: "serverColPlayers" },
  { key: "serverColStatus" },
  { key: "serverColConnection" },
  { key: "serverCopyButton" },
  { key: "serverCopiedButton" },
  { key: "serverStatusOnline" },
  { key: "serverStatusMaintenance" },
  { key: "serverStatusOffline" },
  { key: "footerCommunityEyebrow" },
  { key: "footerLinksEyebrow" },
  { key: "footerLegalEyebrow" },
  { key: "footerLegalBody", multiline: true },
  { key: "footerContactLink" },
  { key: "footerDiscord" },
  { key: "footerCfx" },
  { key: "footerTebex" },
  { key: "customCss", multiline: true },
];

export function AdminLayoutCopyTab() {
  const t = useTranslations("admin.layoutCopy");
  const { config, setConfig } = useSiteConfig();
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
  const announcements = config.announcements ?? [];

  function setField<K extends keyof LayoutCopy>(key: K, value: LayoutCopy[K]) {
    const base = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
    setConfig({
      ...config,
      layoutCopy: { ...base, [key]: value },
    });
  }

  function setAnnouncements(next: Announcement[]) {
    setConfig({ ...config, announcements: next });
  }

  function addAnnouncement() {
    const id = `a${Date.now().toString(36)}`;
    setAnnouncements([
      ...announcements,
      { id, text: t("newAnnouncementDefault"), active: true },
    ]);
  }

  function updateAnnouncement(id: string, patch: Partial<Announcement>) {
    setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAnnouncement(id: string) {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  }

  function moveAnnouncement(id: string, dir: -1 | 1) {
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= announcements.length) return;
    const next = announcements.slice();
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setAnnouncements(next);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={t("announcementsTitle")}
          subtitle={t("announcementsSubtitle")}
          actions={<Button onClick={addAnnouncement}>{t("add")}</Button>}
        />
        <CardBody className="space-y-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{t("noAnnouncements")}</p>
          ) : (
            announcements.map((a, i) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex flex-col gap-1 text-[10px] text-[var(--rp-muted)] sm:w-12">
                  <span className="font-mono">#{i + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(a.id, -1)}
                      disabled={i === 0}
                      className="rounded border border-[var(--rp-border)] px-1 leading-none disabled:opacity-30"
                      aria-label={t("moveUpAria")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(a.id, 1)}
                      disabled={i === announcements.length - 1}
                      className="rounded border border-[var(--rp-border)] px-1 leading-none disabled:opacity-30"
                      aria-label={t("moveDownAria")}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <Input
                  className="flex-1"
                  value={a.text}
                  onChange={(e) => updateAnnouncement(a.id, { text: e.target.value })}
                  placeholder={t("announcementPlaceholder")}
                />
                <label className="inline-flex items-center gap-2 text-xs text-[var(--rp-muted)]">
                  <input
                    type="checkbox"
                    checked={a.active}
                    onChange={(e) => updateAnnouncement(a.id, { active: e.target.checked })}
                  />
                  {t("active")}
                </label>
                <Button
                  variant="ghost"
                  onClick={() => removeAnnouncement(a.id)}
                  className="text-[var(--rp-danger)]"
                >
                  {t("removeShort")}
                </Button>
              </div>
            ))
          )}
          <p className="pt-1 text-[11px] text-[var(--rp-muted)]">{t("announceTip")}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("textCssTitle")} subtitle={t("textCssSubtitle")} />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {ROW_KEYS.map(({ key, multiline }) => (
            <div key={key} className={multiline ? "md:col-span-2" : undefined}>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">
                {t(`rows.${key}`)}
              </label>
              {multiline ? (
                <Textarea
                  className={`mt-2 font-mono text-xs ${key === "customCss" ? "min-h-[10rem]" : "min-h-[4rem]"}`}
                  value={lc[key] as string}
                  onChange={(e) => setField(key, e.target.value as LayoutCopy[typeof key])}
                />
              ) : (
                <Input
                  className="mt-2"
                  value={lc[key] as string}
                  onChange={(e) => setField(key, e.target.value as LayoutCopy[typeof key])}
                />
              )}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
