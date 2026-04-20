import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountProvider } from "@/components/providers/AccountProvider";
import { SiteConfigProvider } from "@/components/providers/SiteConfigProvider";
import { OAuthSync } from "@/components/account/OAuthSync";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BetaBanner } from "@/components/layout/BetaBanner";
import { WelcomeBannerExtension } from "@/components/extensions/WelcomeBannerExtension";
import { ExtensionsHost } from "@/components/extensions/ExtensionsHost";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { defaultSiteConfig } from "@/config/default-site";
import { contentEN } from "@/i18n/content-en";
import { routing } from "@/i18n/routing";
import { UrlBoundIntlProvider } from "@/components/providers/UrlBoundIntlProvider";

/** URLs canoniques / Open Graph — plus de https://example.com en local. */
function metadataBaseUrl(): URL {
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (publicUrl) {
    try {
      return new URL(publicUrl);
    } catch {
      /* ignore */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

const heading = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: metadataBaseUrl(),
    title: {
      default: `${defaultSiteConfig.meta.siteName} — ${t("tagline")}`,
      template: `%s · ${defaultSiteConfig.meta.siteName}`,
    },
    description: t("description"),
    keywords:
      locale === "en" && Array.isArray(contentEN.meta?.keywords) && contentEN.meta.keywords.length > 0
        ? contentEN.meta.keywords
        : defaultSiteConfig.meta.keywords,
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
    openGraph: {
      title: defaultSiteConfig.meta.siteName,
      description: t("description"),
      images: [defaultSiteConfig.meta.ogImage ?? "/og-default.svg"],
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    icons: {
      icon: [
        { url: "/brand/icon.png", type: "image/png" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/brand/icon.png",
      apple: "/brand/icon.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${heading.variable} ${body.variable} min-h-screen bg-[var(--rp-bg)] text-[var(--rp-fg)] antialiased`}
      >
        <UrlBoundIntlProvider initialLocale={locale as "fr" | "en"}>
          <SiteConfigProvider>
            <AccountProvider>
              <Suspense fallback={null}>
                <OAuthSync />
              </Suspense>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <RoutePrefetcher />
              <WelcomeBannerExtension />
              <BetaBanner />
              <AnnouncementBar />
              <SiteHeader />
              <main className="isolate min-h-[60vh] pb-6 sm:pb-10">{children}</main>
              <SiteFooter />
              <ExtensionsHost />
            </AccountProvider>
          </SiteConfigProvider>
        </UrlBoundIntlProvider>
      </body>
    </html>
  );
}
