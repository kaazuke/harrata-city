"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import type { ExtensionListing } from "@/lib/extensions/catalog";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function longDescriptionToHtml(text: string) {
  const parts = text.split(/\n{2,}/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export function ListingPrepPanel() {
  const t = useTranslations("admin.listingPrep");
  const { config } = useSiteConfig();

  const [id, setId] = useState("ma-vitrine");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<ExtensionListing["category"]>("ui");
  const [pricing, setPricing] = useState<"free" | "paid">("paid");
  const [priceLabel, setPriceLabel] = useState("9,99 €");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [comingSoon, setComingSoon] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [tags, setTags] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const siteHint = config.meta?.siteName?.trim();
  const authorEffective = author.trim() || siteHint || "";

  const catalogSnippet = useMemo(() => {
    const tagsArr = tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const entry: Record<string, unknown> = {
      id: id.trim() || "mon-extension",
      name: name.trim() || id.trim(),
      description: shortDescription.trim() || longDescription.trim().slice(0, 240),
      version: version.trim() || "1.0.0",
      category,
      pricing,
      comingSoon,
    };
    if (authorEffective) entry.author = authorEffective;
    if (iconUrl.trim()) entry.iconUrl = iconUrl.trim();
    if (pricing === "paid" && priceLabel.trim()) entry.priceLabel = priceLabel.trim();
    if (purchaseUrl.trim()) entry.purchaseUrl = purchaseUrl.trim();
    if (tagsArr.length) entry.tags = tagsArr;
    entry.defaultSettings = {};
    return `${JSON.stringify(entry, null, 2)},`;
  }, [
    id,
    name,
    shortDescription,
    longDescription,
    version,
    category,
    pricing,
    priceLabel,
    purchaseUrl,
    comingSoon,
    tags,
    iconUrl,
    authorEffective,
  ]);

  const tebexHtml = useMemo(() => {
    const title = escapeHtml(name.trim() || id.trim());
    const short = escapeHtml(shortDescription.trim());
    const img = iconUrl.trim();
    const imgBlock = img
      ? `<p><img src="${escapeHtml(img)}" alt="${title}" width="800" style="max-width:100%;height:auto;border-radius:12px;display:block;margin:0 auto" /></p>\n`
      : "";
    const body = longDescription.trim()
      ? `\n${longDescriptionToHtml(longDescription.trim())}\n`
      : "";
    const shortBlock = short ? `<p><strong>${short}</strong></p>\n` : "";
    return `${imgBlock}${shortBlock}${body}`.trim();
  }, [id, name, shortDescription, longDescription, iconUrl]);

  const discordBlurb = useMemo(() => {
    const lines = [
      `**${name.trim() || id.trim()}**`,
      shortDescription.trim(),
      purchaseUrl.trim() ? t("discordLink", { url: purchaseUrl.trim() }) : "",
    ].filter(Boolean);
    return lines.join("\n\n");
  }, [t, id, name, shortDescription, purchaseUrl]);

  const absoluteIcon = useMemo(() => {
    if (!iconUrl.trim()) return "";
    const u = iconUrl.trim();
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (typeof window !== "undefined") return `${window.location.origin}${u.startsWith("/") ? u : `/${u}`}`;
    return u;
  }, [iconUrl]);

  async function onPickImage(file: File | null) {
    setUploadErr(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/marketplace", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(data.error || t("uploadFailed"));
      }
      setIconUrl(data.url);
    } catch (e) {
      setUploadErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function copyText(text: string, successMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint(successMsg);
      setTimeout(() => setCopyHint(null), 2200);
    } catch {
      setCopyHint(t("copyError"));
      setTimeout(() => setCopyHint(null), 2200);
    }
  }

  return (
    <Card>
      <CardHeader title={t("title")} subtitle={t("subtitle")} />
      <CardBody className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--rp-fg)]">{t("sectionIdentity")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldId")}</label>
              <Input
                className="mt-2 font-mono text-sm"
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="ma-vitrine"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldName")}</label>
              <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldVersion")}</label>
              <Input className="mt-2" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldAuthor")}</label>
              <Input
                className="mt-2"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={siteHint || ""}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldCategory")}</label>
              <select
                className="mt-2 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)]"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExtensionListing["category"])}
              >
                <option value="ui">{t("cat_ui")}</option>
                <option value="forum">{t("cat_forum")}</option>
                <option value="boutique">{t("cat_boutique")}</option>
                <option value="communaute">{t("cat_communaute")}</option>
                <option value="serveur">{t("cat_serveur")}</option>
                <option value="autre">{t("cat_autre")}</option>
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldPricing")}</label>
                <select
                  className="mt-2 w-full min-w-[8rem] rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/30 px-3 py-2 text-sm text-[var(--rp-fg)]"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value as "free" | "paid")}
                >
                  <option value="free">{t("pricingFree")}</option>
                  <option value="paid">{t("pricingPaid")}</option>
                </select>
              </div>
              {pricing === "paid" ? (
                <div className="min-w-[8rem] flex-1">
                  <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldPriceLabel")}</label>
                  <Input
                    className="mt-2"
                    value={priceLabel}
                    onChange={(e) => setPriceLabel(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldPurchaseUrl")}</label>
              <Input
                className="mt-2"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--rp-muted)] md:col-span-2">
              <input
                type="checkbox"
                checked={comingSoon}
                onChange={(e) => setComingSoon(e.target.checked)}
              />
              {t("fieldComingSoon")}
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--rp-fg)]">{t("sectionMedia")}</h3>
          <p className="text-xs text-[var(--rp-muted)]">{t("mediaHint")}</p>
          <div className="flex flex-wrap items-start gap-4">
            <div className="shrink-0">
              {(previewUrl || iconUrl) && (
                // eslint-disable-next-line @next/next/no-img-element -- URL dynamique (upload / externe)
                <img
                  src={previewUrl || iconUrl}
                  alt=""
                  className="h-28 w-28 rounded-[var(--rp-radius)] border border-[var(--rp-border)] object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-xs text-[var(--rp-muted)] file:mr-3 file:rounded file:border-0 file:bg-[var(--rp-primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#041016]"
                disabled={uploading}
                onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
              />
              {uploading ? <p className="text-xs text-[var(--rp-muted)]">{t("uploading")}</p> : null}
              {uploadErr ? <p className="text-xs text-[var(--rp-danger)]">{uploadErr}</p> : null}
              <div>
                <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldIconUrl")}</label>
                <Input
                  className="mt-2 font-mono text-xs"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="/uploads/marketplace/… ou https://…"
                />
              </div>
              {absoluteIcon ? (
                <p className="text-[11px] text-[var(--rp-muted)]">
                  {t("absoluteUrl")} <span className="break-all font-mono text-[var(--rp-fg)]">{absoluteIcon}</span>
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--rp-fg)]">{t("sectionCopy")}</h3>
          <div>
            <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldShort")}</label>
            <Textarea
              className="mt-2 min-h-[4rem]"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder={t("placeholderShort")}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldLong")}</label>
            <Textarea
              className="mt-2 min-h-[12rem]"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder={t("placeholderLong")}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--rp-muted)]">{t("fieldTags")}</label>
            <Input
              className="mt-2"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2"
            />
          </div>
        </section>

        <section className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-[var(--rp-fg)]">{t("sectionPreview")}</h3>
          <div
            className="prose prose-invert mt-3 max-w-none text-sm text-[var(--rp-muted)] prose-p:my-2 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: tebexHtml || `<p>${escapeHtml(t("previewEmpty"))}</p>` }}
          />
        </section>

        <section className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => copyText(catalogSnippet, t("copiedJson"))}>
            {t("copyJson")}
          </Button>
          <Button type="button" variant="outline" onClick={() => copyText(tebexHtml, t("copiedHtml"))}>
            {t("copyHtml")}
          </Button>
          <Button type="button" variant="outline" onClick={() => copyText(discordBlurb, t("copiedDiscord"))}>
            {t("copyDiscord")}
          </Button>
        </section>
        {copyHint ? (
          <p className="text-xs font-medium text-[var(--rp-success)]">{copyHint}</p>
        ) : null}

        <section className="space-y-2 border-t border-[var(--rp-border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--rp-fg)]">{t("sectionHowto")}</h3>
          <ol className="list-decimal space-y-2 pl-5 text-xs text-[var(--rp-muted)]">
            <li>{t("howto1")}</li>
            <li>{t("howto2")}</li>
            <li>{t("howto3")}</li>
            <li>{t("howto4")}</li>
          </ol>
          <pre className="mt-2 overflow-x-auto rounded border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-[var(--rp-fg)]">
            {catalogSnippet}
          </pre>
        </section>
      </CardBody>
    </Card>
  );
}
