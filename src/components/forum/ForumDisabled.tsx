"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";

export function ForumDisabled() {
  const t = useTranslations("forum.disabled");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardBody className="text-center">
          <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)]">
            {t.rich("body", {
              admin: (chunks) => (
                <Link
                  href="/admin"
                  className="font-semibold text-[var(--rp-primary)] underline-offset-2 hover:underline"
                >
                  {chunks}
                </Link>
              ),
              mono: (chunks) => <span className="font-mono text-xs">{chunks}</span>,
            })}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline"
          >
            {t("backHome")}
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
