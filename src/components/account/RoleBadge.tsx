"use client";

import { Badge } from "@/components/ui/Badge";
import { useAccount } from "@/components/providers/AccountProvider";
import type { AccountRole, RoleDefinition, RoleTone } from "@/lib/account/types";

const TONE_TO_BADGE: Record<RoleTone, "primary" | "neutral" | "accent" | "success" | "warning" | "danger"> = {
  neutral: "neutral",
  primary: "primary",
  accent: "accent",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function RoleBadge({
  role,
  definition,
}: {
  /** Soit l'ID du rôle (la def sera résolue via le contexte). */
  role?: AccountRole;
  /** Soit la définition complète (utilisée en priorité). */
  definition?: RoleDefinition;
}) {
  const { roleDefOf } = useAccount();
  const def = definition ?? roleDefOf(role);
  return (
    <Badge tone={TONE_TO_BADGE[def.tone] ?? "neutral"}>{def.label}</Badge>
  );
}
