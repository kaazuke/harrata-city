"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { defaultSiteConfig } from "@/config/default-site";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/account/Avatar";
import { ForumDisabled } from "@/components/forum/ForumDisabled";
import { ForumIdentityBar } from "@/components/forum/ForumIdentityBar";
import { useAccount } from "@/components/providers/AccountProvider";
import { categoryStats, formatForumRelative } from "@/lib/forum-mutate";
import { isCategoryPrivate, visibleCategories } from "@/lib/forum-access";

export function ForumHomeClient() {
  const { config } = useSiteConfig();
  const { findByUsername, roleDef } = useAccount();
  const allCategories = Array.isArray(config.forumCategories)
    ? config.forumCategories
    : defaultSiteConfig.forumCategories;
  const categories = useMemo(
    () => visibleCategories(allCategories, roleDef),
    [allCategories, roleDef],
  );
  const topics = Array.isArray(config.forumTopics)
    ? config.forumTopics
    : defaultSiteConfig.forumTopics;

  const totals = useMemo(() => {
    const messages = topics.reduce((acc, t) => acc + 1 + t.replies.length, 0);
    return { topics: topics.length, messages };
  }, [topics]);

  if (!config.modules.forum) {
    return <ForumDisabled />;
  }

  return (
    <div>
      <PageHero
        eyebrow="Communauté"
        title="Forum"
        subtitle="Sujets, réponses et entraide entre joueurs. Les messages sont stockés localement (export JSON pour les partager)."
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <ForumIdentityBar />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Card>
            <CardBody>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                Catégories
              </div>
              <div className="mt-1 font-heading text-2xl font-semibold tabular-nums text-[var(--rp-fg)]">
                {categories.length}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                Sujets
              </div>
              <div className="mt-1 font-heading text-2xl font-semibold tabular-nums text-[var(--rp-fg)]">
                {totals.topics}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                Messages
              </div>
              <div className="mt-1 font-heading text-2xl font-semibold tabular-nums text-[var(--rp-fg)]">
                {totals.messages}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_88%,transparent)]">
          <div className="hidden grid-cols-12 gap-3 border-b border-[var(--rp-border)] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)] md:grid">
            <div className="col-span-6">Catégorie</div>
            <div className="col-span-2 text-center">Sujets</div>
            <div className="col-span-1 text-center">Messages</div>
            <div className="col-span-3">Dernier sujet</div>
          </div>

          <ul className="divide-y divide-[var(--rp-border)]">
            {categories.map((c) => {
              const stats = categoryStats(topics, c.id);
              return (
                <li key={c.id}>
                  <Link
                    href={`/forum/${c.id}`}
                    className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.04] md:grid-cols-12"
                  >
                    <div className="md:col-span-6 flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--rp-radius)] border text-sm font-semibold"
                        style={{
                          color: c.accent ?? "var(--rp-primary)",
                          borderColor: `color-mix(in oklab, ${c.accent ?? "var(--rp-primary)"} 35%, var(--rp-border))`,
                          background: `color-mix(in oklab, ${c.accent ?? "var(--rp-primary)"} 10%, transparent)`,
                        }}
                        aria-hidden
                      >
                        {c.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--rp-fg)]">{c.title}</span>
                          {isCategoryPrivate(c) ? (
                            <Badge tone="warning">Privé</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--rp-muted)]">{c.description}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 md:text-center md:self-center">
                      <span className="md:hidden text-xs text-[var(--rp-muted)]">Sujets : </span>
                      <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{stats.topics}</span>
                    </div>
                    <div className="md:col-span-1 md:text-center md:self-center">
                      <span className="md:hidden text-xs text-[var(--rp-muted)]">Messages : </span>
                      <span className="font-semibold tabular-nums text-[var(--rp-fg)]">{stats.messages}</span>
                    </div>
                    <div className="md:col-span-3 md:self-center">
                      {stats.last ? (
                        <div className="flex items-center gap-2">
                          <Avatar account={findByUsername(stats.last.author)} fallbackName={stats.last.author} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[var(--rp-fg)]">
                              {stats.last.title}
                            </div>
                            <div className="text-[11px] text-[var(--rp-muted)]">
                              {stats.last.author} · {formatForumRelative(stats.last.updatedAt ?? stats.last.createdAt)}
                            </div>
                          </div>
                          {stats.last.pinned ? (
                            <Badge tone="primary">Épinglé</Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--rp-muted)]">Aucun sujet</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
