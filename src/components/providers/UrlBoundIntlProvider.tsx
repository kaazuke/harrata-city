"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";

type Locale = "fr" | "en";

function pickLocale(pathname: string, paramsLocale: unknown, initial: Locale): Locale {
  const seg0 = pathname.split("/").filter(Boolean)[0];
  if (seg0 === "en" || seg0 === "fr") return seg0;
  const p = paramsLocale;
  const raw = Array.isArray(p) ? p[0] : p;
  if (raw === "en" || raw === "fr") return raw;
  return initial === "en" || initial === "fr" ? initial : "fr";
}

/** Premier segment de l’URL réelle du navigateur (fiable quand le hook pathname omet la locale). */
function readLocaleFromWindow(): Locale | null {
  if (typeof window === "undefined") return null;
  const s = window.location.pathname.split("/").filter(Boolean)[0];
  return s === "en" || s === "fr" ? s : null;
}

/**
 * Lie les traductions à l’URL réelle. Priorité :
 * 1) barre d’adresse (`window.location`) — évite le blocage si `usePathname()` ne
 *    contient pas le segment `[locale]` (même valeur entre /en/… et /fr/…).
 * 2) hooks Next + params + initial serveur.
 */
export function UrlBoundIntlProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const params = useParams();
  const pathname = usePathname();

  const resolve = useCallback((): Locale => {
    const fromWin = readLocaleFromWindow();
    if (fromWin) return fromWin;
    return pickLocale(pathname ?? "", params?.locale, initialLocale);
  }, [pathname, params?.locale, initialLocale]);

  const [locale, setLocale] = useState<Locale>(initialLocale);

  useLayoutEffect(() => {
    setLocale(resolve());
  }, [resolve]);

  useEffect(() => {
    const sync = () => setLocale(resolve());
    const nav = (window as Window & { navigation?: { addEventListener?: (ev: string, fn: () => void) => void; removeEventListener?: (ev: string, fn: () => void) => void } }).navigation;
    nav?.addEventListener?.("navigate", sync);
    window.addEventListener("popstate", sync);
    return () => {
      nav?.removeEventListener?.("navigate", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [resolve]);

  const messages = useMemo(
    () => (locale === "en" ? en : fr) as unknown as AbstractIntlMessages,
    [locale],
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
