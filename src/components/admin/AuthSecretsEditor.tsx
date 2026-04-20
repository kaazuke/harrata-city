"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const TOKEN_KEY = "rp-runtime-auth-token";

type Status = {
  hasAuthSecret: boolean;
  authSecretSource: "runtime" | "env" | "none";
  discord: {
    clientId: string;
    redirectUri: string;
    hasClientSecret: boolean;
    source: "runtime" | "env" | "mixed" | "none";
  };
  steam: {
    realm: string;
  };
  hasOwnerToken: boolean;
  updatedAt?: string;
  writeAllowed: boolean;
};

export function AuthSecretsEditor() {
  const t = useTranslations("admin.authSecrets");
  const locale = useLocale();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [authSecret, setAuthSecret] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [realm, setRealm] = useState("");

  const [token, setToken] = useState<string>("");
  const [revealedToken, setRevealedToken] = useState<string | null>(null);

  const suggestedRedirect = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/auth/discord/callback`;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/auth-config", { cache: "no-store" });
      const data = (await r.json()) as Status;
      setStatus(data);
      setClientId(data.discord.clientId ?? "");
      setRedirectUri(data.discord.redirectUri ?? "");
      setRealm(data.steam.realm ?? "");
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) setToken(t);
    } catch {
      /* ignore */
    }
  }, [refresh]);

  async function save() {
    setBusy(true);
    setMsg(null);
    setRevealedToken(null);
    try {
      const r = await fetch("/api/admin/auth-config", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { "x-rp-admin-token": token } : {}),
        },
        body: JSON.stringify({
          authSecret: authSecret || undefined,
          discord: {
            clientId: clientId || undefined,
            clientSecret: clientSecret || undefined,
            redirectUri: redirectUri || undefined,
          },
          steam: {
            realm: realm || undefined,
          },
        }),
      });
      const data = (await r.json()) as {
        ok?: boolean;
        ownerToken?: string;
        status?: Status;
        error?: string;
      };
      if (!r.ok || !data.ok) {
        setMsg({ ok: false, text: data.error ?? t("errSave") });
        return;
      }
      if (data.ownerToken) {
        setToken(data.ownerToken);
        setRevealedToken(data.ownerToken);
        try {
          localStorage.setItem(TOKEN_KEY, data.ownerToken);
        } catch {
          /* ignore */
        }
      }
      if (data.status) setStatus(data.status);
      setAuthSecret("");
      setClientSecret("");
      setMsg({ ok: true, text: t("okSave") });
    } catch {
      setMsg({ ok: false, text: t("errNetwork") });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm(t("confirmReset"))) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/auth-config", {
        method: "DELETE",
        headers: { ...(token ? { "x-rp-admin-token": token } : {}) },
      });
      const data = (await r.json()) as { ok?: boolean; error?: string; status?: Status };
      if (!r.ok || !data.ok) {
        setMsg({ ok: false, text: data.error ?? t("errGeneric") });
        return;
      }
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
      setToken("");
      setRevealedToken(null);
      if (data.status) setStatus(data.status);
      setMsg({ ok: true, text: t("okReset") });
    } catch {
      setMsg({ ok: false, text: t("errNetwork") });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-3 text-sm text-[var(--rp-muted)]">
        {t("loading")}
      </p>
    );
  }

  if (!status) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)] px-4 py-3 text-sm">
        {t("apiErrorBefore")}
        <span className="font-mono">/api/admin/auth-config</span>
        {t("apiErrorAfter")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatusBlock
          label="AUTH_SECRET"
          value={status.hasAuthSecret ? t("status.configured") : t("status.missing")}
          source={status.authSecretSource}
          ok={status.hasAuthSecret}
        />
        <StatusBlock
          label="Discord"
          value={
            status.discord.clientId && status.discord.hasClientSecret
              ? t("status.configured")
              : status.discord.clientId
                ? t("status.clientIdOnly")
                : t("status.missing")
          }
          source={status.discord.source}
          ok={!!status.discord.clientId && status.discord.hasClientSecret}
        />
        <StatusBlock
          label="Steam (FiveM)"
          value={t("status.steamNoKey")}
          source={status.steam.realm ? "runtime" : "none"}
          ok
          alwaysOk
        />
      </div>

      {!status.writeAllowed ? (
        <p className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,#f5b042_45%,var(--rp-border))] bg-[color-mix(in_oklab,#f5b042_10%,transparent)] px-4 py-3 text-xs text-[var(--rp-fg)]">
          {t.rich("writeDisabled", {
            monoAllow: (chunks) => <span className="font-mono">{chunks}</span>,
            monoEnv: (chunks) => <span className="font-mono">{chunks}</span>,
          })}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("fieldAuthSecret")} hint={t("hintAuthSecret")}>
          <Input
            type="password"
            value={authSecret}
            onChange={(e) => setAuthSecret(e.target.value)}
            placeholder={
              status.hasAuthSecret ? t("placeholderAuthSecretMasked") : t("placeholderAuthSecretNew")
            }
            autoComplete="off"
          />
        </Field>
        <div />

        <Field label={t("fieldDiscordClientId")}>
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="1234567890…"
            autoComplete="off"
          />
        </Field>
        <Field label={t("fieldDiscordSecret")} hint={t("hintDiscordSecret")}>
          <Input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={
              status.discord.hasClientSecret
                ? t("placeholderDiscordSecretMasked")
                : t("placeholderDiscordSecretNew")
            }
            autoComplete="off"
          />
        </Field>
        <Field label={t("fieldDiscordRedirect")} hint={t("hintDiscordRedirect")}>
          <div className="flex gap-2">
            <Input
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder={suggestedRedirect}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRedirectUri(suggestedRedirect)}
              disabled={!suggestedRedirect}
            >
              {t("btnAuto")}
            </Button>
          </div>
        </Field>
        <Field label={t("fieldSteamRealm")} hint={t("hintSteamRealm")}>
          <Input
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder={
              typeof window !== "undefined" ? window.location.origin : t("placeholderSteamRealm")
            }
          />
        </Field>
      </div>

      {msg ? (
        <p
          className={`text-xs ${msg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"}`}
        >
          {msg.text}
        </p>
      ) : null}

      {revealedToken ? (
        <div className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_10%,transparent)] px-4 py-3 text-xs">
          <div className="font-semibold text-[var(--rp-fg)]">{t("tokenGeneratedTitle")}</div>
          <p className="mt-1 text-[var(--rp-muted)]">{t("tokenGeneratedBody")}</p>
          <code className="mt-2 block break-all rounded bg-black/40 px-2 py-1 font-mono text-[11px] text-[var(--rp-fg)]">
            {revealedToken}
          </code>
        </div>
      ) : null}

      {status.hasOwnerToken && !revealedToken && !token ? (
        <Field label={t("fieldAdminToken")} hint={t("hintAdminToken")}>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("placeholderAdminToken")}
            autoComplete="off"
          />
        </Field>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={save} disabled={busy || !status.writeAllowed}>
          {busy ? t("btnSaving") : t("btnSave")}
        </Button>
        <Button type="button" variant="outline" onClick={refresh} disabled={busy}>
          {t("btnRefresh")}
        </Button>
        {status.hasOwnerToken ? (
          <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
            {t("btnReset")}
          </Button>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--rp-muted)]">
        {t("footerStorage")}{" "}
        <span className="font-mono">.runtime/auth-config.json</span> {t("footerGitNote")}{" "}
        {t("footerWrite")}
        <span className="font-mono">localStorage</span>
        {t("footerWriteAfter")}
        {status.updatedAt
          ? t("footerUpdated", {
              date: new Date(status.updatedAt).toLocaleString(
                locale === "en" ? "en-US" : "fr-FR",
                { dateStyle: "short", timeStyle: "short" },
              ),
            })
          : ""}
      </p>

      <HelpLinks redirectUri={redirectUri || suggestedRedirect} suggestedFallback={t("fallbackRedirectExample")} />
    </div>
  );
}

