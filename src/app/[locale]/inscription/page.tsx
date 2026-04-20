import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignupClient } from "@/components/account/SignupClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "authPages" });
  return { title: t("signupTitle") };
}

export default function Page() {
  return <SignupClient />;
}
