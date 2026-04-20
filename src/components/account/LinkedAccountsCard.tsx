"use client";

import { useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { OAuthButtons } from "@/components/account/OAuthButtons";
import { PROVIDER_LABELS } from "@/lib/account/types";
import type { OAuthProvider } from "@/lib/account/types";

const PROVIDERS: OAuthProvider[] = ["discord", "steam"];

export function LinkedAccountsCard() {
  const { user, unlinkOAuth } = useAccount();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  return (
    <Card>
      <CardBody>
        <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">
          Comptes liés
        </h2>
        <p className="mt-1 text-xs text-[var(--rp-muted)]">
          Connectez Discord ou votre identité FiveM (Steam) pour vous reconnecter sans mot de
          passe.
        </p>

        <ul className="mt-4 space-y-2">
          {PROVIDERS.map((p) => {
            const link = user.oauth?.[p];
            return (
              <li
                key={p}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--rp-fg)]">
                    {PROVIDER_LABELS[p]}
                  </div>
                  {link ? (
                    <div className="mt-0.5 truncate text-[11px] text-[var(--rp-muted)]">
                      {link.username}
                      <span className="opacity-70">
                        {" "}
                        · lié le {new Date(link.linkedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[11px] text-[var(--rp-muted)]">Non lié</div>
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
                          ? { ok: true, text: `${PROVIDER_LABELS[p]} dissocié.` }
                          : { ok: false, text: r.error },
                      );
                    }}
                  >
                    Délier
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
          <p className="mb-2 text-xs font-semibold text-[var(--rp-muted)]">Lier un compte</p>
          <OAuthButtons intent="link" />
        </div>
      </CardBody>
    </Card>
  );
}
