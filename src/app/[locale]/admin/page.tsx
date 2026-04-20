import { setRequestLocale } from "next-intl/server";
import { AdminClient } from "@/components/admin/AdminClient";

export default async function AdminPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminClient />;
}
