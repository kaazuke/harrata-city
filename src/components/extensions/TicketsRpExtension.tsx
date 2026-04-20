"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";
import {
  addTicket,
  TICKET_TYPE_LABELS,
  type TicketType,
} from "@/lib/extensions/tickets-store";

interface TicketsSettings {
  buttonLabel?: string;
  position?: "top-left" | "bottom-left";
  accentColor?: string;
  allowAnonymous?: boolean;
}

export function TicketsRpExtension() {
  const { config } = useSiteConfig();
  const { user } = useAccount();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TicketType>("report");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const enabled = isExtensionEnabled(config, "tickets-rp");
  const ext = getExtension(config, "tickets-rp");
  const settings = (ext?.settings ?? {}) as TicketsSettings;

  const accent = settings.accentColor?.trim() || "#ff8c42";
  const position = settings.position === "bottom-left" ? "bottom-left" : "top-left";
  const buttonLabel = settings.buttonLabel?.trim() || "Signaler";
  const allowAnon = settings.allowAnonymous ?? false;

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !enabled) return null;

  function submit() {
    setError(null);
    setSuccess(null);
    if (!user && !allowAnon) {
      setError("Connectez-vous pour ouvrir un ticket.");
      return;
    }
    const t = title.trim();
    const d = desc.trim();
    if (t.length < 3) {
      setError("Titre trop court (3 caractères minimum).");
      return;
    }
    if (d.length < 10) {
      setError("Description trop courte (10 caractères minimum).");
      return;
    }
    addTicket({
      type,
      title: t.slice(0, 120),
      description: d.slice(0, 2000),
      authorId: user?.id ?? null,
      authorName:
        user?.profile.displayName?.trim() || user?.username || "Anonyme",
    });
    setSuccess("Ticket envoyé. Le staff sera notifié.");
    setTitle("");
    setDesc("");
    setTimeout(() => {
      setOpen(false);
      setSuccess(null);
    }, 1400);
  }

  const positionClass =
    position === "bottom-left" ? "left-4 bottom-20 sm:left-6 sm:bottom-24" : "left-4 top-20 sm:left-6";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed z-30 ${positionClass} flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-xl transition hover:scale-105`}
        style={{ background: accent }}
        aria-label="Ouvrir un ticket"
      >
        <span aria-hidden>🎫</span>
        <span>{buttonLabel}</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border bg-[var(--rp-surface)] shadow-2xl"
            style={{
              borderColor: `color-mix(in oklab, ${accent} 35%, var(--rp-border))`,
            }}
          >
            <header
              className="flex items-center justify-between gap-2 border-b px-4 py-3"
              style={{
                borderColor: `color-mix(in oklab, ${accent} 25%, var(--rp-border))`,
                background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 18%, transparent), transparent)`,
              }}
            >
              <h3 className="text-sm font-semibold text-[var(--rp-fg)]">
                Nouveau ticket RP
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-[var(--rp-muted)] hover:bg-white/10"
                aria-label="Fermer"
              >
                ✕
              </button>
            </header>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-3 p-4"
            >
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                  Type
                </label>
                <div className="mt-2 flex gap-1.5">
                  {(Object.keys(TICKET_TYPE_LABELS) as TicketType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        type === t
                          ? "text-[var(--rp-fg)]"
                          : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
                      }`}
                      style={
                        type === t
                          ? {
                              borderColor: accent,
                              background: `color-mix(in oklab, ${accent} 18%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      {TICKET_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                  Titre
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                  placeholder="Résumé court"
                  className="mt-1 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)] outline-none focus:border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  maxLength={2000}
                  required
                  rows={5}
                  placeholder="Décrivez la situation, les pseudos concernés, l'heure approximative…"
                  className="mt-1 w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-sm text-[var(--rp-fg)] outline-none focus:border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))]"
                />
                <p className="mt-0.5 text-right text-[10px] text-[var(--rp-muted)]">
                  {desc.length}/2000
                </p>
              </div>

              {!user ? (
                <p className="text-[11px] text-[var(--rp-muted)]">
                  {allowAnon
                    ? "Vous serez enregistré comme « Anonyme »."
                    : "Connectez-vous pour ouvrir un ticket."}
                </p>
              ) : (
                <p className="text-[11px] text-[var(--rp-muted)]">
                  Auteur : <span className="font-mono">{user.username}</span>
                </p>
              )}

              {error ? (
                <p className="text-xs text-[var(--rp-danger)]">{error}</p>
              ) : null}
              {success ? (
                <p className="text-xs text-[var(--rp-success)]">{success}</p>
              ) : null}

              <div className="flex justify-end gap-2 border-t border-[var(--rp-border)] pt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--rp-border)] px-3 py-1.5 text-xs font-semibold text-[var(--rp-muted)] hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  style={{ background: accent }}
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
