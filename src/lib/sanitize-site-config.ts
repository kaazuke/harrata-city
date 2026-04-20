import type { SiteConfig } from "@/config/types";
import { BUILTIN_ROLE_DEFINITIONS, BUILTIN_ROLE_IDS } from "@/lib/account/types";
import type { RoleDefinition } from "@/lib/account/types";

/** Segments des anciens gabarits à retirer (insensible à la casse). */
const LEGACY_SUBSTRINGS = [
  "example.com",
  "example.tebex.io",
  "discord.gg/example",
  "cfx.re/join/example",
  "nexusrp.example",
  "support@nexusrp.example",
] as const;

/**
 * Anciennes URLs Unsplash supprimées de leur CDN → on les remappe vers une URL valide.
 */
const DEAD_IMAGE_REPLACEMENTS: Record<string, string> = {
  "photo-1503376780353-7e66927667b7":
    "photo-1502920917128-1aa500764cbd",
};

function migrateImageUrl(value: string | undefined): string | undefined {
  if (!value || typeof value !== "string") return value;
  for (const [dead, alive] of Object.entries(DEAD_IMAGE_REPLACEMENTS)) {
    if (value.includes(dead)) {
      return value.replace(dead, alive);
    }
  }
  return value;
}

function scrubUrl(value: string | undefined): { next: string; hit: boolean } {
  if (!value || typeof value !== "string") return { next: "", hit: false };
  const lower = value.toLowerCase();
  const hit = LEGACY_SUBSTRINGS.some((s) => lower.includes(s));
  return { next: hit ? "" : value, hit };
}

/**
 * Retire les liens / emails de démo d’une config (souvent après fusion avec
 * d’anciennes données `localStorage`). Ne touche pas au contenu markdown.
 */
export function sanitizeSiteConfig(input: SiteConfig): { config: SiteConfig; changed: boolean } {
  const c = structuredClone(input) as SiteConfig;
  let changed = false;

  const bump = (before: string | undefined, after: string | undefined) => {
    if (before !== after) changed = true;
  };

  {
    const { next, hit } = scrubUrl(c.social.discord);
    if (hit) {
      bump(c.social.discord, next);
      c.social.discord = next;
    }
  }
  for (const key of ["cfx", "tebex", "youtube", "steam", "tiktok"] as const) {
    const before = c.social[key];
    if (typeof before !== "string") continue;
    const { next, hit } = scrubUrl(before);
    if (hit) {
      bump(before, next || undefined);
      c.social[key] = next || undefined;
    }
  }

  {
    const { next, hit } = scrubUrl(c.server.ip);
    if (hit) {
      bump(c.server.ip, next);
      c.server.ip = next;
    }
  }
  if (typeof c.server.cfxJoinUrl === "string") {
    const { next, hit } = scrubUrl(c.server.cfxJoinUrl);
    if (hit) {
      bump(c.server.cfxJoinUrl, next || undefined);
      c.server.cfxJoinUrl = next || undefined;
    }
  }

  if (c.contact.supportEmail) {
    const { next, hit } = scrubUrl(c.contact.supportEmail);
    if (hit) {
      bump(c.contact.supportEmail, next || undefined);
      c.contact.supportEmail = next || undefined;
    }
  }
  if (c.contact.ticketDiscordChannel) {
    const { next, hit } = scrubUrl(c.contact.ticketDiscordChannel);
    if (hit) {
      bump(c.contact.ticketDiscordChannel, next || undefined);
      c.contact.ticketDiscordChannel = next || undefined;
    }
  }

  const store = c.integrations?.tebex?.storeBaseUrl;
  if (typeof store === "string") {
    const { next, hit } = scrubUrl(store);
    if (hit) {
      bump(store, next);
      c.integrations.tebex.storeBaseUrl = next;
    }
  }

  for (const p of c.boutiqueProducts ?? []) {
    if (!p.tebexUrl) continue;
    const { hit } = scrubUrl(p.tebexUrl);
    if (hit) {
      bump(p.tebexUrl, undefined);
      delete p.tebexUrl;
    }
  }

  for (const item of c.gallery ?? []) {
    const next = migrateImageUrl(item.src);
    if (next && next !== item.src) {
      changed = true;
      item.src = next;
    }
  }

  // Migration : s'assurer que les 3 rôles builtin existent toujours.
  {
    const existing = Array.isArray(c.roles) ? c.roles : [];
    const byId = new Map(existing.map((r) => [r.id, r] as const));
    let mutated = !Array.isArray(c.roles);
    const merged: RoleDefinition[] = [];
    for (const builtin of BUILTIN_ROLE_DEFINITIONS) {
      const current = byId.get(builtin.id);
      if (!current) {
        merged.push(builtin);
        mutated = true;
      } else {
        // Force `builtin: true` et conserve toutes les autres modifs utilisateur.
        if (!current.builtin || current.tier !== builtin.tier) {
          mutated = true;
        }
        merged.push({ ...current, builtin: true, tier: builtin.tier });
      }
    }
    for (const r of existing) {
      if (!BUILTIN_ROLE_IDS.includes(r.id as (typeof BUILTIN_ROLE_IDS)[number])) {
        merged.push({ ...r, builtin: false });
      }
    }
    if (mutated) {
      changed = true;
      c.roles = merged;
    }
  }

  if (Array.isArray(c.staff) && c.staff.length > 0) {
    const filtered = c.staff.filter((s) => !isDemoStaff(s.id, s.name));
    if (filtered.length !== c.staff.length) {
      changed = true;
      c.staff = filtered;
    }
  }

  return { config: c, changed };
}

const DEMO_STAFF_IDS = new Set(["s1", "s2", "s3", "s4"]);
const DEMO_STAFF_NAMES = new Set(["astra", "kade", "mira", "jun"]);

function isDemoStaff(id: string | undefined, name: string | undefined): boolean {
  if (id && DEMO_STAFF_IDS.has(id)) return true;
  if (name && DEMO_STAFF_NAMES.has(name.trim().toLowerCase())) return true;
  return false;
}
