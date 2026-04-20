"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  | "support"
  | "forms"
  | "integrations"
  | "io";

const MODULE_LABELS: Record<keyof SiteConfig["modules"], string> = {
  announcementBar: "Bandeau d’annonces",
  playerCounter: "Compteur joueurs (accueil)",
  serverStatus: "Statut serveur",
  ipCopy: "Copie IP / commande",
  statsPreview: "Statistiques (aperçu accueil)",
  boutiquePromo: "Mise en avant boutique",
  newsHighlight: "Bloc actualités (accueil)",
  galleryFilters: "Filtres galerie",
  ticketVisual: "Visuel tickets (contact)",
  forum: "Forum communautaire",
  staffAutoFromAccounts: "Équipe : afficher automatiquement les comptes admin/modérateur",
};

export function AdminClient() {
  const { config, setConfig, resetConfig, persist, exportJson, importFromJson } =
    useSiteConfig();
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

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[var(--rp-muted)]">
        Chargement…
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-[var(--rp-fg)]">
          Configuration initiale
        </h1>
        <p className="mt-3 text-sm text-[var(--rp-muted)]">
          Aucun compte n’existe encore. Créez le compte administrateur pour accéder au panneau.
        </p>
        <Link
          href="/inscription"
          className="mt-6 inline-block rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
        >
          Créer le compte administrateur
        </Link>
      </div>
    );
  }

  if (!user || !hasPermission("admin.access")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-[var(--rp-fg)]">Accès refusé</h1>
        <p className="mt-3 text-sm text-[var(--rp-muted)]">
          Le panneau d’administration est réservé aux comptes ayant la permission{" "}
          <span className="font-mono">admin.access</span>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {!user ? (
            <Link
              href="/connexion"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[var(--rp-fg)] hover:bg-white/10"
            >
              Se connecter
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-full bg-[var(--rp-primary)] px-4 py-2 text-sm font-semibold text-[#041016] hover:brightness-110"
          >
            Retour à l’accueil
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
              Administration
            </h1>
            <p className="mt-2 text-sm text-[var(--rp-muted)]">
              Modifiez le branding sans toucher au code. Toutes les modifications sont
              <span className="font-semibold text-[var(--rp-success)]"> sauvegardées automatiquement </span>
              dans votre navigateur (localStorage) et exportables pour déploiement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--rp-success)_45%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-success)_10%,transparent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--rp-success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-success)]" aria-hidden />
              Auto-save activé
            </span>
            <Button type="button" variant="ghost" onClick={() => resetConfig()}>
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["identity", "Identité"],
              ["theme", "Thème"],
              ["server", "Serveur & liens"],
              ["modules", "Modules"],
              ["nav", "Navigation"],
              ["textes", "Textes & CSS"],
              ["contents", "Contenus"],
              ["users", "Utilisateurs"],
              ["roles", "Rôles & permissions"],
              ["forum-cats", "Catégories forum"],
              ["forum-logs", "Logs forum"],
              ["extensions", "Extensions"],
              ["support", "Support"],
              ["forms", "Formulaires"],
              ["integrations", "Intégrations"],
              ["io", "Import / Export"],
            ] as const
          ).map(([id, label]) => (
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
              {label}
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
            <CardHeader title="Identité & SEO" />
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Nom du serveur</label>
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
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Slogan</label>
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
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Description</label>
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
                  Mots-clés (séparés par des virgules)
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
                  Logo (URL image)
                </label>
                <Input
                  className="mt-2"
                  value={config.meta.logoUrl ?? ""}
                  placeholder="https://…"
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meta: { ...config.meta, logoUrl: e.target.value || undefined },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Langue UI</label>
                <select
                  className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)]"
                  value={config.locale}
                  onChange={(e) =>
                    setConfig({ ...config, locale: e.target.value as "fr" | "en" })
                  }
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "theme" ? (
          <Card>
            <CardHeader title="Thème dynamique" subtitle="Variables CSS appliquées en direct." />
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Mode</label>
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
                  <option value="dark">Sombre</option>
                  <option value="light">Clair</option>
                  <option value="system">Système</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Layout</label>
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
                  <option value="wide">Wide</option>
                  <option value="boxed">Boxed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Rayon</label>
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
                  Opacité overlay hero (0–1)
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
                  Image hero (URL)
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
                Overlay bruit (premium)
              </label>

              {(
                [
                  ["primary", "Primaire"],
                  ["secondary", "Secondaire"],
                  ["accent", "Accent"],
                  ["background", "Fond"],
                  ["surface", "Surface"],
                  ["muted", "Muted"],
                  ["border", "Bordure"],
                  ["foreground", "Texte"],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{label}</label>
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
            <CardHeader title="Modules" subtitle="Activez / désactivez des sections du template." />
            <CardBody className="grid gap-3 md:grid-cols-2">
              {(Object.keys(config.modules) as Array<keyof SiteConfig["modules"]>).map((k) => (
                <label
                  key={k}
                  className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{MODULE_LABELS[k]}</span>
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
            <CardHeader title="Navigation" />
            <CardBody className="space-y-4">
              {config.nav.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4 md:grid-cols-12 md:items-end"
                >
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">Label</label>
                    <Input
                      className="mt-2"
                      value={item.label}
                      onChange={(e) => updateNavItem(idx, { label: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">Href</label>
                    <Input
                      className="mt-2"
                      value={item.href}
                      onChange={(e) => updateNavItem(idx, { href: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">Id (stable)</label>
                    <Input className="mt-2" value={item.id} readOnly />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--rp-fg)] md:col-span-2">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateNavItem(idx, { enabled: e.target.checked })}
                    />
                    Actif
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
            <CardHeader
              title="Catégories du forum"
              subtitle="Créez, renommez et restreignez l’accès des catégories. Les catégories privées n’apparaissent qu’aux rôles autorisés."
            />
            <CardBody>
              <AdminForumCategoriesTab />
            </CardBody>
          </Card>
        ) : null}

        {tab === "extensions" ? <AdminExtensionsTab /> : null}

        {tab === "support" ? <AdminSupportTab /> : null}

        {tab === "forum-logs" ? (
          <Card>
            <CardHeader
              title="Logs du forum"
              subtitle="Historique des publications, modifications, suppressions et actions de modération. Inclut un export complet du forum (catégories, sujets, logs, notifications)."
            />
            <CardBody>
              <AdminForumLogsTab />
            </CardBody>
          </Card>
        ) : null}

        {tab === "forms" ? (
          <Card>
            <CardHeader
              title="Formulaires (JSON)"
              subtitle="Édition avancée : whitelist / staff / business. Validé au parse."
            />
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
              <div className="mt-3 text-xs text-[var(--rp-muted)]">
                Astuce : gardez la structure {`{ whitelist: FormField[], staff: … }`}. Un JSON
                invalide ne s applique pas tant que le parse échoue pendant la frappe.
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "integrations" ? (
          <Card>
            <CardHeader
              title="OAuth, Steam & Tebex"
              subtitle="Activez l’affichage des boutons et saisissez directement les clés serveur depuis ce panneau."
            />
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--rp-fg)]">
                  Clés serveur (Discord & Steam)
                </h3>
                <p className="mt-1 text-xs text-[var(--rp-muted)]">
                  Saisissez les identifiants directement ici : ils sont écrits dans un fichier{" "}
                  <span className="font-mono">.runtime/auth-config.json</span> côté serveur (hors
                  git) et lus en priorité par les routes <span className="font-mono">/api/auth/*</span>.
                </p>
                <div className="mt-3">
                  <AuthSecretsEditor />
                </div>
              </div>

              <div className="space-y-3 border-t border-[var(--rp-border)] pt-6">
              <h3 className="text-sm font-semibold text-[var(--rp-fg)]">Affichage public & Tebex</h3>
              <label className="flex items-center justify-between gap-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)]">
                <span>Bouton connexion Discord</span>
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
                <span>Bouton connexion Steam (OpenID)</span>
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
                  URL de base Tebex
                </label>
                <Input
                  className="mt-2"
                  value={config.integrations.tebex.storeBaseUrl}
                  placeholder="https://votre-boutique.tebex.io"
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
                <span>Générer liens /package/{`{id}`} si absent du produit</span>
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
                Si vous préférez l’ancienne méthode : variables d’environnement{" "}
                <span className="font-mono">AUTH_SECRET</span>,{" "}
                <span className="font-mono">DISCORD_CLIENT_ID</span>,{" "}
                <span className="font-mono">DISCORD_CLIENT_SECRET</span>,{" "}
                <span className="font-mono">DISCORD_REDIRECT_URI</span> (sinon dérivé de
                l’origine). Discord Developer Portal : URL de callback ={" "}
                <span className="font-mono">/api/auth/discord/callback</span>.
              </p>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === "io" ? (
          <Card>
            <CardHeader title="Import / Export" />
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
                  Télécharger JSON
                </Button>
                <Button type="button" variant="outline" onClick={() => persist()}>
                  Forcer la sauvegarde maintenant
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const merged = deepMerge(defaultSiteConfig, config);
                    setImportText(JSON.stringify(merged, null, 2));
                  }}
                >
                  Préremplir (export complet)
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">Importer</label>
                <Textarea
                  className="mt-2 min-h-[260px] font-mono text-xs"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Collez un JSON complet ou partiel…"
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
                    Appliquer & persister
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setImportText("")}>
                    Vider
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
