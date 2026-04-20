"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { EXTENSION_CATALOG, type ExtensionListing } from "@/lib/extensions/catalog";
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
  const te = useTranslations("admin.extensions");
  const locale = useLocale();
  const { config, setConfig, persist } = useSiteConfig();
  const installed = useMemo(() => getExtensions(config), [config]);

  function categoryLabel(cat: string) {
    switch (cat) {
      case "forum":
        return te("category_forum");
      case "boutique":
        return te("category_boutique");
      case "communaute":
        return te("category_communaute");
      case "serveur":
        return te("category_serveur");
      case "ui":
        return te("category_ui");
      case "autre":
        return te("category_autre");
      default:
        return cat;
    }
  }

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
        text: te("msgZipImported", { name: parsed.manifest.name, file: file.name }),
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
      setMsg({ ok: false, text: te("msgComingSoon", { name: listing.name }) });
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
        if (!res.ok) throw new Error(te("msgDownloadFailed", { status: res.status }));
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
    setMsg({ ok: true, text: te("msgInstalled", { name: listing.name }) });
  }

  function handleUninstall(id: string, name: string) {
    if (!confirm(te("msgUninstallConfirm", { name }))) return;
    apply(uninstallExtension(config, id));
    setMsg({ ok: true, text: te("msgUninstalled", { name }) });
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
      setMsg({ ok: true, text: te("msgSaved") });
      setEditingId(null);
    } catch (err) {
      setMsg({
        ok: false,
        text: te("msgInvalidJson", { error: (err as Error).message }),
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
      setMsg({ ok: true, text: te("msgManualImported", { name: String(obj.name ?? obj.id) }) });
    } catch (err) {
      setMsg({ ok: false, text: te("msgInvalidJson", { error: (err as Error).message }) });
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
      <CardHeader title={te("cardTitle")} subtitle={te("cardSubtitle")} />
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
              <h3 className="text-base font-semibold text-[var(--rp-fg)]">{te("installedTitle")}</h3>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">
                {te("installedCount", { count: installed.length })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                disabled={zipBusy}
                onClick={() => zipInputRef.current?.click()}
              >
                {zipBusy ? te("importZipBusy") : te("importZip")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setManualOpen((v) => !v);
                  setManualJson("");
                }}
              >
                {manualOpen ? te("importJsonCancel") : te("importJson")}
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
            <span className="font-semibold text-[var(--rp-fg)]">{te("dropzoneBold")}</span>
            <span>
              {te("dropzoneRestBefore")}
              <span className="font-mono">extension.json</span>
              {te("dropzoneRestAfter")}
            </span>
          </label>

          {manualOpen ? (
            <div className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
              <p className="text-xs text-[var(--rp-muted)]">{te("manualHint")}</p>
              <Textarea
                className="mt-2 min-h-[140px] font-mono text-xs"
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                placeholder={te("manualPlaceholder")}
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" onClick={importManual}>
                  {te("manualImport")}
                </Button>
              </div>
            </div>
          ) : null}

          {installed.length === 0 ? (
            <p className="mt-3 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-4 py-6 text-center text-sm text-[var(--rp-muted)]">
              {te("emptyInstalled")}
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
                          <Badge tone="neutral">{categoryLabel(ext.category)}</Badge>
                        ) : null}
                        {ext.enabled ? (
                          <Badge tone="success">{te("badgeEnabled")}</Badge>
                        ) : (
                          <Badge tone="warning">{te("badgeDisabled")}</Badge>
                        )}
                        {ext.source === "manual" ? (
                          <Badge tone="neutral">{te("badgeImported")}</Badge>
                        ) : null}
                      </div>
                      {ext.description ? (
                        <p className="mt-1 text-xs text-[var(--rp-muted)]">{ext.description}</p>
                      ) : null}
                      <p className="mt-1 font-mono text-[10px] text-[var(--rp-muted)]">
                        {te("installedLine", {
                          id: ext.id,
                          date: new Date(ext.installedAt).toLocaleDateString(locale),
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs text-[var(--rp-muted)]">
                        <input
                          type="checkbox"
                          checked={ext.enabled}
                          onChange={(e) => handleToggle(ext.id, e.target.checked)}
                        />
                        {te("activate")}
                      </label>
                      <button
                        type="button"
                        className="rounded-full border border-[var(--rp-border)] px-3 py-1.5 text-xs font-semibold text-[var(--rp-fg)] hover:bg-white/10"
                        onClick={() => startEditingSettings(ext.id)}
                      >
                        {te("configure")}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-3 py-1.5 text-xs font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                        onClick={() => handleUninstall(ext.id, ext.name)}
                      >
                        {te("uninstall")}
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
                        {te("settingsLabel")}
                      </label>
                      <Textarea
                        className="mt-1.5 min-h-[120px] font-mono text-xs"
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button type="button" onClick={saveSettings}>
                          {te("save")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          {te("cancel")}
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
              <h3 className="text-base font-semibold text-[var(--rp-fg)]">{te("catalogTitle")}</h3>
              <p className="mt-1 text-xs text-[var(--rp-muted)]">{te("catalogSubtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", te("filterAll")],
                  ["free", te("filterFree")],
                  ["paid", te("filterPaid")],
                  ["installed", te("filterInstalled")],
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
              {te("catalogEmpty")}
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
                          <Badge tone="neutral">{categoryLabel(listing.category)}</Badge>
                          {listing.pricing === "free" ? (
                            <Badge tone="success">{te("badgeFree")}</Badge>
                          ) : (
                            <Badge tone="primary">
                              {listing.priceLabel ?? te("badgePaidDefault")}
                            </Badge>
                          )}
                          {isInstalled ? <Badge tone="accent">{te("badgeInstalled")}</Badge> : null}
                          {listing.comingSoon ? (
                            <Badge tone="warning">{te("badgeSoon")}</Badge>
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
                          {te("uninstall")}
                        </button>
                      ) : listing.comingSoon ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-full border border-[var(--rp-border)] bg-black/30 px-3 py-1.5 text-xs font-semibold text-[var(--rp-muted)]"
                        >
                          {te("soonForSale")}
                        </button>
                      ) : listing.pricing === "paid" ? (
                        <button
                          type="button"
                          onClick={() => handleInstall(listing)}
                          className="rounded-full bg-[var(--rp-primary)] px-3 py-1.5 text-xs font-semibold text-[#041016] hover:brightness-110"
                        >
                          {te("buyPrefix", { price: listing.priceLabel ?? te("badgePaidDefault") })}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInstall(listing)}
                          className="rounded-full bg-[var(--rp-primary)] px-3 py-1.5 text-xs font-semibold text-[#041016] hover:brightness-110"
                        >
                          {te("install")}
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
            {te("guideTitle")}
          </summary>
          <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-[var(--rp-muted)]">
            <p>
              {te("guideIntroBefore")}
              <span className="font-mono text-[var(--rp-fg)]">extension.json</span>
              {te("guideIntroAfter")}
            </p>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">{te("guide1Title")}</p>
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
                {te("guide1RulesBefore")}
                <span className="font-mono">{"[a-z0-9_-]{2,40}"}</span>
                {te("guide1RulesMid")}
                <span className="font-mono">extension.json</span>
                {te("guide1RulesAfter")}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">{te("guide2Title")}</p>
              <p>{te("guide2Body")}</p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">{te("guide3Title")}</p>
              <p>{te("guide3Intro")}</p>
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
                {te("guide3FooterBefore")}
                <span className="font-mono">src/components/extensions/ExtensionsHost.tsx</span>
                {te("guide3FooterAfter")}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[var(--rp-fg)]">{te("guide4Title")}</p>
              <p>{te("guide4Body")}</p>
              <p className="mt-1">
                {te("guide4ReadmeBefore")}
                <span className="font-mono">examples/extensions/README.md</span>
              </p>
            </div>
          </div>
        </details>
      </CardBody>
    </Card>
  );
}
