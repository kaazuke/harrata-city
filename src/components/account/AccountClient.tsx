"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { PageHero } from "@/components/layout/PageHero";
import { Avatar } from "@/components/account/Avatar";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import { LinkedAccountsCard } from "@/components/account/LinkedAccountsCard";
import { RoleBadge } from "@/components/account/RoleBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

export function AccountClient() {
  const {
    ready,
    user,
    updateProfile,
    changePassword,
    deleteAccount,
    logout,
    hasPermission,
  } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [color, setColor] = useState("#7aa2f7");
  const [signature, setSignature] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [banner, setBanner] = useState<string | undefined>();

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.profile.displayName ?? user.username);
    setBio(user.profile.bio ?? "");
    setColor(user.profile.color ?? "#7aa2f7");
    setSignature(user.profile.signature ?? "");
    setAvatar(user.profile.avatarDataUrl);
    setBanner(user.profile.bannerDataUrl);
  }, [user]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[var(--rp-muted)]">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">
          Vous n’êtes pas connecté
        </h1>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/connexion"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    const r = updateProfile({
      displayName: displayName.trim() || user!.username,
      bio: bio.trim() || undefined,
      color: color.trim() || undefined,
      signature: signature.trim() || undefined,
      avatarDataUrl: avatar,
      bannerDataUrl: banner,
    });
    setProfileMsg(
      r.ok
        ? { ok: true, text: "Profil enregistré." }
        : { ok: false, text: r.error },
    );
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwBusy(true);
    const r = await changePassword(pwCurrent, pwNext);
    setPwBusy(false);
    setPwMsg(
      r.ok
        ? { ok: true, text: "Mot de passe modifié." }
        : { ok: false, text: r.error },
    );
    if (r.ok) {
      setPwCurrent("");
      setPwNext("");
    }
  }

  function destroy() {
    if (!confirm("Supprimer définitivement votre compte ? Cette action est irréversible.")) return;
    const r = deleteAccount(user!.id);
    if (!r.ok) alert(r.error);
  }

  return (
    <div>
      <PageHero
        eyebrow="Compte"
        title={user.profile.displayName || user.username}
        subtitle={`Pseudo @${user.username} · membre depuis le ${new Date(user.createdAt).toLocaleDateString("fr-FR")}`}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar account={user} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold text-[var(--rp-fg)]">
                    {user.profile.displayName || user.username}
                  </h2>
                  <RoleBadge role={user.role} />
                </div>
                <p className="mt-1 text-sm text-[var(--rp-muted)]">@{user.username}</p>
                {user.profile.bio ? (
                  <p className="mt-2 text-sm text-[var(--rp-fg)]">{user.profile.bio}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="ghost" onClick={() => logout()}>
                  Se déconnecter
                </Button>
                {hasPermission("admin.access") ? (
                  <Link
                    href="/admin"
                    className="rounded-[var(--rp-radius)] border border-white/15 px-4 py-2 text-center text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
                  >
                    Panneau admin
                  </Link>
                ) : null}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">Profil</h2>
            <p className="mt-1 text-xs text-[var(--rp-muted)]">
              Affiché à côté de vos messages dans le forum.
            </p>
            <form className="mt-5 space-y-5" onSubmit={saveProfile}>
              <AvatarPicker value={avatar} onChange={setAvatar} label="Avatar" />
              <AvatarPicker value={banner} onChange={setBanner} label="Bannière (optionnelle)" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">Nom affiché</label>
                  <Input
                    className="mt-2"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">
                    Couleur d’accent
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-transparent"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#7aa2f7"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Bio</label>
                <Textarea
                  className="mt-2 min-h-[5rem]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={400}
                  placeholder="Présentation rapide…"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  Signature (affichée sous vos messages)
                </label>
                <Textarea
                  className="mt-2 min-h-[4rem]"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  maxLength={200}
                  placeholder="— ex. ‹Astra›, gérante d’un food-truck"
                />
              </div>

              {profileMsg ? (
                <p
                  className={`text-xs ${
                    profileMsg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
                  }`}
                >
                  {profileMsg.text}
                </p>
              ) : null}
              <Button type="submit">Enregistrer le profil</Button>
            </form>
          </CardBody>
        </Card>

        <LinkedAccountsCard />

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">
              Mot de passe
            </h2>
            {!user.passwordHash ? (
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                Ce compte est lié à un service externe. Définissez un mot de passe pour pouvoir
                aussi vous connecter classiquement.
              </p>
            ) : null}
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={savePassword}>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {user.passwordHash ? "Mot de passe actuel" : "Aucun mot de passe défini"}
                </label>
                <Input
                  className="mt-2"
                  type="password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  required={!!user.passwordHash}
                  disabled={!user.passwordHash}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Nouveau mot de passe</label>
                <Input
                  className="mt-2"
                  type="password"
                  value={pwNext}
                  onChange={(e) => setPwNext(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {pwMsg ? (
                <p
                  className={`sm:col-span-2 text-xs ${
                    pwMsg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
                  }`}
                >
                  {pwMsg.text}
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={pwBusy} variant="ghost">
                  {pwBusy ? "Modification…" : "Changer le mot de passe"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">
              Zone dangereuse
            </h2>
            <p className="mt-1 text-xs text-[var(--rp-muted)]">
              Suppression définitive du compte. Le dernier administrateur ne peut pas être supprimé.
            </p>
            <div className="mt-4">
              <Button type="button" variant="danger" onClick={destroy}>
                Supprimer mon compte
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
