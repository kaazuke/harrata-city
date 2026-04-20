"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { BUILTIN_ROLE_DEFINITIONS, PERMISSIONS } from "@/lib/account/types";
import type { Permission, RoleDefinition, RoleTier, RoleTone } from "@/lib/account/types";

const TONE_VALUES: RoleTone[] = [
  "neutral",
  "primary",
  "accent",
  "success",
  "warning",
  "danger",
];

const TIER_VALUES: RoleTier[] = ["admin", "moderator", "member"];

function permMsgKey(perm: Permission): string {
  return perm.replace(/\./g, "_");
}

function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
    .slice(0, 32);
}

export function AdminRolesTab() {
  const t = useTranslations("admin.roles");
  const tPerm = useTranslations("admin.permissions");
  const { config, setConfig } = useSiteConfig();
  const { accounts } = useAccount();
  const roles = useMemo<RoleDefinition[]>(
    () =>
      Array.isArray(config.roles) && config.roles.length > 0
        ? config.roles
        : BUILTIN_ROLE_DEFINITIONS,
    [config.roles],
  );

  const [newLabel, setNewLabel] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const usageByRole = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of accounts) {
      map.set(a.role, (map.get(a.role) ?? 0) + 1);
    }
    return map;
  }, [accounts]);

  function updateRole(id: string, patch: Partial<RoleDefinition>) {
    const next = roles.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setConfig({ ...config, roles: next });
  }

  function togglePermission(id: string, perm: Permission) {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    const has = role.permissions.includes(perm);
    const nextPerms = has
      ? role.permissions.filter((p) => p !== perm)
      : [...role.permissions, perm];
    updateRole(id, { permissions: nextPerms });
  }

  function addRole() {
    setMsg(null);
    const label = newLabel.trim();
    if (!label) {
      setMsg({ ok: false, text: t("errName") });
      return;
    }
    let id = slugify(label);
    if (!id) {
      setMsg({ ok: false, text: t("errInvalidName") });
      return;
    }
    if (roles.some((r) => r.id === id)) {
      const base = id;
      let i = 2;
      while (roles.some((r) => r.id === `${base}_${i}`) && i < 999) i++;
      id = `${base}_${i}`;
    }
    const role: RoleDefinition = {
      id,
      label,
      tone: "neutral",
      tier: "member",
      permissions: ["forum.post", "forum.reply", "forum.react"],
      builtin: false,
    };
    setConfig({ ...config, roles: [...roles, role] });
    setNewLabel("");
    setMsg({ ok: true, text: t("created", { label }) });
  }

  function removeRole(id: string) {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    if (role.builtin) {
      setMsg({ ok: false, text: t("errBuiltinDelete") });
      return;
    }
    const usage = usageByRole.get(id) ?? 0;
    const ok = confirm(
      usage > 0
        ? t("confirmDeleteWithUsers", { label: role.label, usage })
        : t("confirmDelete", { label: role.label }),
    );
    if (!ok) return;
    setConfig({ ...config, roles: roles.filter((r) => r.id !== id) });
    setMsg({ ok: true, text: t("deleted", { label: role.label }) });
  }

  return (
    <Card>
      <CardHeader title={t("title")} subtitle={t("subtitle")} />
      <CardBody className="space-y-6">
        {msg ? (
          <p
            className={`text-xs ${msg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"}`}
          >
            {msg.text}
          </p>
        ) : null}

        <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
            {t("newRole")}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("label")}</label>
              <Input
                className="mt-1.5"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={t("placeholderNew")}
                maxLength={40}
              />
            </div>
            <Button type="button" onClick={addRole}>
              {t("addRole")}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {roles.map((role) => {
            const usage = usageByRole.get(role.id) ?? 0;
            return (
              <div
                key={role.id}
                className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--rp-fg)]">
                        {role.label || role.id}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--rp-muted)]">
                        {role.id}
                      </span>
                      {role.builtin ? (
                        <span className="rounded-full border border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_12%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-primary)]">
                          {t("builtin")}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-[var(--rp-muted)]">
                        {t("accountsAssigned", { count: usage })}
                      </span>
                    </div>
                    {role.description ? (
                      <p className="mt-1 text-xs text-[var(--rp-muted)]">{role.description}</p>
                    ) : null}
                  </div>
                  {!role.builtin ? (
                    <button
                      type="button"
                      className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                      onClick={() => removeRole(role.id)}
                    >
                      {t("delete")}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("label")}</label>
                    <Input
                      className="mt-1.5"
                      value={role.label}
                      onChange={(e) => updateRole(role.id, { label: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("tier")}</label>
                    <select
                      className="mt-1.5 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)] disabled:opacity-60"
                      value={role.tier}
                      disabled={role.builtin}
                      onChange={(e) =>
                        updateRole(role.id, { tier: e.target.value as RoleTier })
                      }
                    >
                      {TIER_VALUES.map((tier) => (
                        <option key={tier} value={tier}>
                          {t(`tiers.${tier}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      {t("badgeColor")}
                    </label>
                    <select
                      className="mt-1.5 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)]"
                      value={role.tone}
                      onChange={(e) =>
                        updateRole(role.id, { tone: e.target.value as RoleTone })
                      }
                    >
                      {TONE_VALUES.map((tone) => (
                        <option key={tone} value={tone}>
                          {t(`tones.${tone}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      {t("descOptional")}
                    </label>
                    <Textarea
                      className="mt-1.5 min-h-[3rem]"
                      value={role.description ?? ""}
                      onChange={(e) =>
                        updateRole(role.id, { description: e.target.value || undefined })
                      }
                      placeholder={t("descPlaceholder")}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                    {t("permissions")}
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {PERMISSIONS.map((perm) => {
                      const checked = role.permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_8%,transparent)] text-[var(--rp-fg)]"
                              : "border-[var(--rp-border)] bg-black/20 text-[var(--rp-muted)]"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block">{tPerm(permMsgKey(perm))}</span>
                            <span className="mt-0.5 block font-mono text-[10px] text-[var(--rp-muted)]">
                              {perm}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(role.id, perm)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
