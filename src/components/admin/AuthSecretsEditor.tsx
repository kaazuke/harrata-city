"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const sourceLabel: Record<string, string> = {
  none: "Non configuré",
  env: "Variables d’environnement (.env)",
  runtime: "Saisi via le panneau admin",
  mixed: "Mixte (.env + panneau)",
};

export function AuthSecretsEditor() {
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
        setMsg({ ok: false, text: data.error ?? "Erreur lors de l’enregistrement." });
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
      setMsg({ ok: true, text: "Configuration enregistrée côté serveur." });
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm("Effacer la configuration runtime (clés saisies depuis le panneau) ?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/auth-config", {
        method: "DELETE",
        headers: { ...(token ? { "x-rp-admin-token": token } : {}) },
      });
      const data = (await r.json()) as { ok?: boolean; error?: string; status?: Status };
      if (!r.ok || !data.ok) {
        setMsg({ ok: false, text: data.error ?? "Erreur." });
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
      setMsg({ ok: true, text: "Configuration réinitialisée." });
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-3 text-sm text-[var(--rp-muted)]">
        Chargement de la configuration serveur…
      </p>
    );
  }

  if (!status) {
    return (
      <p className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)] px-4 py-3 text-sm">
        Impossible de joindre l’API <span className="font-mono">/api/admin/auth-config</span>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatusBlock
          label="AUTH_SECRET"
          value={status.hasAuthSecret ? "Configuré" : "Manquant"}
          source={status.authSecretSource}
          ok={status.hasAuthSecret}
        />
        <StatusBlock
          label="Discord"
          value={
            status.discord.clientId && status.discord.hasClientSecret
              ? "Configuré"
              : status.discord.clientId
                ? "Client ID seul"
                : "Manquant"
          }
          source={status.discord.source}
          ok={!!status.discord.clientId && status.discord.hasClientSecret}
        />
        <StatusBlock
          label="Steam (FiveM)"
          value="Aucune clé requise (OpenID public)"
          source={status.steam.realm ? "runtime" : "none"}
          ok
          alwaysOk
        />
      </div>

      {!status.writeAllowed ? (
        <p className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,#f5b042_45%,var(--rp-border))] bg-[color-mix(in_oklab,#f5b042_10%,transparent)] px-4 py-3 text-xs text-[var(--rp-fg)]">
          La modification est désactivée en production. Définissez{" "}
          <span className="font-mono">ALLOW_RUNTIME_AUTH_CONFIG=true</span> côté serveur, ou utilisez{" "}
          <span className="font-mono">.env</span> directement.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="AUTH_SECRET" hint="Chaîne aléatoire (≥ 32 caractères). Sert à signer les sessions.">
          <Input
            type="password"
            value={authSecret}
            onChange={(e) => setAuthSecret(e.target.value)}
            placeholder={status.hasAuthSecret ? "(actuel masqué — laissez vide pour conserver)" : "ex. 64 caractères aléatoires"}
            autoComplete="off"
          />
        </Field>
        <div />

        <Field label="Discord — Client ID">
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="1234567890…"
            autoComplete="off"
          />
        </Field>
        <Field label="Discord — Client Secret" hint="Stocké dans .runtime/auth-config.json (hors git).">
          <Input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={status.discord.hasClientSecret ? "(actuel masqué — laissez vide pour conserver)" : "secret Discord"}
            autoComplete="off"
          />
        </Field>
        <Field
          label="Discord — Redirect URI"
          hint="À déclarer à l’identique dans Discord Developer Portal."
        >
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
              Auto
            </Button>
          </div>
        </Field>
        <Field
          label="Steam — Realm (optionnel)"
          hint="Origine HTTPS de votre site (sinon dérivée automatiquement)."
        >
          <Input
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder={typeof window !== "undefined" ? window.location.origin : "https://votre-site.fr"}
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
          <div className="font-semibold text-[var(--rp-fg)]">Token admin runtime généré</div>
          <p className="mt-1 text-[var(--rp-muted)]">
            Conservez-le pour pouvoir modifier la config plus tard depuis un autre navigateur. Il a
            été enregistré localement.
          </p>
          <code className="mt-2 block break-all rounded bg-black/40 px-2 py-1 font-mono text-[11px] text-[var(--rp-fg)]">
            {revealedToken}
          </code>
        </div>
      ) : null}

      {status.hasOwnerToken && !revealedToken && !token ? (
        <Field
          label="Token admin (requis pour modifier)"
          hint="Collez le token retourné lors de la première écriture."
        >
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ex. 5e8a…"
            autoComplete="off"
          />
        </Field>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={save} disabled={busy || !status.writeAllowed}>
          {busy ? "Enregistrement…" : "Enregistrer côté serveur"}
        </Button>
        <Button type="button" variant="outline" onClick={refresh} disabled={busy}>
          Recharger
        </Button>
        {status.hasOwnerToken ? (
          <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
            Réinitialiser
          </Button>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--rp-muted)]">
        Stockage : <span className="font-mono">.runtime/auth-config.json</span> (gitignoré).
        L’écriture nécessite un token généré à la première sauvegarde et stocké dans votre navigateur
        ({" "}
        <span className="font-mono">localStorage</span>). Les routes Discord/Steam liront ces clés
        en priorité, puis tomberont sur les variables d’environnement classiques.
        {status.updatedAt
          ? ` Dernière mise à jour : ${new Date(status.updatedAt).toLocaleString("fr-FR")}.`
          : ""}
      </p>

      <HelpLinks redirectUri={redirectUri || suggestedRedirect} />
    </div>
  );
}

