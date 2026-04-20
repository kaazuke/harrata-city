"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

const ALWAYS = ["/", "/presentation", "/reglement", "/candidatures", "/boutique", "/equipe", "/actualites", "/galerie", "/statistiques", "/contact", "/forum", "/connexion", "/inscription", "/compte"];

/**
 * Prefetch silencieux des routes principales pour rendre la navigation instantanée.
 * S’exécute une fois après l’hydratation, en idle (pas de blocage).
 */
export function RoutePrefetcher() {
  const router = useRouter();
  const { config } = useSiteConfig();

  useEffect(() => {
    const navHrefs = (config.nav ?? [])
      .filter((n) => n.enabled)
      .map((n) => n.href)
      .filter((h): h is string => typeof h === "string" && h.startsWith("/"));

    const set = new Set<string>([...ALWAYS, ...navHrefs]);
    const targets = Array.from(set);

    type Idle = (cb: () => void, opts?: { timeout?: number }) => number;
    const w = window as unknown as { requestIdleCallback?: Idle };
    const schedule = w.requestIdleCallback
      ? (cb: () => void) => w.requestIdleCallback!(cb, { timeout: 2500 })
      : (cb: () => void) => window.setTimeout(cb, 200);

    schedule(() => {
      for (const href of targets) {
        try {
          router.prefetch(href);
        } catch {
          /* ignore */
        }
      }
    });
  }, [router, config.nav]);

  return null;
}
