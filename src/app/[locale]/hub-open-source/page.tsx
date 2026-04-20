import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HubOpenSourceClient } from "@/components/marketing/HubOpenSourceClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hubOpenSource" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function HubOpenSourcePage() {
  return <HubOpenSourceClient />;
}
