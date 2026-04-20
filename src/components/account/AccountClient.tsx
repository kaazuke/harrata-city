"use client";

import { Link } from "@/i18n/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/components/providers/AccountProvider";
import { formatAccountError } from "@/lib/account/format-account-error";
import type { AccountFailure } from "@/lib/account/account-error-keys";
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
  const t = useTranslations("authPages.account");
  const tPages = useTranslations("authPages");
  const te = useTranslations("accountErrors");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

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
        {t("loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">{t("notSignedInTitle")}</h1>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/connexion"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
          >
            {t("login")}
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
          >
            {t("signup")}
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
        ? { ok: true, text: t("profileSaved") }
        : { ok: false, text: formatAccountError(te, r as AccountFailure) },
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
        ? { ok: true, text: t("passwordChanged") }
        : { ok: false, text: formatAccountError(te, r as AccountFailure) },
    );
    if (r.ok) {
      setPwCurrent("");
      setPwNext("");
    }
  }

  function destroy() {
    if (!confirm(t("confirmDelete"))) return;
    const r = deleteAccount(user!.id);
    if (!r.ok) alert(formatAccountError(te, r as AccountFailure));
  }

  const memberDate = new Date(user.createdAt).toLocaleDateString(dateLocale);

  return (
    <div>
      <PageHero
        eyebrow={tPages("accountEyebrow")}
        title={user.profile.displayName || user.username}
        subtitle={t("memberSince", {
          username: user.username,
          date: memberDate,
        })}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
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
                  {t("logout")}
                </Button>
                {hasPermission("admin.access") ? (
                  <Link
                    href="/admin"
                    className="rounded-[var(--rp-radius)] border border-white/15 px-4 py-2 text-center text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
                  >
                    {t("adminPanel")}
                  </Link>
                ) : null}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">{t("profileCardTitle")}</h2>
            <p className="mt-1 text-xs text-[var(--rp-muted)]">{t("profileCardHint")}</p>
            <form className="mt-5 space-y-5" onSubmit={saveProfile}>
              <AvatarPicker value={avatar} onChange={setAvatar} label={t("avatarLabel")} />
              <AvatarPicker value={banner} onChange={setBanner} label={t("bannerLabel")} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("displayName")}</label>
                  <Input
                    className="mt-2"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("accentColor")}</label>
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
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("bio")}</label>
                <Textarea
                  className="mt-2 min-h-[5rem]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={400}
                  placeholder={t("bioPlaceholder")}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("signature")}</label>
                <Textarea
                  className="mt-2 min-h-[4rem]"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  maxLength={200}
                  placeholder={t("signaturePlaceholder")}
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
              <Button type="submit">{t("saveProfile")}</Button>
            </form>
          </CardBody>
        </Card>

        <LinkedAccountsCard />

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">{t("passwordCardTitle")}</h2>
            {!user.passwordHash ? (
              <p className="mt-1 text-xs text-[var(--rp-muted)]">{t("passwordOAuthHint")}</p>
            ) : null}
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={savePassword}>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {user.passwordHash ? t("currentPassword") : t("noPasswordSet")}
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
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("newPassword")}</label>
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
                  {pwBusy ? t("changePasswordBusy") : t("changePassword")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold text-[var(--rp-fg)]">{t("dangerZone")}</h2>
            <p className="mt-1 text-xs text-[var(--rp-muted)]">{t("dangerHint")}</p>
            <div className="mt-4">
              <Button type="button" variant="danger" onClick={destroy}>
                {t("deleteAccount")}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
