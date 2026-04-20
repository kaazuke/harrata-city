"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHero } from "@/components/layout/PageHero";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { useAccount } from "@/components/providers/AccountProvider";
import { Avatar } from "@/components/account/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import type { StaffMember } from "@/config/types";
import type { Account, RoleDefinition } from "@/lib/account/types";
import { roleHasPermission } from "@/lib/account/types";

type StaffSource = "config" | "account";

type DisplayStaff = StaffMember & {
  source: StaffSource;
  account?: Account;
  /** @username (utilisé pour le profil et le dédoublonnage). */
  username?: string;
};

const TIER_ORDER: Record<StaffMember["tier"], number> = {
  founder: 0,
  admin: 1,
  mod: 2,
  dev: 3,
  support: 4,
};

function makeTierLabel(tiers: Record<string, string>) {
  return (t: StaffMember["tier"]) => {
    switch (t) {
      case "founder":
        return tiers.direction;
      case "admin":
        return tiers.administration;
      case "mod":
        return tiers.moderation;
      case "dev":
        return tiers.development;
      default:
        return tiers.support;
    }
  };
}

function tierTone(t: StaffMember["tier"]): "primary" | "accent" | "success" | "neutral" {
  if (t === "founder") return "accent";
  if (t === "admin") return "primary";
  if (t === "dev") return "success";
  return "neutral";
}

function tierFromRole(role: RoleDefinition): StaffMember["tier"] {
  if (role.tier === "admin") return "admin";
  if (role.tier === "moderator") return "mod";
  return "support";
}

function accountToStaff(
  acc: Account,
  role: RoleDefinition,
  defaultBios: { admin: string; moderator: string; member: string },
): DisplayStaff {
  const tier = tierFromRole(role);
  const display = acc.profile.displayName?.trim() || acc.username;
  const fallbackBio =
    role.tier === "admin"
      ? defaultBios.admin
      : role.tier === "moderator"
        ? defaultBios.moderator
        : defaultBios.member.replace("{role}", role.label);
  return {
    id: `acc:${acc.id}`,
    name: display,
    role: role.label,
    tier,
    avatarUrl: acc.profile.avatarDataUrl,
    bio: acc.profile.bio?.trim() || acc.profile.signature?.trim() || fallbackBio,
    source: "account",
    account: acc,
    username: acc.username,
  };
}

function dedupKey(s: DisplayStaff): string {
  if (s.username) return `u:${s.username.toLowerCase()}`;
  return `n:${s.name.trim().toLowerCase()}`;
}

export default function EquipePage() {
  const { config } = useLocalizedConfig();
  const { accounts, roleDefOf } = useAccount();
  const t = useTranslations("team");
  const locale = useLocale();
  const auto = config.modules.staffAutoFromAccounts !== false;

  const tierLabel = useMemo(
    () =>
      makeTierLabel({
        direction: t("tiers.direction"),
        administration: t("tiers.administration"),
        moderation: t("tiers.moderation"),
        development: t("tiers.development"),
        support: t("tiers.support"),
      }),
    [t],
  );

  const list = useMemo<DisplayStaff[]>(() => {
    const manual: DisplayStaff[] = (config.staff ?? []).map((m) => ({
      ...m,
      source: "config",
    }));

    if (!auto) return manual;

    const defaultBios = {
      admin: t("defaultBio.admin"),
      moderator: t("defaultBio.moderator"),
      member: t("defaultBio.member"),
    };

    const fromAccounts: DisplayStaff[] = accounts
      .map((a) => ({ acc: a, role: roleDefOf(a.role) }))
      .filter(({ role }) => roleHasPermission(role, "staff.show"))
      .map(({ acc, role }) => accountToStaff(acc, role, defaultBios));

    const seen = new Set(manual.map(dedupKey));
    const merged = [...manual];
    for (const s of fromAccounts) {
      const k = dedupKey(s);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(s);
    }
    return merged.sort((a, b) => {
      const tier = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (tier !== 0) return tier;
      return a.name.localeCompare(b.name, locale === "en" ? "en" : "fr", {
        sensitivity: "base",
      });
    });
  }, [config.staff, accounts, auto, roleDefOf, t, locale]);

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mx-auto max-w-7xl px-4 py-12">
        {list.length === 0 ? (
          <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-8 text-center text-sm text-[var(--rp-muted)]">
            {t("empty")}
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {list.map((m) => (
              <Card key={m.id}>
                <CardBody>
                  <div className="flex items-start gap-3">
                    {m.account ? (
                      <Avatar account={m.account} fallbackName={m.name} size="lg" />
                    ) : (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent text-sm font-black text-[var(--rp-fg)]">
                        {m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.avatarUrl}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          m.name.slice(0, 1).toUpperCase()
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--rp-fg)]">
                        {m.name}
                      </div>
                      {m.username ? (
                        <div className="truncate text-[11px] text-[var(--rp-muted)]">
                          @{m.username}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-[var(--rp-muted)]">
                        {m.role}
                      </div>
                      <div className="mt-2">
                        <Badge tone={tierTone(m.tier)}>{tierLabel(m.tier)}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--rp-muted)]">
                    {m.bio}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