function HelpLinks({
  redirectUri,
  suggestedFallback,
}: {
  redirectUri: string;
  suggestedFallback: string;
}) {
  const t = useTranslations("admin.authSecrets");
  const discordSteps = t.raw("help.discord.steps") as string[];
  const steamSteps = t.raw("help.steam.steps") as string[];
  const authSecretSteps = t.raw("help.authSecret.steps") as string[];
  const tebexSteps = t.raw("help.tebex.steps") as string[];

  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
      <h4 className="text-sm font-semibold text-[var(--rp-fg)]">{t("help.whereTitle")}</h4>
      <p className="mt-1 text-[11px] text-[var(--rp-muted)]">{t("help.intro")}</p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <HelpCard
          title={t("help.discord.title")}
          steps={[
            ...discordSteps.map((text, i) => <span key={`d-${i}`}>{text}</span>),
            <>
              {t("help.discord.redirectIntro")}{" "}
              <code className="break-all rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">
                {redirectUri || suggestedFallback}
              </code>
            </>,
          ]}
          links={[
            { label: t("help.links.discordPortal"), href: "https://discord.com/developers/applications" },
            {
              label: t("help.links.discordOAuthDoc"),
              href: "https://discord.com/developers/docs/topics/oauth2",
            },
          ]}
        />

        <HelpCard
          title={t("help.steam.title")}
          steps={steamSteps.map((text, i) => (
            <span key={`s-${i}`}>{text}</span>
          ))}
          links={[
            { label: t("help.links.steamApiKey"), href: "https://steamcommunity.com/dev/apikey" },
            { label: t("help.links.steamDev"), href: "https://steamcommunity.com/dev" },
            {
              label: t("help.links.steamIdConverter"),
              href: "https://steamid.io/",
            },
          ]}
        />

        <HelpCard
          title={t("help.authSecret.title")}
          steps={authSecretSteps.map((text, i) => (
            <span key={`a-${i}`}>{text}</span>
          ))}
          links={[{ label: t("help.links.gen64"), href: "https://generate-secret.vercel.app/64" }]}
        />

        <HelpCard
          title={t("help.tebex.title")}
          steps={tebexSteps.map((text, i) => (
            <span key={`x-${i}`}>{text}</span>
          ))}
          links={[
            { label: t("help.links.tebexCreator"), href: "https://creator.tebex.io/" },
            { label: t("help.links.tebexDocs"), href: "https://docs.tebex.io/" },
          ]}
        />
      </div>
    </div>
  );
}

