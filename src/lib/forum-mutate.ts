import type { ForumReply, ForumTopic, SiteConfig } from "@/config/types";

export function formatForumDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function formatForumRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "à l’instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `il y a ${mo} mois`;
  return `il y a ${Math.floor(mo / 12)} an(s)`;
}

export function topicUpdatedAt(t: ForumTopic): string {
  if (t.replies.length === 0) return t.updatedAt ?? t.createdAt;
  const last = t.replies[t.replies.length - 1].createdAt;
  return last > (t.updatedAt ?? t.createdAt) ? last : t.updatedAt ?? t.createdAt;
}

export function topicLastAuthor(t: ForumTopic): string {
  if (t.replies.length === 0) return t.author;
  return t.replies[t.replies.length - 1].author;
}

export function sortTopics(list: ForumTopic[]): ForumTopic[] {
  return [...list].sort((a, b) => {
    if ((a.pinned ? 1 : 0) !== (b.pinned ? 1 : 0)) return a.pinned ? -1 : 1;
    return topicUpdatedAt(b).localeCompare(topicUpdatedAt(a));
  });
}

export function forumNewId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const MAX_BODY = 8000;
const MAX_TITLE = 200;
const MAX_AUTHOR = 80;

function clip(s: string, max: number) {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function withTopicPatch(
  config: SiteConfig,
  topicId: string,
  patch: (t: ForumTopic) => ForumTopic,
): SiteConfig {
  let changed = false;
  const topics = config.forumTopics.map((t) => {
    if (t.id !== topicId) return t;
    changed = true;
    return patch(t);
  });
  return changed ? { ...config, forumTopics: topics } : config;
}

export function forumAppendReply(
  config: SiteConfig,
  topicId: string,
  author: string,
  body: string,
): SiteConfig {
  const a = clip(author, MAX_AUTHOR);
  const b = clip(body, MAX_BODY);
  if (!a || !b) return config;
  const target = config.forumTopics.find((t) => t.id === topicId);
  if (!target || target.locked) return config;
  const reply: ForumReply = {
    id: forumNewId(),
    author: a,
    body: b,
    createdAt: new Date().toISOString(),
  };
  return withTopicPatch(config, topicId, (t) => ({
    ...t,
    replies: [...t.replies, reply],
    updatedAt: reply.createdAt,
  }));
}

export function forumAppendTopic(
  config: SiteConfig,
  categoryId: string,
  title: string,
  author: string,
  body: string,
): SiteConfig {
  const ti = clip(title, MAX_TITLE);
  const a = clip(author, MAX_AUTHOR);
  const b = clip(body, MAX_BODY);
  if (!ti || !a || !b) return config;
  const cat = config.forumCategories.some((c) => c.id === categoryId);
  if (!cat) return config;
  const now = new Date().toISOString();
  const topic: ForumTopic = {
    id: forumNewId(),
    categoryId,
    title: ti,
    author: a,
    body: b,
    createdAt: now,
    updatedAt: now,
    views: 0,
    replies: [],
  };
  return { ...config, forumTopics: [...config.forumTopics, topic] };
}

export function forumIncrementViews(config: SiteConfig, topicId: string): SiteConfig {
  return withTopicPatch(config, topicId, (t) => ({ ...t, views: (t.views ?? 0) + 1 }));
}

export function forumTogglePinned(config: SiteConfig, topicId: string): SiteConfig {
  return withTopicPatch(config, topicId, (t) => ({ ...t, pinned: !t.pinned }));
}

export function forumToggleLocked(config: SiteConfig, topicId: string): SiteConfig {
  return withTopicPatch(config, topicId, (t) => ({ ...t, locked: !t.locked }));
}

export function forumDeleteTopic(config: SiteConfig, topicId: string): SiteConfig {
  return { ...config, forumTopics: config.forumTopics.filter((t) => t.id !== topicId) };
}

export function forumDeleteReply(
  config: SiteConfig,
  topicId: string,
  replyId: string,
): SiteConfig {
  return withTopicPatch(config, topicId, (t) => ({
    ...t,
    replies: t.replies.filter((r) => r.id !== replyId),
  }));
}

export function forumEditReply(
  config: SiteConfig,
  topicId: string,
  replyId: string,
  body: string,
): SiteConfig {
  const b = clip(body, MAX_BODY);
  if (!b) return config;
  return withTopicPatch(config, topicId, (t) => ({
    ...t,
    replies: t.replies.map((r) => (r.id === replyId ? { ...r, body: b } : r)),
  }));
}

export function forumEditTopicBody(
  config: SiteConfig,
  topicId: string,
  body: string,
): SiteConfig {
  const b = clip(body, MAX_BODY);
  if (!b) return config;
  return withTopicPatch(config, topicId, (t) => ({ ...t, body: b }));
}

export function categoryStats(topics: ForumTopic[], categoryId: string) {
  const list = topics.filter((t) => t.categoryId === categoryId);
  const messages = list.reduce((acc, t) => acc + 1 + t.replies.length, 0);
  const sorted = sortTopics(list);
  const last = sorted[0] ?? null;
  return { topics: list.length, messages, last };
}

export function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/* ─────────────────────────── Réactions ─────────────────────────── */

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;
export type ForumEmoji = (typeof ALLOWED_EMOJIS)[number];
export const FORUM_EMOJIS: readonly ForumEmoji[] = ALLOWED_EMOJIS;

function toggleReactionList(
  list: import("@/config/types").ForumReaction[] | undefined,
  emoji: string,
  username: string,
): import("@/config/types").ForumReaction[] {
  const current = Array.isArray(list) ? list : [];
  const found = current.find((r) => r.emoji === emoji);
  if (!found) {
    return [...current, { emoji, users: [username] }];
  }
  const had = found.users.includes(username);
  const nextUsers = had
    ? found.users.filter((u) => u !== username)
    : [...found.users, username];
  const nextList = current.map((r) =>
    r.emoji === emoji ? { ...r, users: nextUsers } : r,
  );
  return nextList.filter((r) => r.users.length > 0);
}

/** Ajoute/retire une réaction sur un sujet. */
export function forumToggleTopicReaction(
  config: SiteConfig,
  topicId: string,
  emoji: string,
  username: string,
): SiteConfig {
  if (!FORUM_EMOJIS.includes(emoji as ForumEmoji)) return config;
  const u = clip(username, MAX_AUTHOR);
  if (!u) return config;
  return withTopicPatch(config, topicId, (t) => ({
    ...t,
    reactions: toggleReactionList(t.reactions, emoji, u),
  }));
}

/** Ajoute/retire une réaction sur une réponse. */
export function forumToggleReplyReaction(
  config: SiteConfig,
  topicId: string,
  replyId: string,
  emoji: string,
  username: string,
): SiteConfig {
  if (!FORUM_EMOJIS.includes(emoji as ForumEmoji)) return config;
  const u = clip(username, MAX_AUTHOR);
  if (!u) return config;
  return withTopicPatch(config, topicId, (t) => ({
    ...t,
    replies: t.replies.map((r) =>
      r.id === replyId
        ? { ...r, reactions: toggleReactionList(r.reactions, emoji, u) }
        : r,
    ),
  }));
}
