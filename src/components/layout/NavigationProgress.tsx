"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Barre fine en haut qui s’anime à chaque changement de route.
 * Pas de dépendance externe : on simule la progression jusqu’à 90 %,
 * puis on termine quand la nouvelle route est rendue.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const key = `${pathname}?${sp?.toString() ?? ""}`;

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);
  const lastKey = useRef<string>(key);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      lastKey.current = key;
      return;
    }
    if (key === lastKey.current) return;
    lastKey.current = key;

    setVisible(true);
    setProgress(8);
    let p = 8;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      p = Math.min(90, p + (90 - p) * 0.18 + 1);
      setProgress(p);
    }, 110);

    const finish = window.setTimeout(() => {
      if (timer.current) window.clearInterval(timer.current);
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220);
    }, 350);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
      window.clearTimeout(finish);
    };
  }, [key]);

  function trigger() {
    setVisible(true);
    setProgress((p) => (p < 8 ? 8 : p));
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const dest = new URL(link.href, window.location.href);
        if (dest.origin !== window.location.origin) return;
        if (dest.pathname === window.location.pathname && dest.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }
      trigger();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[2000] h-[3px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="h-full origin-left rounded-r-full bg-gradient-to-r from-[var(--rp-primary)] via-[var(--rp-secondary)] to-[var(--rp-accent)] shadow-[0_0_12px_rgba(99,209,255,0.55)]"
        style={{
          width: `${progress}%`,
          transition:
            progress === 0
              ? "none"
              : progress >= 100
                ? "width 200ms ease-out"
                : "width 220ms ease-out",
        }}
      />
    </div>
  );
}
