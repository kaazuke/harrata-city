"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-[var(--rp-fg,#e8edf7)]">{t("title")}</h1>
      <p className="text-sm text-[var(--rp-muted,#94a3b8)]">
        {error.message || t("unknown")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-teal-400/90 px-4 py-2 text-sm font-semibold text-black"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-[var(--rp-fg,#e8edf7)]"
        >
          {t("home")}
        </Link>
      </div>
      <p className="text-xs text-[var(--rp-muted,#94a3b8)]">
        {t.rich("storageHint", {
          key: (chunks) => <span className="font-mono">{chunks}</span>,
        })}
      </p>
    </div>
  );
}
