import { setRequestLocale } from "next-intl/server";

/**
 * next-intl : pour le rendu statique, la locale doit être enregistrée dans chaque
 * arbre layout/page pouvant être pré-rendu indépendamment (voir doc « Static rendering »).
 * Sans cela, `/en/admin` peut recevoir les messages de `defaultLocale` (fr).
 */
export default async function AdminLocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
