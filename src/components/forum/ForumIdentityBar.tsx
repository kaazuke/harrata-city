"use client";

import Link from "next/link";
import { useAccount } from "@/components/providers/AccountProvider";
import { Avatar } from "@/components/account/Avatar";
import { RoleBadge } from "@/components/account/RoleBadge";

export function ForumIdentityBar() {
  const { ready, user } = useAccount();

  if (!ready) {
    return (
      <div
        className="h-12 animate-pulse rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-white/[0.04]"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_75%,transparent)] px-4 py-3 text-sm">
        <div className="text-[var(--rp-muted)]">
          Vous n’êtes pas connecté. Créez un compte pour publier sur le forum.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/connexion"
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-[var(--rp-fg)] hover:bg-white/10"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-[var(--rp-primary)] px-3 py-1.5 text-xs font-semibold text-[#041016] hover:brightness-110"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_75%,transparent)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar account={user} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-[var(--rp-fg)]">
              {user.profile.displayName || user.username}
            </span>
            <RoleBadge role={user.role} />
          </div>
          <div className="text-[11px] text-[var(--rp-muted)]">@{user.username}</div>
        </div>
      </div>
      <Link
        href="/compte"
        className="text-xs font-semibold text-[var(--rp-primary)] hover:underline"
      >
        Modifier mon profil
      </Link>
    </div>
  );
}
