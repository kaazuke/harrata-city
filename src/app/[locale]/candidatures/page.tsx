"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/layout/PageHero";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useLocalizedConfig } from "@/components/providers/useLocalizedConfig";
import { Card, CardBody } from "@/components/ui/Card";

type Tab = "whitelist" | "staff" | "business";

export default function CandidaturesPage() {
  const { config } = useLocalizedConfig();
  const t = useTranslations("applications");
  const [tab, setTab] = useState<Tab>("whitelist");

  const tabs: { id: Tab; label: string; desc: string }[] = [
    { id: "whitelist", label: t("tabs.whitelist"), desc: t("tabs.whitelistDesc") },
    { id: "staff", label: t("tabs.staff"), desc: t("tabs.staffDesc") },
    { id: "business", label: t("tabs.business"), desc: t("tabs.businessDesc") },
  ];

  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === x.id
                  ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                  : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-[var(--rp-muted)]">
          {tabs.find((x) => x.id === tab)?.desc}
        </div>

        <Card className="mt-8">
          <CardBody>
            {tab === "whitelist" ? (
              <DynamicForm
                title={t("whitelistFormTitle")}
                description={t("whitelistFormHelp")}
                fields={config.forms.whitelist}
                endpoint="/api/forms"
                extraPayload={{ type: "whitelist" }}
              />
            ) : null}
            {tab === "staff" ? (
              <DynamicForm
                title={t("staffFormTitle")}
                fields={config.forms.staff}
                endpoint="/api/forms"
                extraPayload={{ type: "staff" }}
              />
            ) : null}
            {tab === "business" ? (
              <DynamicForm
                title={t("businessFormTitle")}
                fields={config.forms.business}
                endpoint="/api/forms"
                extraPayload={{ type: "business" }}
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
