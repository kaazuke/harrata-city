"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { OAuthButtons } from "@/components/account/OAuthButtons";

export function SignupClient() {
  const router = useRouter();
  const { register, accounts, ready } = useAccount();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    const r = await register(username, password);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    router.push("/compte");
  }

  return (
    <div>
      <PageHero
        eyebrow="Communauté"
        title="Créer un compte"
        subtitle="Pseudo + mot de passe. Le premier compte créé devient automatiquement administrateur."
      />
      <div className="mx-auto max-w-md px-4 py-10">
        {ready && accounts.length === 0 ? (
          <p className="mb-4 rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_10%,transparent)] px-4 py-3 text-xs text-[var(--rp-fg)]">
            Aucun compte n’existe encore : votre inscription créera le compte
            <span className="font-semibold"> administrateur</span> du site.
          </p>
        ) : null}
        <Card>
          <CardBody>
            <OAuthButtons intent="register" />
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--rp-border)]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                ou
              </span>
              <div className="h-px flex-1 bg-[var(--rp-border)]" />
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Pseudo</label>
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
                <p className="mt-1 text-[11px] text-[var(--rp-muted)]">
                  3 à 24 caractères. Lettres, chiffres, tiret, underscore.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Mot de passe</label>
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
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Confirmation</label>
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
                {busy ? "Création…" : "Créer mon compte"}
              </Button>
              <p className="text-center text-xs text-[var(--rp-muted)]">
                Déjà inscrit ?{" "}
                <Link href="/connexion" className="font-semibold text-[var(--rp-primary)] hover:underline">
                  Se connecter
                </Link>
              </p>
            </form>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--rp-muted)]">
              Stockage 100% local (navigateur). Les mots de passe sont hashés (SHA-256 + salt) mais
              ce système est destiné à des sites de communauté locale, pas à des données sensibles.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
