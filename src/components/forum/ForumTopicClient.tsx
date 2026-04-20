"use client";

import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { useAccount } from "@/components/providers/AccountProvider";
import { defaultSiteConfig } from "@/config/default-site";
import {
  formatForumDate,
  formatForumRelative,
  forumAppendReply,
  forumDeleteReply,
  forumDeleteTopic,
  forumEditReply,
  forumEditTopicBody,
  forumIncrementViews,
  forumToggleLocked,
  forumTogglePinned,
  forumToggleTopicReaction,
  forumToggleReplyReaction,
  topicUpdatedAt,
} from "@/lib/forum-mutate";
import { appendForumLog, type LogActor } from "@/lib/forum-logs";
import { notifyReply } from "@/lib/forum-notifications";
import { canViewCategory } from "@/lib/forum-access";
import type { ForumLogAction, ForumReaction, SiteConfig } from "@/config/types";
import type { Account } from "@/lib/account/types";
import { Reactions } from "@/components/forum/Reactions";
import { Avatar } from "@/components/account/Avatar";
import { RoleBadge } from "@/components/account/RoleBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { ForumDisabled } from "@/components/forum/ForumDisabled";
import { ForumIdentityBar } from "@/components/forum/ForumIdentityBar";

export function ForumTopicClient() {
  const params = useParams();
  const router = useRouter();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  const topicId = typeof params.topicId === "string" ? params.topicId : "";
  const { config: rawConfig, setConfig, persist } = useSiteConfig();
  const { config } = useLocalizedConfig();
  const { user, roleDef, hasPermission, findByUsername } = useAccount();
  const t = useTranslations("forum.topic");
  const canModerate = hasPermission("forum.moderate");
  const canReply = hasPermission("forum.reply");
  const categories = Array.isArray(config.forumCategories)
    ? config.forumCategories
    : defaultSiteConfig.forumCategories;
  const topics = Array.isArray(config.forumTopics) ? config.forumTopics : defaultSiteConfig.forumTopics;

  const topic = useMemo(() => topics.find((top) => top.id === topicId) ?? null, [topics, topicId]);
  const category = useMemo(
    () => categories.find((c) => c.id === (topic?.categoryId ?? categoryId)) ?? null,
    [categories, topic, categoryId],
  );

  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!topic || viewedRef.current === topic.id) return;
    viewedRef.current = topic.id;
    const next = forumIncrementViews(rawConfig, topic.id);
    if (next !== rawConfig) {
      setConfig(next);
      persist(next);
    }
  }, [topic, rawConfig, setConfig, persist]);

  if (!config.modules.forum) {
    return <ForumDisabled />;
  }

  if (!topic || !category || topic.categoryId !== categoryId) {
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
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">{t("privateTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--rp-muted)]">{t("privateBody")}</p>
        <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline">
          {t("backToForumLink")}
        </Link>
      </div>
    );
  }

  const isMine = (author: string) =>
    !!user && author.trim().toLowerCase() === user.username.toLowerCase();

  function actor(): LogActor | null {
    if (!user) return null;
    return { username: user.username, role: user.role };
  }

  function submitReply(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const a = actor();
    if (!user || !a) {
      setErr(t("loginToReply"));
      return;
    }
    if (!canReply) {
      setErr(t("roleCantReply"));
      return;
    }
    const next = forumAppendReply(rawConfig, topicId, user.username, body);
    if (next === rawConfig) {
      setErr(topic && topic.locked ? t("topicLocked") : t("messageEmpty"));
      return;
    }
    const updatedTopic = next.forumTopics.find((top) => top.id === topicId) ?? null;
    const newReply = updatedTopic?.replies[updatedTopic.replies.length - 1];
    const withLog = appendForumLog(next, {
      actor: a,
      action: "reply_created",
      topic: updatedTopic,
      replyId: newReply?.id,
      targetAuthor: user.username,
      note: body.trim().slice(0, 120),
    });
    const withNotif =
      newReply && updatedTopic
        ? notifyReply(withLog, updatedTopic, newReply, categoryId)
        : withLog;
    setConfig(withNotif);
    persist(withNotif);
    setBody("");
  }

  function toggleTopicReaction(emoji: string) {
    if (!user || !hasPermission("forum.react")) return;
    const next = forumToggleTopicReaction(rawConfig, topic!.id, emoji, user.username);
    if (next === rawConfig) return;
    setConfig(next);
    persist(next);
  }

  function toggleReplyReaction(replyId: string, emoji: string) {
    if (!user || !hasPermission("forum.react")) return;
    const next = forumToggleReplyReaction(
      rawConfig,
      topic!.id,
      replyId,
      emoji,
      user.username,
    );
    if (next === rawConfig) return;
    setConfig(next);
    persist(next);
  }

  function applyWithLog(
    next: SiteConfig,
    action: ForumLogAction,
    extras?: { replyId?: string; targetAuthor?: string; note?: string },
  ): SiteConfig | null {
    if (next === rawConfig) return null;
    const a = actor();
    const finalConfig = a
      ? appendForumLog(next, {
          actor: a,
          action,
          topic,
          replyId: extras?.replyId,
          targetAuthor: extras?.targetAuthor,
          note: extras?.note,
        })
      : next;
    setConfig(finalConfig);
    persist(finalConfig);
    return finalConfig;
  }

  function quote(author: string, text: string) {
    setBody((prev) => {
      const block = `> **${author}** :\n${text
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")}\n\n`;
      return prev ? `${prev}\n${block}` : block;
    });
    setTimeout(() => replyRef.current?.focus(), 50);
  }

  const subtitle = `${t("by", { author: topic.author })} · ${formatForumDate(topic.createdAt)}${
    topic.replies.length
      ? t("lastActivity", { time: formatForumRelative(topicUpdatedAt(topic)) })
      : ""
  }`;

  return (
    <div>
      <PageHero eyebrow={category.title} title={topic.title} subtitle={subtitle} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/forum" className="font-semibold text-[var(--rp-primary)] hover:underline">
              {t("breadcrumbForum")}
            </Link>
            <span className="text-[var(--rp-muted)]">/</span>
            <Link href={`/forum/${categoryId}`} className="font-semibold text-[var(--rp-primary)] hover:underline">
              {category.title}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {topic.pinned ? <Badge tone="primary">{t("pinned")}</Badge> : null}
            {topic.locked ? <Badge tone="danger">{t("locked")}</Badge> : null}
            <Badge tone="neutral">
              {topic.views ?? 0}
              {t("views")}
            </Badge>
          </div>
        </div>

        <ForumIdentityBar />

        <PostBlock
          author={topic.author}
          authorAccount={findByUsername(topic.author)}
          createdAt={topic.createdAt}
          body={topic.body}
          isOriginal
          reactions={topic.reactions}
          currentUser={user?.username}
          onToggleReaction={user && hasPermission("forum.react") ? toggleTopicReaction : undefined}
          labels={{ save: t("save"), cancel: t("cancel") }}
          actions={
            <div className="flex flex-wrap gap-2">
              {!topic.locked && user ? (
                <button
                  type="button"
                  onClick={() => quote(topic.author, topic.body)}
                  className="text-xs font-semibold text-[var(--rp-primary)] hover:underline"
                >
                  {t("quote")}
                </button>
              ) : null}
              {isMine(topic.author) ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTopic(true);
                    setEditBuffer(topic.body);
                  }}
                  className="text-xs font-semibold text-[var(--rp-muted)] hover:underline"
                >
                  {t("edit")}
                </button>
              ) : null}
              {canModerate ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      applyWithLog(
                        forumTogglePinned(rawConfig, topic.id),
                        topic.pinned ? "topic_unpinned" : "topic_pinned",
                        { targetAuthor: topic.author },
                      )
                    }
                    className="text-xs font-semibold text-[var(--rp-muted)] hover:underline"
                  >
                    {topic.pinned ? t("unpin") : t("pin")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyWithLog(
                        forumToggleLocked(rawConfig, topic.id),
                        topic.locked ? "topic_unlocked" : "topic_locked",
                        { targetAuthor: topic.author },
                      )
                    }
                    className="text-xs font-semibold text-[var(--rp-muted)] hover:underline"
                  >
                    {topic.locked ? t("unlock") : t("lock")}
                  </button>
                </>
              ) : null}
              {isMine(topic.author) || canModerate ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(t("confirmDeleteTopic"))) {
                      return;
                    }
                    const applied = applyWithLog(
                      forumDeleteTopic(rawConfig, topic.id),
                      "topic_deleted",
                      { targetAuthor: topic.author, note: topic.title },
                    );
                    if (applied) {
                      router.push(`/forum/${categoryId}`);
                      router.refresh();
                    }
                  }}
                  className="text-xs font-semibold text-[var(--rp-danger)] hover:underline"
                >
                  {t("delete")}
                </button>
              ) : null}
            </div>
          }
          editing={editingTopic}
          editBuffer={editBuffer}
          onEditBufferChange={setEditBuffer}
          onCancelEdit={() => setEditingTopic(false)}
          onSaveEdit={() => {
            applyWithLog(
              forumEditTopicBody(rawConfig, topic.id, editBuffer),
              "topic_edited",
              { targetAuthor: topic.author },
            );
            setEditingTopic(false);
          }}
        />

        <div className="mt-8 space-y-4">
          <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">
            {t("repliesCount", { count: topic.replies.length })}
          </h2>
          {topic.replies.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">{t("firstToReply")}</p>
          ) : (
            topic.replies.map((r, idx) => (
              <PostBlock
                key={r.id}
                author={r.author}
                authorAccount={findByUsername(r.author)}
                createdAt={r.createdAt}
                body={r.body}
                index={idx + 1}
                reactions={r.reactions}
                currentUser={user?.username}
                labels={{ save: t("save"), cancel: t("cancel") }}
                onToggleReaction={
                  user && hasPermission("forum.react")
                    ? (emoji) => toggleReplyReaction(r.id, emoji)
                    : undefined
                }
                actions={
                  <div className="flex flex-wrap gap-2">
                    {!topic.locked && user ? (
                      <button
                        type="button"
                        onClick={() => quote(r.author, r.body)}
                        className="text-xs font-semibold text-[var(--rp-primary)] hover:underline"
                      >
                        {t("quote")}
                      </button>
                    ) : null}
                    {isMine(r.author) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReplyId(r.id);
                          setEditBuffer(r.body);
                        }}
                        className="text-xs font-semibold text-[var(--rp-muted)] hover:underline"
                      >
                        {t("edit")}
                      </button>
                    ) : null}
                    {isMine(r.author) || canModerate ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(t("confirmDeletePost"))) {
                            applyWithLog(
                              forumDeleteReply(rawConfig, topic.id, r.id),
                              "reply_deleted",
                              {
                                replyId: r.id,
                                targetAuthor: r.author,
                                note: r.body,
                              },
                            );
                          }
                        }}
                        className="text-xs font-semibold text-[var(--rp-danger)] hover:underline"
                      >
                        {t("delete")}
                      </button>
                    ) : null}
                  </div>
                }
                editing={editingReplyId === r.id}
                editBuffer={editBuffer}
                onEditBufferChange={setEditBuffer}
                onCancelEdit={() => setEditingReplyId(null)}
                onSaveEdit={() => {
                  applyWithLog(
                    forumEditReply(rawConfig, topic.id, r.id, editBuffer),
                    "reply_edited",
                    { replyId: r.id, targetAuthor: r.author },
                  );
                  setEditingReplyId(null);
                }}
              />
            ))
          )}
        </div>

        {topic.locked ? (
          <p className="mt-10 rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-danger)_40%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--rp-fg)]">
            {t("lockedCta")}
          </p>
        ) : !user ? (
          <p className="mt-10 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_75%,transparent)] px-4 py-3 text-sm text-[var(--rp-muted)]">
            {t("loginToReply")}
          </p>
        ) : (
          <Card className="mt-10">
            <CardBody>
              <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">
                {t("reply")}
              </h2>
              <form className="mt-4 space-y-4" onSubmit={submitReply}>
                <p className="text-xs text-[var(--rp-muted)]">
                  {t("replyingAs", { name: `@${user.username}` })}
                </p>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">
                    {t("messageLabel")}
                  </label>
                  <Textarea
                    ref={replyRef}
                    className="mt-2 min-h-[8rem]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>
                {err ? <p className="text-xs text-[var(--rp-danger)]">{err}</p> : null}
                <Button type="submit">{t("sendReply")}</Button>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function PostBlock({
  author,
  authorAccount,
  createdAt,
  body,
  isOriginal = false,
  index,
  actions,
  editing,
  editBuffer,
  onEditBufferChange,
  onCancelEdit,
  onSaveEdit,
  reactions,
  currentUser,
  onToggleReaction,
  labels,
}: {
  author: string;
  authorAccount?: Account | null;
  createdAt: string;
  body: string;
  isOriginal?: boolean;
  index?: number;
  actions?: React.ReactNode;
  editing?: boolean;
  editBuffer?: string;
  reactions?: ForumReaction[];
  currentUser?: string | null;
  onToggleReaction?: (emoji: string) => void;
  onEditBufferChange?: (v: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  labels: { save: string; cancel: string };
}) {
  const display = authorAccount?.profile.displayName || author;
  const accent = authorAccount?.profile.color;
  return (
    <div
      className="mt-6 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_88%,transparent)] shadow-[var(--rp-shadow-sm)]"
      style={
        accent
          ? { borderColor: `color-mix(in oklab, ${accent} 35%, var(--rp-border))` }
          : undefined
      }
    >
      <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
        <aside className="flex flex-row items-center gap-3 border-b border-[var(--rp-border)] bg-black/15 px-5 py-4 sm:flex-col sm:items-center sm:border-b-0 sm:border-r sm:py-5 sm:text-center">
          <Avatar account={authorAccount} fallbackName={author} size="lg" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--rp-fg)]">{display}</div>
            <div className="text-[11px] text-[var(--rp-muted)]">@{author}</div>
            {authorAccount ? (
              <div className="mt-1.5 flex justify-start gap-2 sm:justify-center">
                <RoleBadge role={authorAccount.role} />
              </div>
            ) : null}
            {authorAccount?.profile.bio ? (
              <p className="mt-2 hidden text-[11px] leading-relaxed text-[var(--rp-muted)] sm:block">
                {authorAccount.profile.bio}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rp-border)] px-5 py-2.5 text-xs text-[var(--rp-muted)]">
            <span title={createdAt}>{formatForumDate(createdAt)}</span>
            {isOriginal ? <Badge tone="neutral">#1</Badge> : <Badge tone="neutral">#{(index ?? 1) + 1}</Badge>}
          </div>
          <div className="px-5 py-5">
            {editing ? (
              <div className="space-y-3">
                <Textarea
                  className="min-h-[6rem]"
                  value={editBuffer ?? ""}
                  onChange={(e) => onEditBufferChange?.(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => onSaveEdit?.()}>
                    {labels.save}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => onCancelEdit?.()}>
                    {labels.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--rp-fg)]">{body}</p>
            )}
            {authorAccount?.profile.signature ? (
              <p className="mt-4 border-t border-[var(--rp-border)] pt-3 text-[11px] italic text-[var(--rp-muted)]">
                {authorAccount.profile.signature}
              </p>
            ) : null}
            {(reactions && reactions.length > 0) || onToggleReaction ? (
              <div className="mt-4">
                <Reactions
                  reactions={reactions}
                  currentUser={currentUser}
                  onToggle={(emoji) => onToggleReaction?.(emoji)}
                  disabled={!onToggleReaction}
                />
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="border-t border-[var(--rp-border)] px-5 py-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
