"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { isExtensionEnabled } from "@/lib/extensions/manage";
import {
  recordPageView,
  startSession,
} from "@/lib/extensions/analytics-store";

/**
 * Tracker invisible. Quand l'extension `analytics-pageviews` est activée,
 * incrémente un compteur localStorage à chaque changement de pathname.
 * Aucun appel réseau, aucune persistance autre que ce navigateur.
 */
export function AnalyticsTrackerExtension() {
  const { config } = useSiteConfig();
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const enabled = isExtensionEnabled(config, "analytics-pageviews");

  useEffect(() => {
    if (!enabled) return;
    startSession();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!pathname) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    recordPageView(pathname);
  }, [enabled, pathname]);

  return null;
}
