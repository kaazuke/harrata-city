"use client";

import { useTranslations } from "next-intl";
import { PageHero } from "@/components/layout/PageHero";
import { RulesClient } from "@/components/rules/RulesClient";

export default function ReglementPage() {
  const t = useTranslations("rules");
  return (
    <div>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <RulesClient />
    </div>
  );
}
