import type {
  ForumNotification,
  ForumReply,
  ForumTopic,
  SiteConfig,
} from "@/config/types";
import { forumNewId } from "@/lib/forum-mutate";

const MAX_PER_USER = 100;
const EXCERPT_MAX = 200;

function clipExcerpt(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  return t.length > EXCERPT_MAX ? `${t.slice(0, EXCERPT_MAX)}…` : t;
}

function eqUser(a: string | undefined, b: string | undefined) {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Crée une notification de réponse (skip si l’auteur répond à son propre sujet). */
export function notifyReply(
  config: SiteConfig,
  topic: ForumTopic | null | undefined,
  reply: ForumReply,
  categoryId: string,
): SiteConfig {
  if (!topic) return config;
  if (eqUser(topic.author, reply.author)) return config;

  const notif: ForumNotification = {
    id: forumNewId(),
    recipient: topic.author,
    actor: reply.author,
    type: "reply",
    topicId: topic.id,
    topicTitle: topic.title,
    categoryId,
    replyId: reply.id,
    excerpt: clipExcerpt(reply.body),
    createdAt: reply.createdAt,
    read: false,
  };

  const prev = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];

  const sameUserList = prev.filter((n) => eqUser(n.recipient, notif.recipient));
  const otherUserList = prev.filter((n) => !eqUser(n.recipient, notif.recipient));
  const trimmed = [notif, ...sameUserList].slice(0, MAX_PER_USER);

  return { ...config, forumNotifications: [...trimmed, ...otherUserList] };
}

export function getNotificationsFor(
  config: SiteConfig,
  username: string | undefined | null,
): ForumNotification[] {
  if (!username) return [];
  const list = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];
  const u = username.trim().toLowerCase();
  return list
    .filter((n) => n.recipient.trim().toLowerCase() === u)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countUnread(
  config: SiteConfig,
  username: string | undefined | null,
): number {
  return getNotificationsFor(config, username).filter((n) => !n.read).length;
}

export function markNotificationRead(
  config: SiteConfig,
  notifId: string,
): SiteConfig {
  const list = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];
  return {
    ...config,
    forumNotifications: list.map((n) =>
      n.id === notifId ? { ...n, read: true } : n,
    ),
  };
}

export function markAllRead(
  config: SiteConfig,
  username: string | undefined | null,
): SiteConfig {
  if (!username) return config;
  const u = username.trim().toLowerCase();
  const list = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];
  return {
    ...config,
    forumNotifications: list.map((n) =>
      n.recipient.trim().toLowerCase() === u ? { ...n, read: true } : n,
    ),
  };
}

export function deleteNotification(
  config: SiteConfig,
  notifId: string,
): SiteConfig {
  const list = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];
  return {
    ...config,
    forumNotifications: list.filter((n) => n.id !== notifId),
  };
}

export function clearNotificationsFor(
  config: SiteConfig,
  username: string | undefined | null,
): SiteConfig {
  if (!username) return config;
  const u = username.trim().toLowerCase();
  const list = Array.isArray(config.forumNotifications)
    ? config.forumNotifications
    : [];
  return {
    ...config,
    forumNotifications: list.filter(
      (n) => n.recipient.trim().toLowerCase() !== u,
    ),
  };
}
