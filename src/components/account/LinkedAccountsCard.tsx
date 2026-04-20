"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/components/providers/AccountProvider";
import { formatAccountError } from "@/lib/account/format-account-error";
import type { AccountFailure } from "@/lib/account/account-error-keys";
import { Card, CardBody } from "@/components/ui/Card";
import { OAuthButtons } from "@/components/account/OAuthButtons";
import { PROVIDER_LABELS } from "@/lib/account/types";
import type { OAuthProvider } from "@/lib/account/types";

const PROVIDERS: OAuthProvider[] = ["discord", "steam"];

export function LinkedAccountsCard() {
  const { user, unlinkOAuth } = useAccount();
  const t = useTranslations("authLinked");
  const te = useTranslations("accountErrors");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  return (
    <Card>
      <CardBody>
        <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">{t("title")}</h2>
        <p className="mt-1 text-xs text-[var(--rp-muted)]">{t("subtitle")}</p>

        <ul className="mt-4 space-y-2">
          {PROVIDERS.map((p) => {
            const link = user.oauth?.[p];
            return (
              <li
                key={p}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--rp-fg)]">{PROVIDER_LABELS[p]}</div>
                  {link ? (
                    <div className="mt-0.5 truncate text-[11px] text-[var(--rp-muted)]">
                      {link.username}
                      <span className="opacity-70">
                        {t("linkedOn")}
                        {new Date(link.linkedAt).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[11px] text-[var(--rp-muted)]">{t("notLinked")}</div>
                  )}
                </div>
                {link ? (
                  <button
                    type="button"
                    className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                    onClick={() => {
                      const r = unlinkOAuth(p);
                      setMsg(
                        r.ok
                          ? { ok: true, text: t("unlinked", { provider: PROVIDER_LABELS[p] }) }
                          : { ok: false, text: formatAccountError(te, r as AccountFailure) },
                      );
                    }}
                  >
                    {t("unlink")}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>

        {msg ? (
          <p
            className={`mt-3 text-xs ${
              msg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
            }`}
          >
            {msg.text}
          </p>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-[var(--rp-muted)]">{t("linkHeading")}</p>
          <OAuthButtons intent="link" />
        </div>
      </CardBody>
    </Card>
  );
}
