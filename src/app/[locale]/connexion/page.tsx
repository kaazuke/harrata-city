import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginClient } from "@/components/account/LoginClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "authPages" });
  return { title: t("loginTitle") };
}

export default function Page() {
  return <LoginClient />;
}
