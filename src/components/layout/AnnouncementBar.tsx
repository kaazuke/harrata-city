"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { defaultSiteConfig } from "@/config/default-site";

const ROTATION_MS = 6000;

export function AnnouncementBar() {
  const { config } = useSiteConfig();
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const actives = useMemo(
    () => config.announcements.filter((a) => a.active),
    [config.announcements],
  );

  useEffect(() => {
    if (index >= actives.length) setIndex(0);
  }, [actives.length, index]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (actives.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % actives.length);
    }, ROTATION_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [actives.length, paused]);

  if (!config.modules.announcementBar) return null;
  if (actives.length === 0) return null;

  const current = actives[Math.min(index, actives.length - 1)];

  return (
    <div
      className="relative z-30 overflow-hidden border-b border-[color-mix(in_oklab,var(--rp-primary)_25%,var(--rp-border))] bg-gradient-to-r from-black/50 via-[color-mix(in_oklab,var(--rp-primary)_10%,black)] to-black/50 px-4 py-2.5 text-center text-xs text-[var(--rp-fg)] sm:text-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Annonces"
    >
      <div
        key={`${index}-${current.id ?? current.text}`}
        className="rp-announce-anim inline-flex max-w-full items-center gap-2"
      >
        <span className="rounded-full bg-[var(--rp-primary)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--rp-primary)]">
          {lc.announcementBadge}
        </span>
        <span className="text-[var(--rp-muted)]">|</span>
        <span className="text-balance">{current.text}</span>
      </div>

      {actives.length > 1 ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 pb-0.5">
          {actives.map((a, i) => (
            <button
              key={a.id ?? `${a.text}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-[var(--rp-primary)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Annonce ${i + 1} sur ${actives.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
