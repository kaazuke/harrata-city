"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";

/**
 * Switcher de langue compact : deux pastilles FR / EN.
 * Préserve la route actuelle (pathname) en changeant uniquement la locale.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("languageSwitcher");
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-[11px] font-semibold uppercase tracking-wider ${className ?? ""}`}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onSelect(code)}
            disabled={isPending}
            aria-pressed={active}
            aria-label={t(code)}
            className={`rounded-full px-2 py-1 transition ${
              active
                ? "bg-[#5eead4] text-[#06070d] shadow-sm"
                : "text-[var(--rp-fg-muted)] hover:bg-white/5 hover:text-white"
            } ${isPending ? "opacity-60" : ""}`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
