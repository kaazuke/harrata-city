"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Avatar } from "@/components/account/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ForumLogAction, ForumLogEntry } from "@/config/types";
import type { Account } from "@/lib/account/types";
import { clearForumLogs, FORUM_ACTION_TONE } from "@/lib/forum-logs";
import { formatForumDate, formatForumRelative } from "@/lib/forum-mutate";

const FILTER_ORDER: ("all" | ForumLogAction)[] = [
  "all",
  "topic_created",
  "topic_deleted",
  "topic_edited",
  "topic_pinned",
  "topic_unpinned",
  "topic_locked",
  "topic_unlocked",
  "reply_created",
  "reply_deleted",
  "reply_edited",
];

export function AdminForumLogsTab() {
  const t = useTranslations("admin.forumLogs");
  const { config, setConfig, persist } = useSiteConfig();
  const { findByUsername } = useAccount();
  const [filter, setFilter] = useState<"all" | ForumLogAction>("all");
  const [search, setSearch] = useState("");

  const logs = useMemo<ForumLogEntry[]>(
    () => (Array.isArray(config.forumLogs) ? config.forumLogs : []),
    [config.forumLogs],
  );

  const topicCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const top of config.forumTopics ?? []) {
      map.set(top.id, top.categoryId);
    }
    return map;
  }, [config.forumTopics]);

  const resolveCategory = (topicId?: string) =>
    topicId ? topicCategoryMap.get(topicId) ?? null : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filter !== "all" && l.action !== filter) return false;
      if (!q) return true;
      const hay = [
        l.actor,
        l.targetAuthor ?? "",
        l.topicTitle ?? "",
        l.note ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [logs, filter, search]);

  function handleClear() {
    if (!confirm(t("clearConfirm"))) return;
    const next = clearForumLogs(config);
    setConfig(next);
    persist(next);
  }

  function downloadJson(filename: string, payload: unknown) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    downloadJson(
      `forum-logs-${new Date().toISOString().slice(0, 10)}.json`,
      filtered,
    );
  }

  function exportFullForum() {
    downloadJson(`forum-complet-${new Date().toISOString().slice(0, 10)}.json`, {
      version: 1,
      exportedAt: new Date().toISOString(),
      siteName: config.meta?.siteName,
      categories: config.forumCategories ?? [],
      topics: config.forumTopics ?? [],
      logs: config.forumLogs ?? [],
      notifications: config.forumNotifications ?? [],
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--rp-fg)]">{t("journalTitle")}</h2>
          <p className="mt-1 text-xs text-[var(--rp-muted)]">
            {t("journalSubtitle", { count: logs.length })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={exportFullForum}>
            {t("exportFull")}
          </Button>
          <Button type="button" variant="outline" onClick={exportJson} disabled={!filtered.length}>
            {t("exportFiltered")}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClear} disabled={!logs.length}>
            {t("clearBtn")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)]"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | ForumLogAction)}
        >
          {FILTER_ORDER.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? t("filterAll") : t(`filterLabels.${value}`)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-sm text-[var(--rp-muted)]">
          {logs.length ? t("noLogsFiltered") : t("noLogsYet")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)]">
          <ul className="divide-y divide-[var(--rp-border)]">
            {filtered.map((l) => (
              <LogRow
                key={l.id}
                log={l}
                actor={findByUsername(l.actor)}
                target={l.targetAuthor ? findByUsername(l.targetAuthor) : null}
                categoryId={resolveCategory(l.topicId)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LogRow({
  log,
  actor,
  target,
  categoryId,
}: {
  log: ForumLogEntry;
  actor: Account | null;
  target: Account | null;
  categoryId: string | null;
}) {
  const t = useTranslations("admin.forumLogs");
  const locale = useLocale();
  const topicHref =
    log.topicId && categoryId ? `/forum/${categoryId}/${log.topicId}` : null;
  return (
    <li className="grid gap-3 px-4 py-3 md:grid-cols-[auto_1fr_auto]">
      <Avatar account={actor} fallbackName={log.actor} size="sm" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={FORUM_ACTION_TONE[log.action]}>{t(`actionLabels.${log.action}`)}</Badge>
          <span className="text-sm font-semibold text-[var(--rp-fg)]">@{log.actor}</span>
          <span className="rounded-full border border-[var(--rp-border)] bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--rp-muted)]">
            {log.actorRole}
          </span>
          {target && log.targetAuthor && log.targetAuthor !== log.actor ? (
            <>
              <span className="text-[11px] text-[var(--rp-muted)]">→</span>
              <span className="text-xs text-[var(--rp-fg)]">@{log.targetAuthor}</span>
            </>
          ) : null}
        </div>
        {log.topicTitle ? (
          <div className="mt-1 truncate text-xs text-[var(--rp-muted)]">
            {t("topicLine")}{" "}
            {topicHref ? (
              <Link href={topicHref} className="text-[var(--rp-primary)] hover:underline">
                {log.topicTitle}
              </Link>
            ) : (
              <span className="text-[var(--rp-fg)]">{log.topicTitle}</span>
            )}
          </div>
        ) : null}
        {log.note ? (
          <p className="mt-1 line-clamp-2 text-[11px] italic text-[var(--rp-muted)]">
            « {log.note} »
          </p>
        ) : null}
      </div>
      <div className="text-right text-[11px] text-[var(--rp-muted)]" title={formatForumDate(log.at, locale)}>
        {formatForumRelative(log.at, locale)}
      </div>
    </li>
  );
}
