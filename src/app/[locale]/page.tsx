import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/marketing/HomePage";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage />;
}
