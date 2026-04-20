"use client";

import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

export function StatsBars() {
  const { config } = useSiteConfig();
  const max = Math.max(1, ...config.statSeries.map((s) => s.value));
  return (
    <div className="mt-6">
      <div className="flex h-44 items-end gap-2">
        {config.statSeries.map((s) => {
          const h = Math.round((s.value / max) * 100);
          return (
            <div key={s.label} className="flex-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[var(--rp-primary)]/15 to-[color-mix(in_oklab,var(--rp-primary)_55%,transparent)]"
                style={{ height: `${Math.max(10, h)}%` }}
                title={`${s.label}: ${s.value}`}
              />
              <div className="mt-2 text-center text-[10px] font-semibold text-[var(--rp-muted)]">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
