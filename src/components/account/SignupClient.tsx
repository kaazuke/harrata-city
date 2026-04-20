"use client";

import { Link, useRouter } from "@/i18n/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "@/components/providers/AccountProvider";
import { formatAccountError } from "@/lib/account/format-account-error";
import type { AccountFailure } from "@/lib/account/account-error-keys";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { OAuthButtons } from "@/components/account/OAuthButtons";

export function SignupClient() {
  const router = useRouter();
  const { register, accounts, ready } = useAccount();
  const t = useTranslations("authPages.signup");
  const tPages = useTranslations("authPages");
  const te = useTranslations("accountErrors");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr(t("passwordMismatch"));
      return;
    }
    setBusy(true);
    const r = await register(username, password);
    setBusy(false);
    if (!r.ok) {
      setErr(formatAccountError(te, r as AccountFailure));
      return;
    }
    router.push("/compte");
  }

  return (
    <div>
      <PageHero
        eyebrow={tPages("communityEyebrow")}
        title={tPages("signupTitle")}
        subtitle={t("subtitle")}
      />
      <div className="mx-auto max-w-md px-4 py-10">
        {ready && accounts.length === 0 ? (
          <p className="mb-4 rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_10%,transparent)] px-4 py-3 text-xs text-[var(--rp-fg)]">
            {t("firstAdminHintBefore")}
            <span className="font-semibold">{t("firstAdminHintBold")}</span>
            {t("firstAdminHintAfter")}
          </p>
        ) : null}
        <Card>
          <CardBody>
            <OAuthButtons intent="register" />
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--rp-border)]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                {t("divider")}
              </span>
              <div className="h-px flex-1 bg-[var(--rp-border)]" />
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("username")}</label>
                <Input
                  className="mt-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[A-Za-z0-9_-]+"
                  placeholder="ex. astra_77"
                />
                <p className="mt-1 text-[11px] text-[var(--rp-muted)]">{t("usernameHint")}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("password")}</label>
                <Input
                  className="mt-2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("confirm")}</label>
                <Input
                  className="mt-2"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {err ? <p className="text-xs text-[var(--rp-danger)]">{err}</p> : null}
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? t("submitBusy") : t("submit")}
              </Button>
              <p className="text-center text-xs text-[var(--rp-muted)]">
                {t("hasAccount")}{" "}
                <Link href="/connexion" className="font-semibold text-[var(--rp-primary)] hover:underline">
                  {t("loginLink")}
                </Link>
              </p>
            </form>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--rp-muted)]">{t("disclaimer")}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
