import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--rp-muted)]">
        {t("code")}
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--rp-fg)]">
        {t("title")}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--rp-muted)]">
        {t("description")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--rp-primary)] px-5 py-2.5 text-xs font-semibold text-[#041016] hover:brightness-110"
        >
          {t("home")}
        </Link>
        <Link
          href="/forum"
          className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-[var(--rp-fg)] hover:bg-white/10"
        >
          {t("forum")}
        </Link>
      </div>
    </div>
  );
}
