import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Helpers de navigation locale-aware pour remplacer les imports de `next/link` et `next/navigation`
 * lorsque l'URL doit rester cohérente avec la langue active.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
