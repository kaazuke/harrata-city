"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import type { NavItem, SiteConfig } from "@/config/types";
import { deepMerge } from "@/lib/merge";
import { defaultSiteConfig } from "@/config/default-site";
import { AdminContentTab } from "@/components/admin/AdminContentTab";
import { AdminLayoutCopyTab } from "@/components/admin/AdminLayoutCopyTab";
import { AdminServerTab } from "@/components/admin/AdminServerTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AuthSecretsEditor } from "@/components/admin/AuthSecretsEditor";
import { AdminForumLogsTab } from "@/components/admin/AdminForumLogsTab";
import { AdminForumCategoriesTab } from "@/components/admin/AdminForumCategoriesTab";
import { AdminRolesTab } from "@/components/admin/AdminRolesTab";
import { AdminExtensionsTab } from "@/components/admin/AdminExtensionsTab";
import { ListingPrepPanel } from "@/components/admin/ListingPrepPanel";
import { AdminSupportTab } from "@/components/admin/AdminSupportTab";
import { countNewMessages, supportChannel } from "@/lib/support/store";

type Tab =
  | "identity"
  | "theme"
  | "server"
  | "modules"
  | "nav"
  | "textes"
  | "contents"
  | "users"
  | "roles"
  | "forum-cats"
  | "forum-logs"
  | "extensions"
  | "listing"
  | "support"
  | "forms"
  | "integrations"
  | "io";

const TAB_I18N_KEY: Record<Tab, string> = {
  identity: "identity",
  theme: "theme",
  server: "server",
  modules: "modules",
  nav: "nav",
  textes: "textes",
  contents: "contents",
  users: "users",
  roles: "roles",
  "forum-cats": "forumCats",
  "forum-logs": "forumLogs",
  extensions: "extensions",
  listing: "listing",
  support: "support",
  forms: "forms",
  integrations: "integrations",
  io: "io",
};

