import type {
  ForumLogAction,
  ForumLogEntry,
  ForumTopic,
  SiteConfig,
} from "@/config/types";
import { forumNewId } from "@/lib/forum-mutate";

const MAX_LOGS = 500;
const NOTE_MAX = 300;

export type LogActor = {
  username: string;
  /** ID du rôle (libre) ou `"system"` pour les actions automatiques. */
  role: string;
};

function clipNote(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  return t.length > NOTE_MAX ? `${t.slice(0, NOTE_MAX)}…` : t;
}

/** Ajoute une entrée au journal et retourne une nouvelle SiteConfig. */
export function appendForumLog(
  config: SiteConfig,
  entry: {
    actor: LogActor;
    action: ForumLogAction;
    topic?: ForumTopic | null;
    replyId?: string;
    targetAuthor?: string;
    note?: string;
  },
): SiteConfig {
  const log: ForumLogEntry = {
    id: forumNewId(),
    at: new Date().toISOString(),
    actor: entry.actor.username,
    actorRole: entry.actor.role,
    action: entry.action,
    topicId: entry.topic?.id,
    topicTitle: entry.topic?.title,
    replyId: entry.replyId,
    targetAuthor: entry.targetAuthor,
    note: clipNote(entry.note),
  };
  const prev = Array.isArray(config.forumLogs) ? config.forumLogs : [];
  const next = [log, ...prev].slice(0, MAX_LOGS);
  return { ...config, forumLogs: next };
}

/** Vide complètement le journal (réservé admin via UI). */
export function clearForumLogs(config: SiteConfig): SiteConfig {
  return { ...config, forumLogs: [] };
}

export const FORUM_ACTION_LABEL: Record<ForumLogAction, string> = {
  topic_created: "Sujet créé",
  topic_deleted: "Sujet supprimé",
  topic_edited: "Sujet modifié",
  topic_pinned: "Sujet épinglé",
  topic_unpinned: "Sujet désépinglé",
  topic_locked: "Sujet verrouillé",
  topic_unlocked: "Sujet déverrouillé",
  reply_created: "Réponse publiée",
  reply_deleted: "Réponse supprimée",
  reply_edited: "Réponse modifiée",
};

export const FORUM_ACTION_TONE: Record<
  ForumLogAction,
  "primary" | "neutral" | "danger" | "warning" | "success"
> = {
  topic_created: "success",
  topic_deleted: "danger",
  topic_edited: "neutral",
  topic_pinned: "primary",
  topic_unpinned: "neutral",
  topic_locked: "warning",
  topic_unlocked: "neutral",
  reply_created: "success",
  reply_deleted: "danger",
  reply_edited: "neutral",
};
