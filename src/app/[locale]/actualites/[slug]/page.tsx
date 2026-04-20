import { ArticleClient } from "@/components/blog/ArticleClient";
import { defaultSiteConfig } from "@/config/default-site";

export function generateStaticParams() {
  return defaultSiteConfig.articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleClient slug={slug} />;
}
