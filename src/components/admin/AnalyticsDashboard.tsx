"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  buildSummary,
  clearAnalytics,
  type AnalyticsSummary,
} from "@/lib/extensions/analytics-store";

/**
 * Mini-dashboard d'analytics, affiché dans `AdminExtensionsTab` quand
 * l'extension `analytics-pageviews` est installée.
 */
export function AnalyticsDashboard() {
  const t = useTranslations("admin.analytics");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSummary(buildSummary());
  }, [tick]);

  if (!summary) return null;

  const maxDay = Math.max(1, ...summary.daily.map((d) => d.count));

  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[var(--rp-fg)]">{t("title")}</h4>
          <p className="mt-0.5 text-[11px] text-[var(--rp-muted)]">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setTick((x) => x + 1)}>
            {t("refresh")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (!confirm(t("confirmClear"))) return;
              clearAnalytics();
              setTick((x) => x + 1);
            }}
          >
            {t("reset")}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label={t("totalViews")} value={summary.totalViews} />
        <Stat label={t("sessions")} value={summary.uniqueSessions} />
        <Stat label={t("hours24")} value={summary.last24h} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
            {t("topPages")}
          </p>
          {summary.topPages.length === 0 ? (
            <p className="text-xs text-[var(--rp-muted)]">{t("emptyViews")}</p>
          ) : (
            <ul className="space-y-1">
              {summary.topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between gap-2 rounded border border-white/5 bg-black/20 px-2 py-1 text-xs"
                >
                  <span className="truncate font-mono text-[var(--rp-fg)]">{p.path}</span>
                  <span className="shrink-0 tabular-nums text-[var(--rp-muted)]">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
            {t("last14Days")}
          </p>
          {summary.daily.length === 0 ? (
            <p className="text-xs text-[var(--rp-muted)]">—</p>
          ) : (
            <div className="flex h-24 items-end gap-1">
              {summary.daily.map((d) => (
                <div
                  key={d.day}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={t("viewsOnDay", { day: d.day, count: d.count })}
                >
                  <div
                    className="w-full rounded-sm bg-[var(--rp-primary)] transition-[height]"
                    style={{ height: `${Math.max((d.count / maxDay) * 100, 4)}%` }}
                  />
                  <span className="text-[8px] text-[var(--rp-muted)]">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--rp-radius)] border border-white/8 bg-black/25 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--rp-fg)]">
        {value}
      </p>
    </div>
  );
}
