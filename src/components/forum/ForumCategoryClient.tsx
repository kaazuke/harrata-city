"use client";

import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { useAccount } from "@/components/providers/AccountProvider";
import { defaultSiteConfig } from "@/config/default-site";
import {
  forumAppendTopic,
  formatForumRelative,
  sortTopics,
  topicLastAuthor,
  topicUpdatedAt,
} from "@/lib/forum-mutate";
import { appendForumLog } from "@/lib/forum-logs";
import { canViewCategory, isCategoryPrivate } from "@/lib/forum-access";
import { Avatar } from "@/components/account/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { ForumDisabled } from "@/components/forum/ForumDisabled";
import { ForumIdentityBar } from "@/components/forum/ForumIdentityBar";

export function ForumCategoryClient() {
  const params = useParams();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  const { config: rawConfig, setConfig, persist } = useSiteConfig();
  const { config } = useLocalizedConfig();
  const { user, roleDef, findByUsername, hasPermission } = useAccount();
  const t = useTranslations("forum.category");
  const categories = Array.isArray(config.forumCategories)
    ? config.forumCategories
    : defaultSiteConfig.forumCategories;
  const topics = Array.isArray(config.forumTopics) ? config.forumTopics : defaultSiteConfig.forumTopics;

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const list = useMemo(
    () => sortTopics(topics.filter((top) => top.categoryId === categoryId)),
    [topics, categoryId],
  );

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!config.modules.forum) {
    return <ForumDisabled />;
  }

  if (!categoryId || !category) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">{t("notFound")}</h1>
        <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline">
          {t("backToForum")}
        </Link>
      </div>
    );
  }

  if (!canViewCategory(category, roleDef)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">{t("private")}</h1>
        <p className="mt-2 text-sm text-[var(--rp-muted)]">{t("privateReservedStaff")}</p>
        <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline">
          {t("backToForum")}
        </Link>
      </div>
    );
  }

  function submitTopic(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!user) {
      setErr(t("errLogin"));
      return;
    }
    if (!hasPermission("forum.post")) {
      setErr(t("errRole"));
      return;
    }
    const next = forumAppendTopic(rawConfig, categoryId, title, user.username, body);
    if (next === rawConfig) {
      setErr(t("errEmpty"));
      return;
    }
    const created = next.forumTopics[next.forumTopics.length - 1];
    const withLog = appendForumLog(next, {
      actor: { username: user.username, role: user.role },
      action: "topic_created",
      topic: created,
      targetAuthor: user.username,
      note: title.trim().slice(0, 120),
    });
    setConfig(withLog);
    persist(withLog);
    setTitle("");
    setBody("");
    setOpen(false);
  }

  return (
    <div>
      <PageHero
        eyebrow={isCategoryPrivate(category) ? t("eyebrowPrivate") : t("eyebrow")}
        title={category.title}
        subtitle={category.description}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/forum" className="text-sm font-semibold text-[var(--rp-primary)] hover:underline">
            {t("allCategories")}
          </Link>
          <Button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={!user || !hasPermission("forum.post")}
            title={
              !user
                ? t("loginToPost")
                : !hasPermission("forum.post")
                  ? t("roleCantPost")
                  : undefined
            }
          >
            {open ? t("cancel") : t("newTopic")}
          </Button>
        </div>

        <ForumIdentityBar />

        {open && user ? (
          <Card className="mt-6">
            <CardBody>
              <h2 className="font-heading text-lg font-semibold text-[var(--rp-fg)]">{t("newTopic")}</h2>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                {t("newTopicHintPrefix")}{" "}
                <span className="font-semibold">{category.title}</span>{" "}
                {t("newTopicHintMiddle")}{" "}
                <span className="font-semibold">@{user.username}</span>
                {t("newTopicHintSuffix")}
              </p>
              <form className="mt-4 space-y-4" onSubmit={submitTopic}>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("titleLabel")}</label>
                  <Input
                    className="mt-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("messageLabel")}</label>
                  <Textarea
                    className="mt-2 min-h-[10rem]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>
                {err ? <p className="text-xs text-[var(--rp-danger)]">{err}</p> : null}
                <Button type="submit">{t("publishTopic")}</Button>
              </form>
            </CardBody>
          </Card>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_88%,transparent)]">
          <div className="hidden grid-cols-12 gap-3 border-b border-[var(--rp-border)] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)] md:grid">
            <div className="col-span-7">{t("colTopic")}</div>
            <div className="col-span-1 text-center">{t("colReplies")}</div>
            <div className="col-span-1 text-center">{t("colViews")}</div>
            <div className="col-span-3">{t("colLastMessage")}</div>
          </div>

          {list.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--rp-muted)]">{t("empty")}</p>
          ) : (
            <ul className="divide-y divide-[var(--rp-border)]">
              {list.map((top) => {
                const updated = topicUpdatedAt(top);
                const lastAuthor = topicLastAuthor(top);
                const authorAcc = findByUsername(top.author);
                return (
                  <li key={top.id}>
                    <Link
                      href={`/forum/${categoryId}/${top.id}`}
                      className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.04] md:grid-cols-12"
                    >
                      <div className="md:col-span-7 flex items-start gap-3">
                        <Avatar account={authorAcc} fallbackName={top.author} size="md" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {top.pinned ? <Badge tone="primary">{t("pinned")}</Badge> : null}
                            {top.locked ? <Badge tone="danger">{t("locked")}</Badge> : null}
                            <span className="font-semibold text-[var(--rp-fg)]">{top.title}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-[var(--rp-muted)]">
                            {t("by", {
                              author: authorAcc?.profile.displayName || top.author,
                              when: formatForumRelative(top.createdAt),
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-1 md:text-center md:self-center">
                        <span className="md:hidden text-xs text-[var(--rp-muted)]">{t("repliesInline")}</span>
                        <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{top.replies.length}</span>
                      </div>
                      <div className="md:col-span-1 md:text-center md:self-center">
                        <span className="md:hidden text-xs text-[var(--rp-muted)]">{t("viewsInline")}</span>
                        <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{top.views ?? 0}</span>
                      </div>
                      <div className="md:col-span-3 md:self-center">
                        <div className="text-sm font-medium text-[var(--rp-fg)]">{lastAuthor}</div>
                        <div className="text-[11px] text-[var(--rp-muted)]">{formatForumRelative(updated)}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