function HelpCard({
  title,
  steps,
  links,
}: {
  title: string;
  steps: React.ReactNode[];
  links: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 p-3">
      <div className="text-xs font-semibold text-[var(--rp-fg)]">{title}</div>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-[var(--rp-muted)]">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {links.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {links.map((l) => (
            <ExtLink key={l.href} href={l.href} pill>
              {l.label}
            </ExtLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ExtLink({
  href,
  children,
  pill = false,
}: {
  href: string;
  children: React.ReactNode;
  pill?: boolean;
}) {
  if (pill) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border border-[var(--rp-border)] bg-black/40 px-2 py-0.5 text-[10px] font-medium text-[var(--rp-fg)] transition hover:border-[var(--rp-primary)] hover:text-[var(--rp-primary)]"
      >
        {children}
        <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[var(--rp-primary)] underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--rp-muted)]">{label}</label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-[var(--rp-muted)]">{hint}</p> : null}
    </div>
  );
}

function StatusBlock({
  label,
  value,
  source,
  ok,
  alwaysOk = false,
}: {
  label: string;
  value: string;
  source: string;
  ok: boolean;
  alwaysOk?: boolean;
}) {
  const t = useTranslations("admin.authSecrets");
  const dotColor = alwaysOk || ok ? "var(--rp-success)" : "var(--rp-danger)";
  const sourceLabels: Record<string, string> = {
    none: t("source.none"),
    env: t("source.env"),
    runtime: t("source.runtime"),
    mixed: t("source.mixed"),
  };
  const sourceLabel = sourceLabels[source] ?? source;
  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: dotColor }}
          aria-hidden
        />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--rp-fg)]">{value}</div>
      <div className="mt-0.5 text-[11px] text-[var(--rp-muted)]">{sourceLabel}</div>
    </div>
  );
}
