/* ─────────────── Rôles & permissions ─────────────── */

/** ID d’un rôle (libre, mais 3 IDs réservés pour la hiérarchie de base). */
export type AccountRole = string;

export const BUILTIN_ROLE_IDS = ["admin", "moderator", "member"] as const;
export type BuiltinRoleId = (typeof BUILTIN_ROLE_IDS)[number];

/** Tier hiérarchique : permet aux composants de comparer rapidement. */
export type RoleTier = "admin" | "moderator" | "member";

export const PERMISSIONS = [
  "forum.post",
  "forum.reply",
  "forum.react",
  "forum.moderate",
  "forum.access_private",
  "admin.access",
  "admin.manage_users",
  "admin.manage_roles",
  "admin.manage_site",
  "staff.show",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "forum.post": "Forum : créer un sujet",
  "forum.reply": "Forum : répondre",
  "forum.react": "Forum : réagir (emoji)",
  "forum.moderate": "Forum : modérer (épingler / verrouiller / supprimer)",
  "forum.access_private": "Forum : accéder aux catégories privées",
  "admin.access": "Panneau admin : accéder",
  "admin.manage_users": "Panneau admin : gérer les utilisateurs",
  "admin.manage_roles": "Panneau admin : gérer les rôles",
  "admin.manage_site": "Panneau admin : modifier la configuration du site",
  "staff.show": "Apparaître automatiquement dans la page Équipe",
};

export type RoleTone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";

export interface RoleDefinition {
  id: string;
  label: string;
  description?: string;
  tone: RoleTone;
  /** Couleur d’accent pour la carte staff (CSS color, optionnel). */
  color?: string;
  tier: RoleTier;
  permissions: Permission[];
  /** Builtin = ne peut pas être supprimé, mais reste éditable. */
  builtin?: boolean;
}

export const BUILTIN_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Toutes les permissions, gestion complète du site.",
    tone: "primary",
    tier: "admin",
    builtin: true,
    permissions: [...PERMISSIONS],
  },
  {
    id: "moderator",
    label: "Modérateur",
    description: "Modération du forum et accès aux catégories privées.",
    tone: "warning",
    tier: "moderator",
    builtin: true,
    permissions: [
      "forum.post",
      "forum.reply",
      "forum.react",
      "forum.moderate",
      "forum.access_private",
      "staff.show",
    ],
  },
  {
    id: "member",
    label: "Membre",
    description: "Permissions de base : publier, répondre, réagir.",
    tone: "neutral",
    tier: "member",
    builtin: true,
    permissions: ["forum.post", "forum.reply", "forum.react"],
  },
];

export function findRoleDefinition(
  roles: RoleDefinition[] | undefined,
  roleId: AccountRole | undefined | null,
): RoleDefinition {
  const list = Array.isArray(roles) && roles.length > 0 ? roles : BUILTIN_ROLE_DEFINITIONS;
  if (roleId) {
    const hit = list.find((r) => r.id === roleId);
    if (hit) return hit;
  }
  return list.find((r) => r.id === "member") ?? BUILTIN_ROLE_DEFINITIONS[2];
}

export function roleHasPermission(
  role: RoleDefinition | undefined | null,
  perm: Permission,
): boolean {
  if (!role) return false;
  return role.permissions.includes(perm);
}

export function canModerate(role: RoleDefinition | undefined | null): boolean {
  return roleHasPermission(role, "forum.moderate");
}

export function isAdminRole(role: RoleDefinition | undefined | null): boolean {
  return roleHasPermission(role, "admin.access");
}

/* ─────────────── OAuth & Account ─────────────── */

export type OAuthProvider = "discord" | "steam";

export interface AccountProfile {
  displayName?: string;
  avatarDataUrl?: string;
  bannerDataUrl?: string;
  bio?: string;
  color?: string;
  signature?: string;
}

export interface AccountOAuthLink {
  id: string;
  username: string;
  avatarUrl?: string;
  linkedAt: string;
}

export interface Account {
  id: string;
  username: string;
  usernameLower: string;
  passwordHash?: string;
  passwordSalt?: string;
  /** ID de rôle (libre, mais doit exister dans `siteConfig.roles`). */
  role: AccountRole;
  createdAt: string;
  profile: AccountProfile;
  oauth?: Partial<Record<OAuthProvider, AccountOAuthLink>>;
}

export const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  discord: "Discord",
  steam: "FiveM (Steam)",
};

export interface AccountStore {
  version: 1;
  accounts: Account[];
  currentUserId: string | null;
}
