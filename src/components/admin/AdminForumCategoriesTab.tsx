"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { useAccount } from "@/components/providers/AccountProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ForumCategory } from "@/config/types";
import { roleHasPermission } from "@/lib/account/types";

export function AdminForumCategoriesTab() {
  const t = useTranslations("admin.forumCategories");
  const { config, setConfig, persist } = useSiteConfig();
  const { roles } = useAccount();
  const categories = useMemo<ForumCategory[]>(
    () => (Array.isArray(config.forumCategories) ? config.forumCategories : []),
    [config.forumCategories],
  );

  function updateCategory(id: string, patch: Partial<ForumCategory>) {
    const next = {
      ...config,
      forumCategories: categories.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    };
    setConfig(next);
    persist(next);
  }

  function toggleRoleInCategory(id: string, roleId: string) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const current = Array.isArray(cat.restrictedTo) ? cat.restrictedTo : [];
    const has = current.includes(roleId);
    const restrictedTo = has
      ? current.filter((r) => r !== roleId)
      : [...current, roleId];
    updateCategory(id, {
      restrictedTo: restrictedTo.length === 0 ? undefined : restrictedTo,
    });
  }

  function clearRestriction(id: string) {
    updateCategory(id, { restrictedTo: undefined });
  }

  function addCategory() {
    const id = `cat_${Date.now().toString(36)}`;
    const newCat: ForumCategory = {
      id,
      title: t("newTitle"),
      description: t("newDesc"),
    };
    const next = { ...config, forumCategories: [...categories, newCat] };
    setConfig(next);
    persist(next);
  }

  function removeCategory(id: string) {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }
    const next = {
      ...config,
      forumCategories: categories.filter((c) => c.id !== id),
    };
    setConfig(next);
    persist(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--rp-fg)]">{t("title")}</h2>
          <p className="mt-1 text-xs text-[var(--rp-muted)]">
            {t("subtitle", { count: categories.length })}
          </p>
        </div>
        <Button type="button" onClick={addCategory}>
          {t("add")}
        </Button>
      </div>

      <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 px-3 py-2 text-[11px] text-[var(--rp-muted)]">
        {t("privateHint")}
      </p>

      {categories.length === 0 ? (
        <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-sm text-[var(--rp-muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => {
            const restricted = Array.isArray(c.restrictedTo) ? c.restrictedTo : [];
            const isPrivate = restricted.length > 0;
            return (
              <li
                key={c.id}
                className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                      {t("fieldTitle")}
                    </label>
                    <Input
                      className="mt-1"
                      value={c.title}
                      onChange={(e) => updateCategory(c.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                      {t("accentColor")}
                    </label>
                    <Input
                      className="mt-1"
                      placeholder="#7aa9ff"
                      value={c.accent ?? ""}
                      onChange={(e) =>
                        updateCategory(c.id, {
                          accent: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Badge tone="warning">{t("privateLabel")}</Badge>
                    ) : (
                      <Badge tone="neutral">{t("publicLabel")}</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                    {t("fieldDesc")}
                  </label>
                  <Input
                    className="mt-1"
                    value={c.description}
                    onChange={(e) => updateCategory(c.id, { description: e.target.value })}
                  />
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                      {t("accessExtra")}
                    </span>
                    {isPrivate ? (
                      <button
                        type="button"
                        onClick={() => clearRestriction(c.id)}
                        className="text-[11px] font-semibold text-[var(--rp-muted)] hover:underline"
                      >
                        {t("makePublic")}
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roles.map((r) => {
                      const checked = restricted.includes(r.id);
                      const auto = roleHasPermission(r, "forum.access_private");
                      return (
                        <label
                          key={r.id}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                            checked || auto
                              ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                              : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
                          }`}
                          title={auto ? t("autoAccessHint", { label: r.label }) : undefined}
                        >
                          <input
                            type="checkbox"
                            checked={checked || auto}
                            disabled={auto}
                            onChange={() => toggleRoleInCategory(c.id, r.id)}
                          />
                          <span>{r.label}</span>
                          {auto ? (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--rp-muted)]">
                              auto
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--rp-muted)]">
                  <span>
                    ID : <span className="font-mono">{c.id}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeCategory(c.id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
