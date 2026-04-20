"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
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
  const { config, setConfig, persist } = useSiteConfig();
  const { user, roleDef, findByUsername, hasPermission } = useAccount();
  const categories = Array.isArray(config.forumCategories)
    ? config.forumCategories
    : defaultSiteConfig.forumCategories;
  const topics = Array.isArray(config.forumTopics) ? config.forumTopics : defaultSiteConfig.forumTopics;

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const list = useMemo(
    () => sortTopics(topics.filter((t) => t.categoryId === categoryId)),
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
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">Catégorie introuvable</h1>
        <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline">
          ← Retour au forum
        </Link>
      </div>
    );
  }

  if (!canViewCategory(category, roleDef)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">Catégorie privée</h1>
        <p className="mt-2 text-sm text-[var(--rp-muted)]">
          Cette catégorie est réservée à l’équipe.
        </p>
        <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline">
          ← Retour au forum
        </Link>
      </div>
    );
  }

  function submitTopic(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!user) {
      setErr("Connectez-vous pour publier un sujet.");
      return;
    }
    if (!hasPermission("forum.post")) {
      setErr("Votre rôle n'autorise pas la création de sujets.");
      return;
    }
    const next = forumAppendTopic(config, categoryId, title, user.username, body);
    if (next === config) {
      setErr("Renseignez un titre et un message.");
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
        eyebrow={isCategoryPrivate(category) ? "Forum · Privé" : "Forum"}
        title={category.title}
        subtitle={category.description}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/forum" className="text-sm font-semibold text-[var(--rp-primary)] hover:underline">
            ← Toutes les catégories
          </Link>
          <Button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={!user || !hasPermission("forum.post")}
            title={
              !user
                ? "Connectez-vous pour publier"
                : !hasPermission("forum.post")
                  ? "Votre rôle n'autorise pas la création de sujets"
                  : undefined
            }
          >
            {open ? "Annuler" : "Nouveau sujet"}
          </Button>
        </div>

        <ForumIdentityBar />

        {open && user ? (
          <Card className="mt-6">
            <CardBody>
              <h2 className="font-heading text-lg font-semibold text-[var(--rp-fg)]">Nouveau sujet</h2>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                Le sujet sera publié dans <span className="font-semibold">{category.title}</span> sous{" "}
                <span className="font-semibold">@{user.username}</span>.
              </p>
              <form className="mt-4 space-y-4" onSubmit={submitTopic}>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">Titre</label>
                  <Input
                    className="mt-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">Message</label>
                  <Textarea
                    className="mt-2 min-h-[10rem]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>
                {err ? <p className="text-xs text-[var(--rp-danger)]">{err}</p> : null}
                <Button type="submit">Publier le sujet</Button>
              </form>
            </CardBody>
          </Card>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_88%,transparent)]">
          <div className="hidden grid-cols-12 gap-3 border-b border-[var(--rp-border)] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)] md:grid">
            <div className="col-span-7">Sujet</div>
            <div className="col-span-1 text-center">Réponses</div>
            <div className="col-span-1 text-center">Vues</div>
            <div className="col-span-3">Dernier message</div>
          </div>

          {list.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--rp-muted)]">
              Aucun sujet pour le moment. Lancez la discussion avec « Nouveau sujet ».
            </p>
          ) : (
            <ul className="divide-y divide-[var(--rp-border)]">
              {list.map((t) => {
                const updated = topicUpdatedAt(t);
                const lastAuthor = topicLastAuthor(t);
                const authorAcc = findByUsername(t.author);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/forum/${categoryId}/${t.id}`}
                      className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.04] md:grid-cols-12"
                    >
                      <div className="md:col-span-7 flex items-start gap-3">
                        <Avatar account={authorAcc} fallbackName={t.author} size="md" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {t.pinned ? <Badge tone="primary">Épinglé</Badge> : null}
                            {t.locked ? <Badge tone="danger">Verrouillé</Badge> : null}
                            <span className="font-semibold text-[var(--rp-fg)]">{t.title}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-[var(--rp-muted)]">
                            Par {authorAcc?.profile.displayName || t.author} · {formatForumRelative(t.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-1 md:text-center md:self-center">
                        <span className="md:hidden text-xs text-[var(--rp-muted)]">Réponses : </span>
                        <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{t.replies.length}</span>
                      </div>
                      <div className="md:col-span-1 md:text-center md:self-center">
                        <span className="md:hidden text-xs text-[var(--rp-muted)]">Vues : </span>
                        <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{t.views ?? 0}</span>
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
