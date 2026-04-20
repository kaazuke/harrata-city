"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import {
  CATEGORY_LABELS,
  EXTENSION_CATALOG,
  type ExtensionListing,
} from "@/lib/extensions/catalog";
import {
  getExtensions,
  installFromListing,
  installManual,
  isExtensionInstalled,
  setExtensionEnabled,
  uninstallExtension,
  updateExtensionSettings,
} from "@/lib/extensions/manage";
import { buildExtensionFromZip, parseExtensionZip } from "@/lib/extensions/zip";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { TicketsAdminPanel } from "@/components/admin/TicketsAdminPanel";

type Msg = { ok: boolean; text: string } | null;

export function AdminExtensionsTab() {
  const { config, setConfig, persist } = useSiteConfig();
  const installed = useMemo(() => getExtensions(config), [config]);

  const [msg, setMsg] = useState<Msg>(null);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "installed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualJson, setManualJson] = useState("");
  const [zipBusy, setZipBusy] = useState(false);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  function apply(next: typeof config) {
    setConfig(next);
    persist(next);
  }

  async function handleZipFile(file: File) {
    setMsg(null);
    setZipBusy(true);
    try {
      const parsed = await parseExtensionZip(file);
      const partial = buildExtensionFromZip(parsed);
      const res = installManual(config, partial as Parameters<typeof installManual>[1]);
      if (!res.ok) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      apply(res.config);
      setMsg({
        ok: true,
        text: `« ${parsed.manifest.name} » importée depuis ${file.name}.`,
      });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setZipBusy(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  }

  function onZipInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleZipFile(file);
  }

  function onZipDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find(
      (f) => f.name.toLowerCase().endsWith(".zip"),
    );
    if (file) void handleZipFile(file);
  }

  async function handleInstall(listing: ExtensionListing) {
    if (listing.comingSoon) {
      setMsg({ ok: false, text: `« ${listing.name} » sera bientôt en vente.` });
      return;
    }
    if (listing.pricing === "paid" && listing.purchaseUrl) {
      window.open(listing.purchaseUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (
      listing.pricing === "free" &&
      listing.purchaseUrl &&
      listing.purchaseUrl.toLowerCase().endsWith(".zip")
    ) {
      setMsg(null);
      setZipBusy(true);
      try {
        const res = await fetch(listing.purchaseUrl);
        if (!res.ok) throw new Error(`Téléchargement échoué (HTTP ${res.status}).`);
        const blob = await res.blob();
        const filename = listing.purchaseUrl.split("/").pop() ?? "extension.zip";
        await handleZipFile(new File([blob], filename, { type: "application/zip" }));
      } catch (err) {
        setMsg({ ok: false, text: (err as Error).message });
        setZipBusy(false);
      }
      return;
    }
    apply(installFromListing(config, listing));
    setMsg({ ok: true, text: `« ${listing.name} » installée.` });
  }

  function handleUninstall(id: string, name: string) {
    if (!confirm(`Désinstaller « ${name} » ? Sa configuration sera perdue.`)) return;
    apply(uninstallExtension(config, id));
    setMsg({ ok: true, text: `« ${name} » désinstallée.` });
  }

  function handleToggle(id: string, enabled: boolean) {
    apply(setExtensionEnabled(config, id, enabled));
  }

  function startEditingSettings(id: string) {
    const ext = installed.find((e) => e.id === id);
    if (!ext) return;
    setEditingId(id);
    setEditBuffer(JSON.stringify(ext.settings ?? {}, null, 2));
  }

  function saveSettings() {
    if (!editingId) return;
    try {
      const parsed = editBuffer.trim()
        ? (JSON.parse(editBuffer) as Record<string, unknown>)
        : {};
      apply(updateExtensionSettings(config, editingId, parsed));
      setMsg({ ok: true, text: "Configuration enregistrée." });
      setEditingId(null);
    } catch (err) {
      setMsg({
        ok: false,
        text: `JSON invalide : ${(err as Error).message}`,
      });
    }
  }

  function importManual() {
    setMsg(null);
    try {
      const obj = JSON.parse(manualJson);
      const res = installManual(config, obj);
      if (!res.ok) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      apply(res.config);
      setManualJson("");
      setManualOpen(false);
      setMsg({ ok: true, text: `« ${obj.name ?? obj.id} » importée.` });
    } catch (err) {
      setMsg({ ok: false, text: `JSON invalide : ${(err as Error).message}` });
    }
  }

  const visibleCatalog = useMemo(() => {
    if (filter === "installed") {
      return EXTENSION_CATALOG.filter((l) => isExtensionInstalled(config, l.id));
    }
    if (filter === "free") return EXTENSION_CATALOG.filter((l) => l.pricing === "free");
    if (filter === "paid") return EXTENSION_CATALOG.filter((l) => l.pricing === "paid");
    return EXTENSION_CATALOG;
  }, [filter, config]);

  return (
    <Card>
      <CardHeader
        title="Extensions"
        subtitle="Activez, configurez ou achetez des extensions pour enrichir votre site (modules forum, intégrations, packs visuels…)."
      />
      <CardBody className="space-y-8">
        {msg ? (
          <p
            className={`text-xs ${
              msg.ok ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
            }`}
          >
            {msg.text}
          </p>
        ) : null}

        {/* ─────────────── Installées ─────────────── */}
        <section>
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--rp-fg)]">
                Extensions installées
              </h3>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                {installed.length} extension(s) installée(s) sur cette instance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                disabled={zipBusy}
                onClick={() => zipInputRef.current?.click()}
              >
                {zipBusy ? "Extraction…" : "Importer un .zip"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setManualOpen((v) => !v);
                  setManualJson("");
                }}
              >
                {manualOpen ? "Annuler" : "Importer un JSON"}
              </Button>
            </div>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={onZipInputChange}
            />
          </header>

          {/* Zone drag & drop */}
          <label
            htmlFor="ext-zip-input"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onZipDrop}
            className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--rp-radius)] border border-dashed border-[var(--rp-border)] bg-black/15 px-4 py-5 text-center text-xs text-[var(--rp-muted)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] hover:bg-black/25"
            onClick={() => zipInputRef.current?.click()}
          >
            <span className="font-semibold text-[var(--rp-fg)]">
              Glissez-déposez un fichier .zip
            </span>
            <span>
              ou cliquez pour choisir un fichier. L&apos;archive doit contenir un{" "}
              <span className="font-mono">extension.json</span> à la racine. Limite 5 Mo.
            </span>
          </label>

          {manualOpen ? (
            <div className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
              <p className="text-xs text-[var(--rp-muted)]">
                Collez un JSON d&apos;extension. Champs obligatoires :{" "}
                <span className="font-mono">id</span>,{" "}
                <span className="font-mono">name</span>,{" "}
                <span className="font-mono">version</span>.
              </p>
              <Textarea
                className="mt-2 min-h-[140px] font-mono text-xs"
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                placeholder={`{
  "id": "mon-extension",
  "name": "Mon extension",
  "version": "1.0.0",
  "description": "…",
  "settings": {}
}`}
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" onClick={importManual}>
                  Importer
                </Button>
              </div>
            </div>
          ) : null}

          {installed.length === 0 ? (
            <p className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-center text-sm text-[var(--rp-muted)]">
              Aucune extension installée pour le moment. Parcourez le catalogue ci-dessous.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {installed.map((ext) => (
                <li
                  key={ext.id}
                  className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--rp-fg)]">
                          {ext.name}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--rp-muted)]">
                          v{ext.version}
                        </span>
                        {ext.category ? (
                          <Badge tone="neutral">
                            {CATEGORY_LABELS[ext.category as keyof typeof CATEGORY_LABELS] ??
                              ext.category}
                          </Badge>
                        ) : null}
                        {ext.enabled ? (
                          <Badge tone="success">Activée</Badge>
                        ) : (
                          <Badge tone="warning">Désactivée</Badge>
                        )}
                        {ext.source === "manual" ? (
                          <Badge tone="neutral">Importée</Badge>
                        ) : null}
                      </div>
                      {ext.description ? (
                        <p className="mt-1 text-xs text-[var(--rp-muted)]">{ext.description}</p>
                      ) : null}
                      <p className="mt-1 font-mono text-[10px] text-[var(--rp-muted)]">
                        {ext.id} · installée le{" "}
                        {new Date(ext.installedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs text-[var(--rp-muted)]">
                        <input
                          type="checkbox"
                          checked={ext.enabled}
                          onChange={(e) => handleToggle(ext.id, e.target.checked)}
                        />
                        Activer
                      </label>
                      <button
                        type="button"
                        className="rounded-full border border-[var(--rp-border)] px-3 py-1.5 text-xs font-semibold text-[var(--rp-fg)] hover:bg-white/10"
                        onClick={() => startEditingSettings(ext.id)}
                      >
                        Configurer
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                        onClick={() => handleUninstall(ext.id, ext.name)}
                      >
                        Désinstaller
                      </button>
                    </div>
                  </div>

                  {ext.id === "analytics-pageviews" && ext.enabled ? (
                    <div className="mt-3">
                      <AnalyticsDashboard />
                    </div>
                  ) : null}
                  {ext.id === "tickets-rp" && ext.enabled ? (
                    <div className="mt-3">
                      <TicketsAdminPanel />
                    </div>
                  ) : null}

                  {editingId === ext.id ? (
                    <div className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 p-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                        Settings (JSON)
                      </label>
                      <Textarea
                        className="mt-1.5 min-h-[120px] font-mono text-xs"
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button type="button" onClick={saveSettings}>
                          Enregistrer
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─────────────── Catalogue ─────────────── */}
        <section className="border-t border-[var(--rp-border)] pt-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--rp-fg)]">
                Catalogue d&apos;extensions
              </h3>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                Extensions officielles. Le marketplace en ligne arrive bientôt — vous pouvez
                déjà préparer vos slots.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Tout"],
                  ["free", "Gratuit"],
                  ["paid", "Payant"],
                  ["installed", "Installé"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    filter === id
                      ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                      : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          {visibleCatalog.length === 0 ? (
            <p className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-center text-sm text-[var(--rp-muted)]">
              Aucune extension dans ce filtre.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {visibleCatalog.map((listing) => {
                const isInstalled = isExtensionInstalled(config, listing.id);
                return (
                  <article
                    key={listing.id}
                    className="flex flex-col rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4"
                  >
                    <header className="flex items-start gap-3">
                      <div
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--rp-radius)] border border-white/12 bg-gradient-to-br from-[var(--rp-primary)]/25 to-[var(--rp-secondary)]/20 text-sm font-black text-[var(--rp-fg)]"
                        aria-hidden
                      >
                        {listing.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.iconUrl}
                            alt=""
                            className="h-full w-full rounded-[var(--rp-radius)] object-cover"
                          />
                        ) : (
                          listing.name.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--rp-fg)]">
                            {listing.name}
                          </span>
                          <Badge tone="neutral">{CATEGORY_LABELS[listing.category]}</Badge>
                          {listing.pricing === "free" ? (
                            <Badge tone="success">Gratuit</Badge>
                          ) : (
                            <Badge tone="primary">
                              {listing.priceLabel ?? "Payant"}
                            </Badge>
                          )}
                          {isInstalled ? <Badge tone="accent">Installée</Badge> : null}
                          {listing.comingSoon ? (
                            <Badge tone="warning">Bientôt</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[var(--rp-muted)]">
                          v{listing.version}
                          {listing.author ? ` · ${listing.author}` : ""}
                        </p>
                      </div>
                    </header>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--rp-fg)]">
                      {listing.description}
                    </p>

                    {listing.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {listing.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-[var(--rp-muted)]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[var(--rp-muted)]">
                        {listing.id}
                      </span>
                      {isInstalled ? (
                        <button
                          type="button"
                          onClick={() => handleUninstall(listing.id, listing.name)}
                          className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                        >
                          Désinstaller
                        </button>
                      ) : listing.comingSoon ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-full border border-[var(--rp-border)] bg-black/30 px-3 py-1.5 text-xs font-semibold text-[var(--rp-muted)]"
                        >
                          Bientôt en vente
                        </button>
                      ) : listing.pricing === "paid" ? (
                        <button
                          type="button"
                          onClick={() => handleInstall(listing)}
                          className="rounded-full bg-[var(--rp-primary)] px-3 py-1.5 text-xs font-semibold text-[#041016] hover:brightness-110"
                        >
                          Acheter — {listing.priceLabel ?? ""}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInstall(listing)}
                          className="rounded-full bg-[var(--rp-primary)] px-3 py-1.5 text-xs font-semibold text-[#041016] hover:brightness-110"
                        >
                          Installer
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <details className="group rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 px-4 py-3">
          <summary className="cursor-pointer list-none text-xs font-semibold text-[var(--rp-fg)] hover:text-[var(--rp-primary)]">
            <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">▶</span>
            Comment créer ma propre extension ?
          </summary>
          <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-[var(--rp-muted)]">
            <p>
              Une extension = un fichier{" "}
              <span className="font-mono text-[var(--rp-fg)]">extension.json</span> (à la racine
              d&apos;un zip) + optionnellement du code React qui consomme ses settings.
            </p>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">1. Le manifest minimal</p>
              <pre className="mt-1 overflow-x-auto rounded border border-white/10 bg-black/40 p-2 font-mono text-[11px] text-[var(--rp-fg)]">
{`{
  "id": "mon-extension",
  "name": "Mon extension",
  "version": "1.0.0",
  "category": "ui",
  "description": "Une phrase.",
  "settings": { "couleur": "#7aa2f7" }
}`}
              </pre>
              <p className="mt-1">
                Règles : <span className="font-mono">id</span> matche{" "}
                <span className="font-mono">[a-z0-9_-]&#123;2,40&#125;</span>. Zip ≤ 5 Mo.{" "}
                <span className="font-mono">extension.json</span> à la racine, pas dans un
                sous-dossier.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">2. L&apos;importer</p>
              <p>
                Glissez le zip dans la zone d&apos;import ci-dessus, ou collez le JSON via
                « Importer un JSON ». L&apos;extension apparaît dans « Installées ».
              </p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">3. Lui donner un effet visible</p>
              <p>
                Dans votre code, créez un composant React qui teste la présence de l&apos;extension
                et lit ses settings :
              </p>
              <pre className="mt-1 overflow-x-auto rounded border border-white/10 bg-black/40 p-2 font-mono text-[11px] text-[var(--rp-fg)]">
{`import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

export function MonExtension() {
  const { config } = useSiteConfig();
  if (!isExtensionEnabled(config, "mon-extension")) return null;
  const ext = getExtension(config, "mon-extension");
  return <div>{ext?.settings?.couleur as string}</div>;
}`}
              </pre>
              <p className="mt-1">
                Montez le composant dans{" "}
                <span className="font-mono">src/components/extensions/ExtensionsHost.tsx</span>{" "}
                pour qu&apos;il soit présent partout.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">4. Inspirations</p>
              <p>
                Regardez les extensions existantes pour voir des cas concrets :{" "}
                <span className="font-mono">welcome-banner</span> (cas simple),{" "}
                <span className="font-mono">live-chat</span> (BroadcastChannel),{" "}
                <span className="font-mono">tickets-rp</span> (store dédié + admin),{" "}
                <span className="font-mono">fivem-player-counter</span> (fetch API + cache).
              </p>
              <p className="mt-1">
                Guide complet :{" "}
                <span className="font-mono">examples/extensions/README.md</span>
              </p>
            </div>
          </div>
        </details>
      </CardBody>
    </Card>
  );
}