function HelpLinks({ redirectUri }: { redirectUri: string }) {
  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
      <h4 className="text-sm font-semibold text-[var(--rp-fg)]">
        Où récupérer ces identifiants ?
      </h4>
      <p className="mt-1 text-[11px] text-[var(--rp-muted)]">
        Liens utiles pour créer/retrouver vos clés. Tout se fait gratuitement.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <HelpCard
          title="Discord — Application OAuth2"
          steps={[
            <>Ouvrir le <ExtLink href="https://discord.com/developers/applications">Discord Developer Portal</ExtLink>.</>,
            <>Cliquer <em>New Application</em>, donner un nom (votre serveur RP).</>,
            <>Onglet <em>OAuth2 → General</em> : copier <span className="font-mono">CLIENT ID</span> et <span className="font-mono">CLIENT SECRET</span> (bouton <em>Reset Secret</em>).</>,
            <>
              Toujours dans <em>OAuth2</em>, section <em>Redirects</em>, ajouter exactement :{" "}
              <code className="break-all rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">
                {redirectUri || "https://votre-site.fr/api/auth/discord/callback"}
              </code>
            </>,
          ]}
          links={[
            { label: "Developer Portal", href: "https://discord.com/developers/applications" },
            {
              label: "Doc OAuth2 Discord",
              href: "https://discord.com/developers/docs/topics/oauth2",
            },
          ]}
        />

        <HelpCard
          title="Steam (FiveM) — OpenID 2.0"
          steps={[
            <>
              <strong>Aucune clé requise</strong> : Steam OpenID est public. Le SteamID renvoyé
              permet d’identifier les joueurs FiveM (qui se lancent via Steam).
            </>,
            <>
              Optionnel : pour une <em>API Key</em> Steam (récupérer le pseudo / l’avatar du
              profil), créez‑la sur{" "}
              <ExtLink href="https://steamcommunity.com/dev/apikey">
                steamcommunity.com/dev/apikey
              </ExtLink>{" "}
              (un domaine est demandé).
            </>,
            <>
              Le champ <em>Realm</em> est laissé vide la plupart du temps : il sera dérivé
              automatiquement de l’URL publique du site.
            </>,
          ]}
          links={[
            { label: "Steam API Key", href: "https://steamcommunity.com/dev/apikey" },
            { label: "Doc OpenID Steam", href: "https://steamcommunity.com/dev" },
            {
              label: "Convertisseur SteamID ↔ FiveM",
              href: "https://steamid.io/",
            },
          ]}
        />

        <HelpCard
          title="AUTH_SECRET — clé de signature des sessions"
          steps={[
            <>
              Générez une chaîne aléatoire de <strong>64 caractères</strong>. Plusieurs options :
            </>,
            <>
              En ligne :{" "}
              <ExtLink href="https://generate-secret.vercel.app/64">
                generate-secret.vercel.app/64
              </ExtLink>{" "}
              ou <ExtLink href="https://www.random.org/strings/">random.org</ExtLink>.
            </>,
            <>
              En local : <span className="font-mono">openssl rand -hex 32</span> ou{" "}
              <span className="font-mono">node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;</span>.
            </>,
            <>
              Ne la partagez jamais ; si elle fuite, régénérez‑la (toutes les sessions seront
              invalidées).
            </>,
          ]}
          links={[
            { label: "Générateur 64 chars", href: "https://generate-secret.vercel.app/64" },
          ]}
        />

        <HelpCard
          title="Tebex — boutique"
          steps={[
            <>
              L’URL de base est celle affichée dans votre back‑office Tebex (ex.{" "}
              <span className="font-mono">https://votre-boutique.tebex.io</span>).
            </>,
            <>
              Pour récupérer/configurer votre store :{" "}
              <ExtLink href="https://creator.tebex.io/">creator.tebex.io</ExtLink>.
            </>,
            <>
              Doc API & webhooks :{" "}
              <ExtLink href="https://docs.tebex.io/">docs.tebex.io</ExtLink>.
            </>,
          ]}
          links={[
            { label: "Tebex Creator", href: "https://creator.tebex.io/" },
            { label: "Documentation", href: "https://docs.tebex.io/" },
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
  const dotColor = alwaysOk || ok ? "var(--rp-success)" : "var(--rp-danger)";
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
      <div className="mt-0.5 text-[11px] text-[var(--rp-muted)]">{sourceLabel[source] ?? source}</div>
    </div>
  );
}