export function AdminClient() {
  const t = useTranslations("admin");
  const tTabs = useTranslations("admin.tabs");
  const tMod = useTranslations("admin.modules");
  const tTheme = useTranslations("admin.theme");
  const { config, setConfig, resetConfig, persist, exportJson, importFromJson } =
    useSiteConfig();
  const locale = useLocale() as "fr" | "en";
  const pathname = usePathname();
  const router = useRouter();
  const [localePending, startLocaleTransition] = useTransition();
  const { ready, user, accounts, hasPermission } = useAccount();
  const [tab, setTab] = useState<Tab>("identity");
  const [importText, setImportText] = useState("");
  const [importErr, setImportErr] = useState<string | null>(null);
  const [formsDraft, setFormsDraft] = useState("");
  const [supportNewCount, setSupportNewCount] = useState(0);

  useEffect(() => {
    setSupportNewCount(countNewMessages());
    const ch = supportChannel();
    if (!ch) return;
    ch.onmessage = () => setSupportNewCount(countNewMessages());
    return () => ch.close();
  }, []);

  useEffect(() => {
    if (tab === "support") setSupportNewCount(countNewMessages());
  }, [tab]);

  const formsJson = useMemo(() => JSON.stringify(config.forms, null, 2), [config.forms]);

  useEffect(() => {
    if (tab === "forms") {
      setFormsDraft(formsJson);
    }
  }, [tab, formsJson]);

  /** Garde `config.locale` aligné sur la locale d’URL (switcher header, navigation, etc.). */
  useEffect(() => {
    if (config.locale !== locale) {
      setConfig({ ...config, locale: locale });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- déclenché uniquement quand la locale de route change
  }, [locale]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[var(--rp-muted)]">
        {t("loading")}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-[var(--rp-fg)]">
          {t("gate.initTitle")}
        </h1>
        <p className="mt-3 text-sm text-[var(--rp-muted)]">{t("gate.initBody")}</p>
        <Link
          href="/inscription"
          className="mt-6 inline-block rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
        >
          {t("gate.createAdmin")}
        </Link>
      </div>
    );
  }

  if (!user || !hasPermission("admin.access")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-[var(--rp-fg)]">
          {t("gate.deniedTitle")}
        </h1>
        <p className="mt-3 text-sm text-[var(--rp-muted)]">{t("gate.deniedBody")}</p>
        <div className="mt-6 flex justify-center gap-3">
          {!user ? (
            <Link
              href="/connexion"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
            >
              {t("gate.login")}
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
          >
            {t("gate.home")}
          </Link>
        </div>
      </div>
    );
  }

  function updateNavItem(index: number, patchItem: Partial<NavItem>) {
    const next = config.nav.map((n, i) => (i === index ? { ...n, ...patchItem } : n));
    setConfig({ ...config, nav: next });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_70%,black)] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--rp-fg)]">
              {t("header.title")}
            </h1>
            <p className="mt-2 text-sm text-[var(--rp-muted)]">{t("header.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--rp-success)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-success)_10%,transparent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--rp-success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-success)]" aria-hidden />
              {t("header.autoSave")}
            </span>
            <Button type="button" variant="ghost" onClick={() => resetConfig()}>
              {t("header.reset")}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              "identity",
              "theme",
              "server",
              "modules",
              "nav",
              "textes",
              "contents",
              "users",
              "roles",
              "forum-cats",
              "forum-logs",
              "extensions",
              "listing",
              "support",
              "forms",
              "integrations",
              "io",
            ] as const
          ).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative rounded-full border px-3 py-2 text-xs font-semibold ${
                tab === id
                  ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                  : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
              }`}
            >
              {tTabs(TAB_I18N_KEY[id])}
              {id === "support" && supportNewCount > 0 ? (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--rp-danger)] px-1 text-[10px] font-bold text-white">
                  {supportNewCount > 9 ? "9+" : supportNewCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {tab === "identity" ? (
          <Card>
            <CardHeader title={t("identity.cardTitle")} />
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.siteName")}
                </label>
                <Input
                  className="mt-2"
                  value={config.meta.siteName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: { ...config.meta, siteName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.slogan")}
                </label>
                <Input
                  className="mt-2"
                  value={config.meta.slogan}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: { ...config.meta, slogan: e.target.value },
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.description")}
                </label>
                <Textarea
                  className="mt-2"
                  value={config.meta.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: { ...config.meta, description: e.target.value },
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.keywords")}
                </label>
                <Input
                  className="mt-2"
                  value={config.meta.keywords.join(", ")}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: {
                        ...config.meta,
                        keywords: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.logoUrl")}
                </label>
                <Input
                  className="mt-2"
                  value={config.meta.logoUrl ?? ""}
                  placeholder={t("identity.logoPlaceholder")}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: { ...config.meta, logoUrl: e.target.value || undefined },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("identity.uiLang")}
                </label>
                <select
                  className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)] disabled:opacity-60"
                  value={locale}
                  disabled={localePending}
                  onChange={(e) => {
                    const next = e.target.value as "fr" | "en";
                    if (next === locale) return;
                    setConfig({ ...config, locale: next });
                    startLocaleTransition(() => {
                      router.replace(pathname, { locale: next });
                      router.refresh();
                    });
                  }}
                >
                  <option value="fr">{t("identity.langFr")}</option>
                  <option value="en">{t("identity.langEn")}</option>
                </select>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "theme" ? (
          <Card>
            <CardHeader title={tTheme("cardTitle")} subtitle={tTheme("cardSubtitle")} />
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {tTheme("mode")}
                </label>
                <select
                  className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
                  value={config.theme.mode}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: {
                        ...config.theme,
                        mode: e.target.value as SiteConfig["theme"]["mode"],
                      },
                    })
                  }
                >
                  <option value="dark">{tTheme("modeDark")}</option>
                  <option value="light">{tTheme("modeLight")}</option>
                  <option value="system">{tTheme("modeSystem")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {tTheme("layout")}
                </label>
                <select
                  className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
                  value={config.theme.layout}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: {
                        ...config.theme,
                        layout: e.target.value as SiteConfig["theme"]["layout"],
                      },
                    })
                  }
                >
                  <option value="wide">{tTheme("layoutWide")}</option>
                  <option value="boxed">{tTheme("layoutBoxed")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {tTheme("radius")}
                </label>
                <select
                  className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
                  value={config.theme.radius}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: {
                        ...config.theme,
                        radius: e.target.value as SiteConfig["theme"]["radius"],
                      },
                    })
                  }
                >
                  <option value="sm">SM</option>
                  <option value="md">MD</option>
                  <option value="lg">LG</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {tTheme("heroOverlay")}
                </label>
                <Input
                  className="mt-2"
                  type="number"
                  step="0.05"
                  min={0}
                  max={1}
                  value={config.theme.heroOverlayOpacity}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: {
                        ...config.theme,
                        heroOverlayOpacity: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {tTheme("heroImage")}
                </label>
                <Input
                  className="mt-2"
                  value={config.theme.heroBackground}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: { ...config.theme, heroBackground: e.target.value },
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--rp-fg)] md:col-span-2">
                <input
                  type="checkbox"
                  checked={config.theme.noiseOverlay}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: { ...config.theme, noiseOverlay: e.target.checked },
                    })
                  }
                />
                {tTheme("noiseOverlay")}
              </label>

              {(
                [
                  ["primary", "colorPrimary"],
                  ["secondary", "colorSecondary"],
                  ["accent", "colorAccent"],
                  ["background", "colorBackground"],
                  ["surface", "colorSurface"],
                  ["muted", "colorMuted"],
                  ["border", "colorBorder"],
                  ["foreground", "colorForeground"],
                ] as const
              ).map(([k, labelKey]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">
                    {tTheme(labelKey)}
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.colors[k]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: {
                            ...config.theme,
                            colors: { ...config.theme.colors, [k]: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={config.theme.colors[k]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: {
                            ...config.theme,
                            colors: { ...config.theme.colors, [k]: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}

        {tab === "server" ? <AdminServerTab /> : null}

        {tab === "modules" ? (
          <Card>
            <CardHeader title={t("modulesCard.title")} subtitle={t("modulesCard.subtitle")} />
            <CardBody className="grid gap-3 md:grid-cols-2">
              {(Object.keys(config.modules) as Array<keyof SiteConfig["modules"]>).map((k) => (
                <label
                  key={k}
                  className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{tMod(k)}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[var(--rp-muted)]">{k}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.modules[k]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        modules: { ...config.modules, [k]: e.target.checked },
                      })
                    }
                  />
                </label>
              ))}
            </CardBody>
          </Card>
        ) : null}

        {tab === "nav" ? (
          <Card>
            <CardHeader title={t("nav.title")} />
            <CardBody className="space-y-4">
              {config.nav.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4 md:grid-cols-12 md:items-end"
                >
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      {t("nav.label")}
                    </label>
                    <Input
                      className="mt-2"
                      value={item.label}
                      onChange={(e) => updateNavItem(idx, { label: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      {t("nav.href")}
                    </label>
                    <Input
                      className="mt-2"
                      value={item.href}
                      onChange={(e) => updateNavItem(idx, { href: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      {t("nav.idStable")}
                    </label>
                    <Input className="mt-2" value={item.id} readOnly />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--rp-fg)] md:col-span-2">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateNavItem(idx, { enabled: e.target.checked })}
                    />
                    {t("nav.enabled")}
                  </label>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}

        {tab === "textes" ? <AdminLayoutCopyTab /> : null}

        {tab === "contents" ? <AdminContentTab /> : null}

        {tab === "users" ? <AdminUsersTab /> : null}

        {tab === "roles" ? <AdminRolesTab /> : null}

        {tab === "forum-cats" ? (
          <Card>
            <CardHeader title={t("forumCatsCard.title")} subtitle={t("forumCatsCard.subtitle")} />
            <CardBody>
              <AdminForumCategoriesTab />
            </CardBody>
          </Card>
        ) : null}

        {tab === "extensions" ? <AdminExtensionsTab /> : null}
        {tab === "listing" ? <ListingPrepPanel /> : null}

        {tab === "support" ? <AdminSupportTab /> : null}

        {tab === "forum-logs" ? (
          <Card>
            <CardHeader title={t("forumLogsCard.title")} subtitle={t("forumLogsCard.subtitle")} />
            <CardBody>
              <AdminForumLogsTab />
            </CardBody>
          </Card>
        ) : null}

        {tab === "forms" ? (
          <Card>
            <CardHeader title={t("forms.title")} subtitle={t("forms.subtitle")} />
            <CardBody>
              <Textarea
                value={formsDraft}
                onChange={(e) => setFormsDraft(e.target.value)}
                onBlur={() => {
                  try {
                    const parsed = JSON.parse(formsDraft) as SiteConfig["forms"];
                    setConfig({ ...config, forms: parsed });
                  } catch {
                    setFormsDraft(formsJson);
                  }
                }}
                className="min-h-[320px] font-mono text-xs"
              />
              <div className="mt-3 text-xs text-[var(--rp-muted)]">{t("forms.hint")}</div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "integrations" ? (
          <Card>
            <CardHeader title={t("integrations.title")} subtitle={t("integrations.subtitle")} />
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--rp-fg)]">
                  {t("integrations.serverKeysTitle")}
                </h3>
                <p className="mt-1 text-xs text-[var(--rp-muted)]">
                  {t("integrations.serverKeysBody")}
                </p>
                <div className="mt-3">
                  <AuthSecretsEditor />
                </div>
              </div>

              <div className="space-y-3 border-t border-[var(--rp-border)] pt-6">
              <h3 className="text-sm font-semibold text-[var(--rp-fg)]">
                {t("integrations.publicTitle")}
              </h3>
              <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
                <span>{t("integrations.discordBtn")}</span>
                <input
                  type="checkbox"
                  checked={config.integrations.discordOAuth.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      integrations: {
                        ...config.integrations,
                        discordOAuth: { enabled: e.target.checked },
                      },
                    })
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
                <span>{t("integrations.steamBtn")}</span>
                <input
                  type="checkbox"
                  checked={config.integrations.steamOpenId.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      integrations: {
                        ...config.integrations,
                        steamOpenId: { enabled: e.target.checked },
                      },
                    })
                  }
                />
              </label>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("integrations.tebexBase")}
                </label>
                <Input
                  className="mt-2"
                  value={config.integrations.tebex.storeBaseUrl}
                  placeholder={t("integrations.tebexPlaceholder")}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      integrations: {
                        ...config.integrations,
                        tebex: {
                          ...config.integrations.tebex,
                          storeBaseUrl: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
                <span>{t("integrations.tebexGenLinks")}</span>
                <input
                  type="checkbox"
                  checked={config.integrations.tebex.enableGeneratedPackageLinks}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      integrations: {
                        ...config.integrations,
                        tebex: {
                          ...config.integrations.tebex,
                          enableGeneratedPackageLinks: e.target.checked,
                        },
                      },
                    })
                  }
                />
              </label>
              <p className="text-xs leading-relaxed text-[var(--rp-muted)]">
                {t("integrations.envHint")}
              </p>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "io" ? (
          <Card>
            <CardHeader title={t("io.title")} />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([exportJson()], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "site-config.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  {t("io.downloadJson")}
                </Button>
                <Button type="button" variant="outline" onClick={() => persist()}>
                  {t("io.forceSave")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const merged = deepMerge(defaultSiteConfig, config);
                    setImportText(JSON.stringify(merged, null, 2));
                  }}
                >
                  {t("io.prefill")}
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">
                  {t("io.importLabel")}
                </label>
                <Textarea
                  className="mt-2 min-h-[260px] font-mono text-xs"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t("io.importPlaceholder")}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      const res = importFromJson(importText);
                      if (!res.ok) {
                        setImportErr(res.error);
                        return;
                      }
                      setImportErr(null);
                    }}
                  >
                    {t("io.apply")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setImportText("")}>
                    {t("io.clear")}
                  </Button>
                </div>
                {importErr ? (
                  <div className="mt-3 text-sm text-[var(--rp-danger)]">{importErr}</div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
