"use client";

import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { defaultSiteConfig } from "@/config/default-site";
import type { Announcement, LayoutCopy } from "@/config/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

const ROWS: { key: keyof LayoutCopy; label: string; multiline?: boolean }[] = [
  { key: "headerTagline", label: "En-tête — ligne sous le nom du site" },
  { key: "announcementBadge", label: "Bandeau — pastille (ex. Info)" },
  { key: "homeHeroBadge", label: "Accueil — badge au-dessus du titre" },
  { key: "homeJoinCfx", label: "Accueil — bouton rejoindre (lien Cfx.re présent)" },
  { key: "homeJoinNoLink", label: "Accueil — bouton rejoindre (sans lien)" },
  { key: "homeDiscord", label: "Accueil — bouton Discord" },
  { key: "homeSectionWhyTitle", label: "Section « Pourquoi » — titre" },
  { key: "homeSectionWhyDesc", label: "Section « Pourquoi » — description", multiline: true },
  { key: "homeWhyCta", label: "Section « Pourquoi » — libellé du lien" },
  { key: "homeNewsTitle", label: "Section actualités — titre" },
  { key: "homeNewsCta", label: "Section actualités — libellé du lien" },
  { key: "homeStatsTitle", label: "Section stats — titre" },
  { key: "homeStatsDesc", label: "Section stats — description", multiline: true },
  { key: "homeStatsCta", label: "Section stats — libellé du lien" },
  { key: "homeForumTitle", label: "Accueil — bloc forum — titre" },
  { key: "homeForumDesc", label: "Accueil — bloc forum — description", multiline: true },
  { key: "homeForumCta", label: "Accueil — bloc forum — libellé du lien" },
  { key: "homeForumHeroLabel", label: "Accueil — bouton hero vers le forum" },
  { key: "serverPanelTitle", label: "Panneau serveur — titre (ex. Serveur)" },
  { key: "serverPanelSubtitle", label: "Panneau serveur — sous-titre" },
  { key: "serverLiveBadge", label: "Panneau serveur — badge Live" },
  { key: "serverColPlayers", label: "Colonne joueurs — titre" },
  { key: "serverColStatus", label: "Colonne statut — titre" },
  { key: "serverColConnection", label: "Colonne connexion — titre" },
  { key: "serverCopyButton", label: "Bouton copier (non copié)" },
  { key: "serverCopiedButton", label: "Bouton copier (état copié)" },
  { key: "serverStatusOnline", label: "Libellé statut en ligne" },
  { key: "serverStatusMaintenance", label: "Libellé maintenance" },
  { key: "serverStatusOffline", label: "Libellé hors ligne" },
  { key: "footerCommunityEyebrow", label: "Footer — surtitre colonne 1" },
  { key: "footerLinksEyebrow", label: "Footer — surtitre liens" },
  { key: "footerLegalEyebrow", label: "Footer — surtitre légal" },
  { key: "footerLegalBody", label: "Footer — texte légal", multiline: true },
  { key: "footerContactLink", label: "Footer — lien contact" },
  { key: "footerDiscord", label: "Footer — libellé Discord" },
  { key: "footerCfx", label: "Footer — libellé Cfx.re" },
  { key: "footerTebex", label: "Footer — libellé boutique" },
  { key: "customCss", label: "CSS personnalisé (global)", multiline: true },
];

export function AdminLayoutCopyTab() {
  const { config, setConfig } = useSiteConfig();
  const lc = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
  const announcements = config.announcements ?? [];

  function setField<K extends keyof LayoutCopy>(key: K, value: LayoutCopy[K]) {
    const base = config.layoutCopy ?? defaultSiteConfig.layoutCopy;
    setConfig({
      ...config,
      layoutCopy: { ...base, [key]: value },
    });
  }

  function setAnnouncements(next: Announcement[]) {
    setConfig({ ...config, announcements: next });
  }

  function addAnnouncement() {
    const id = `a${Date.now().toString(36)}`;
    setAnnouncements([
      ...announcements,
      { id, text: "Nouvelle annonce — clique pour modifier le texte.", active: true },
    ]);
  }

  function updateAnnouncement(id: string, patch: Partial<Announcement>) {
    setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAnnouncement(id: string) {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  }

  function moveAnnouncement(id: string, dir: -1 | 1) {
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= announcements.length) return;
    const next = announcements.slice();
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setAnnouncements(next);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Bandeau d’annonces"
          subtitle="Les annonces actives défilent automatiquement en haut du site avec une animation."
          actions={
            <Button onClick={addAnnouncement}>+ Ajouter</Button>
          }
        />
        <CardBody className="space-y-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--rp-muted)]">
              Aucune annonce. Ajoute-en une pour qu’elle s’affiche dans le bandeau du haut.
            </p>
          ) : (
            announcements.map((a, i) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex flex-col gap-1 text-[10px] text-[var(--rp-muted)] sm:w-12">
                  <span className="font-mono">#{i + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(a.id, -1)}
                      disabled={i === 0}
                      className="rounded border border-[var(--rp-border)] px-1 leading-none disabled:opacity-30"
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(a.id, 1)}
                      disabled={i === announcements.length - 1}
                      className="rounded border border-[var(--rp-border)] px-1 leading-none disabled:opacity-30"
                      aria-label="Descendre"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <Input
                  className="flex-1"
                  value={a.text}
                  onChange={(e) => updateAnnouncement(a.id, { text: e.target.value })}
                  placeholder="Texte de l’annonce"
                />
                <label className="inline-flex items-center gap-2 text-xs text-[var(--rp-muted)]">
                  <input
                    type="checkbox"
                    checked={a.active}
                    onChange={(e) => updateAnnouncement(a.id, { active: e.target.checked })}
                  />
                  Active
                </label>
                <Button
                  variant="ghost"
                  onClick={() => removeAnnouncement(a.id)}
                  className="text-[var(--rp-danger)]"
                >
                  Suppr.
                </Button>
              </div>
            ))
          )}
          <p className="pt-1 text-[11px] text-[var(--rp-muted)]">
            Astuce : avec 2 annonces actives ou plus, le bandeau passe automatiquement de l’une à
            l’autre toutes les 6 secondes (animation slide + fondu). Survole-le pour mettre en
            pause.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Textes & CSS"
          subtitle="Tout le texte « fixe » du template (hors contenus longs type articles / règlement). Le CSS s’ajoute après les variables du thème."
        />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {ROWS.map(({ key, label, multiline }) => (
            <div key={key} className={multiline ? "md:col-span-2" : undefined}>
              <label className="text-xs font-semibold text-[var(--rp-muted)]">{label}</label>
              {multiline ? (
                <Textarea
                  className={`mt-2 font-mono text-xs ${key === "customCss" ? "min-h-[10rem]" : "min-h-[4rem]"}`}
                  value={lc[key] as string}
                  onChange={(e) => setField(key, e.target.value as LayoutCopy[typeof key])}
                />
              ) : (
                <Input
                  className="mt-2"
                  value={lc[key] as string}
                  onChange={(e) => setField(key, e.target.value as LayoutCopy[typeof key])}
                />
              )}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
