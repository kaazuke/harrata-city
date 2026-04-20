"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function RulesClient() {
  const { config } = useLocalizedConfig();
  const t = useTranslations("rules");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return config.rules;
    }
    return config.rules
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => it.toLowerCase().includes(query)),
      }))
      .filter(
        (cat) =>
          cat.title.toLowerCase().includes(query) || cat.items.length > 0,
      );
  }, [config.rules, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="max-w-xl">
        <label className="text-xs font-semibold text-[var(--rp-muted)]">
          {t("searchLabel")}
        </label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="mt-2"
        />
      </div>

      <div className="mt-10 space-y-6">
        {filtered.map((cat) => (
          <div key={cat.id} id={cat.id}>
            <Card>
            <CardBody>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--rp-fg)]">
                {cat.title}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--rp-muted)]">
                {cat.items.map((it, idx) => (
                  <li key={idx} id={`${cat.id}-${idx}`}>
                    {it}
                  </li>
                ))}
              </ul>
            </CardBody>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-10 text-xs text-[var(--rp-muted)]">
        {t.rich("anchorHint", {
          example: (chunks) => <span className="font-mono">{chunks}</span>,
        })}
      </div>
    </div>
  );
}
