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



export function LoginClient() {

  const router = useRouter();

  const { login } = useAccount();

  const t = useTranslations("authPages.login");

  const tPages = useTranslations("authPages");

  const te = useTranslations("accountErrors");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);



  async function submit(e: FormEvent) {

    e.preventDefault();

    setErr(null);

    setBusy(true);

    const r = await login(username, password);

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

        title={t("title")}

        subtitle={t("subtitle")}

      />

      <div className="mx-auto max-w-md space-y-4 px-4 py-10">

        <Card>

          <CardBody>

            <OAuthButtons intent="login" />

            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-[var(--rp-border)]" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">

                {tPages("signup.divider")}

              </span>

              <div className="h-px flex-1 bg-[var(--rp-border)]" />

            </div>

            <form className="space-y-4" onSubmit={submit}>

              <div>

                <label className="text-xs font-semibold text-[var(--rp-muted)]">

                  {tPages("signup.username")}

                </label>

                <Input

                  className="mt-2"

                  value={username}

                  onChange={(e) => setUsername(e.target.value)}

                  required

                  autoComplete="username"

                />

              </div>

              <div>

                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("password")}</label>

                <Input

                  className="mt-2"

                  type="password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  required

                  autoComplete="current-password"

                />

              </div>

              {err ? <p className="text-xs text-[var(--rp-danger)]">{err}</p> : null}

              <Button type="submit" disabled={busy} className="w-full">

                {busy ? t("submitBusy") : t("submit")}

              </Button>

              <p className="text-center text-xs text-[var(--rp-muted)]">

                {t("noAccount")}{" "}

                <Link href="/inscription" className="font-semibold text-[var(--rp-primary)] hover:underline">

                  {t("signupLink")}

                </Link>

              </p>

            </form>

          </CardBody>

        </Card>

      </div>

    </div>

  );

}

