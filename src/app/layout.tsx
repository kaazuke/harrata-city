import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
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

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: `${defaultSiteConfig.meta.siteName} — Hub communautaire FiveM RP`,
    template: `%s · ${defaultSiteConfig.meta.siteName}`,
  },
  description: defaultSiteConfig.meta.description,
  keywords: defaultSiteConfig.meta.keywords,
  openGraph: {
    title: defaultSiteConfig.meta.siteName,
    description: defaultSiteConfig.meta.description,
    images: [defaultSiteConfig.meta.ogImage ?? "/og-default.svg"],
  },
  /* Favicon Harrata City — monogramme HC (PNG haute déf) + fallback SVG. */
  icons: {
    icon: [
      { url: "/brand/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/icon.png",
    apple: "/brand/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${heading.variable} ${body.variable} min-h-screen bg-[var(--rp-bg)] text-[var(--rp-fg)] antialiased`}
      >
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
      </body>
    </html>
  );
}
