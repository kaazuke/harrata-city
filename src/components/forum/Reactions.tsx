"use client";

import { useState } from "react";
import type { ForumReaction } from "@/config/types";
import { FORUM_EMOJIS } from "@/lib/forum-mutate";

export function Reactions({
  reactions,
  currentUser,
  onToggle,
  disabled,
}: {
  reactions?: ForumReaction[];
  currentUser?: string | null;
  onToggle: (emoji: string) => void;
  disabled?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const list = Array.isArray(reactions) ? reactions : [];
  const u = currentUser?.trim().toLowerCase() ?? "";

  const usedEmojis = new Set(list.map((r) => r.emoji));
  const available = FORUM_EMOJIS.filter((e) => !usedEmojis.has(e));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {list.map((r) => {
        const mine =
          !!u && r.users.some((x) => x.trim().toLowerCase() === u);
        return (
          <button
            key={r.emoji}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(r.emoji)}
            title={r.users.map((x) => `@${x}`).join(", ")}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
              mine
                ? "border-[color-mix(in_oklab,var(--rp-primary)_50%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-primary)_15%,transparent)] text-[var(--rp-fg)]"
                : "border-[var(--rp-border)] bg-white/[0.04] text-[var(--rp-muted)] hover:bg-white/[0.08]"
            } disabled:opacity-50`}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            <span className="font-semibold tabular-nums">{r.users.length}</span>
          </button>
        );
      })}

      {!disabled ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex h-6 items-center justify-center rounded-full border border-dashed border-[var(--rp-border)] px-2 text-xs text-[var(--rp-muted)] hover:border-[color-mix(in_oklab,var(--rp-primary)_45%,var(--rp-border))] hover:text-[var(--rp-fg)]"
            aria-label="Ajouter une réaction"
          >
            +
          </button>
          {pickerOpen ? (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-bg)_94%,black)] p-1.5 shadow-[var(--rp-shadow-md)]">
              {available.length === 0 ? (
                <span className="px-2 py-1 text-[11px] text-[var(--rp-muted)]">
                  Toutes ajoutées
                </span>
              ) : (
                available.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onToggle(e);
                      setPickerOpen(false);
                    }}
                    className="rounded-md px-1.5 py-1 text-base hover:bg-white/10"
                  >
                    {e}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
