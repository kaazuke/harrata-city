import type { ForumCategory } from "@/config/types";
import type { RoleDefinition } from "@/lib/account/types";
import { roleHasPermission } from "@/lib/account/types";

/**
 * Détermine si un utilisateur peut voir une catégorie.
 *
 * Règles :
 * - Sans `restrictedTo` (ou tableau vide) : visible par tout le monde.
 * - Avec `restrictedTo` non vide :
 *     - Quiconque a la permission `forum.access_private` voit tout.
 *     - Sinon, l'ID du rôle de l'utilisateur doit figurer dans la liste.
 */
export function canViewCategory(
  category: ForumCategory,
  role: RoleDefinition | undefined | null,
): boolean {
  const restricted = category.restrictedTo;
  if (!Array.isArray(restricted) || restricted.length === 0) return true;
  if (!role) return false;
  if (roleHasPermission(role, "forum.access_private")) return true;
  return restricted.includes(role.id);
}

export function visibleCategories<T extends ForumCategory>(
  categories: T[],
  role: RoleDefinition | undefined | null,
): T[] {
  return categories.filter((c) => canViewCategory(c, role));
}

export function isCategoryPrivate(category: ForumCategory): boolean {
  return Array.isArray(category.restrictedTo) && category.restrictedTo.length > 0;
}
