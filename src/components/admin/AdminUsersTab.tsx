"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/components/providers/AccountProvider";
import { formatAccountError } from "@/lib/account/format-account-error";
import type { AccountFailure } from "@/lib/account/account-error-keys";
import { Avatar } from "@/components/account/Avatar";
import { RoleBadge } from "@/components/account/RoleBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function AdminUsersTab() {
  const t = useTranslations("admin.users");
  const te = useTranslations("accountErrors");
  const locale = useLocale();
  const { user, accounts, roles, roleDefOf, setRole, deleteAccount } = useAccount();
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return [...accounts].sort((a, b) => a.usernameLower.localeCompare(b.usernameLower)).filter(
      (a) => !f || a.usernameLower.includes(f) || (a.profile.displayName ?? "").toLowerCase().includes(f),
    );
  }, [accounts, filter]);

  return (
    <Card>
      <CardHeader title={t("title")} subtitle={t("subtitle")} />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="max-w-xs"
          />
          <div className="text-xs text-[var(--rp-muted)]">
            {t("accountCount", { count: accounts.length })}
          </div>
        </div>

        {msg ? (
          <p
            className={`text-xs ${
              msg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
            }`}
          >
            {msg.text}
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-center text-sm text-[var(--rp-muted)]">
            {t("none")}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--rp-border)] overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)]">
            {filtered.map((acc) => {
              const isSelf = user?.id === acc.id;
              const def = roleDefOf(acc.role);
              return (
                <li key={acc.id} className="grid grid-cols-1 gap-3 bg-black/15 px-4 py-3 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-5 flex items-center gap-3">
                    <Avatar account={acc} size="md" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[var(--rp-fg)]">
                          {acc.profile.displayName || acc.username}
                        </span>
                        <RoleBadge definition={def} />
                        {isSelf ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                            {t("you")}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-[var(--rp-muted)]">
                        @{acc.username} · {t("registeredOn")}{" "}
                        {new Date(acc.createdAt).toLocaleDateString(dateLocale)}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                      {t("role")}
                    </label>
                    <select
                      className="mt-1 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)]"
                      value={acc.role}
                      onChange={(e) => {
                        const r = setRole(acc.id, e.target.value);
                        setMsg(
                          r.ok
                            ? { ok: true, text: t("roleUpdated", { username: acc.username }) }
                            : { ok: false, text: r.error },
                        );
                      }}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                          {r.builtin ? "" : t("customSuffix")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 md:text-right">
                    <button
                      type="button"
                      className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                      onClick={() => {
                        if (!confirm(t("deleteConfirm", { username: acc.username }))) return;
                        const r = deleteAccount(acc.id);
                        setMsg(
                          r.ok
                            ? { ok: true, text: t("deleted", { username: acc.username }) }
                            : { ok: false, text: formatAccountError(te, r as AccountFailure) },
                        );
                      }}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[11px] leading-relaxed text-[var(--rp-muted)]">{t("footerHint")}</p>
      </CardBody>
    </Card>
  );
}
