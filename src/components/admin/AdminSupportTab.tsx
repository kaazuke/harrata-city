"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  clearMessages,
  deleteMessage,
  readMessages,
  SUPPORT_STATUS_LABELS,
  supportChannel,
  updateMessageStatus,
  type SupportMessage,
  type SupportStatus,
} from "@/lib/support/store";

const STATUS_TONE: Record<SupportStatus, string> = {
  new: "var(--rp-danger)",
  read: "var(--rp-primary)",
  resolved: "var(--rp-success)",
};

export function AdminSupportTab() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<SupportStatus | "all">("all");

  useEffect(() => {
    setMessages(readMessages());
    const ch = supportChannel();
    if (!ch) return;
    ch.onmessage = () => setTick((t) => t + 1);
    return () => ch.close();
  }, []);

  useEffect(() => {
    setMessages(readMessages());
  }, [tick]);

  const filtered = useMemo(() => {
    const sorted = [...messages].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "all") return sorted;
    return sorted.filter((m) => m.status === filter);
  }, [messages, filter]);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      read: messages.filter((m) => m.status === "read").length,
      resolved: messages.filter((m) => m.status === "resolved").length,
    }),
    [messages],
  );

  function changeStatus(id: string, status: SupportStatus) {
    updateMessageStatus(id, status);
    setTick((t) => t + 1);
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    deleteMessage(id);
    setTick((t) => t + 1);
  }

  function clearAll() {
    if (!confirm("Supprimer TOUS les messages support ?")) return;
    clearMessages();
    setTick((t) => t + 1);
  }

  return (
    <Card>
      <CardHeader
        title="Messages de support"
        subtitle="Messages envoyés depuis la page Contact. Données locales à ce navigateur, synchronisées entre vos onglets."
      />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", `Tous (${stats.total})`],
                ["new", `Nouveaux (${stats.new})`],
                ["read", `Lus (${stats.read})`],
                ["resolved", `Résolus (${stats.resolved})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as SupportStatus | "all")}
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => setTick((t) => t + 1)}>
              Rafraîchir
            </Button>
            <Button type="button" variant="ghost" onClick={clearAll}>
              Vider
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-6 text-center text-sm text-[var(--rp-muted)]">
            Aucun message {filter === "all" ? "" : `« ${SUPPORT_STATUS_LABELS[filter as SupportStatus].toLowerCase()} »`} pour le moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((m) => (
              <li
                key={m.id}
                className={`rounded-[var(--rp-radius)] border p-4 transition ${
                  m.status === "new"
                    ? "border-[color-mix(in_oklab,var(--rp-danger)_35%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-danger)_5%,transparent)]"
                    : "border-[var(--rp-border)] bg-black/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className="rounded-full px-2 py-0.5 font-bold uppercase tracking-wider"
                        style={{
                          background: `color-mix(in oklab, ${STATUS_TONE[m.status]} 22%, transparent)`,
                          color: STATUS_TONE[m.status],
                        }}
                      >
                        {SUPPORT_STATUS_LABELS[m.status]}
                      </span>
                      <span className="text-[var(--rp-muted)]">
                        {new Date(m.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[var(--rp-muted)]">
                        par{" "}
                        <span className="font-mono text-[var(--rp-fg)]">
                          {m.authorName}
                        </span>
                        {m.authorId ? null : (
                          <span className="ml-1 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--rp-muted)]">
                            anonyme
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[var(--rp-fg)]">
                      {m.subject}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--rp-muted)]">
                      {m.message}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                  {(["new", "read", "resolved"] as SupportStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeStatus(m.id, s)}
                      disabled={m.status === s}
                      className="rounded-full border border-[var(--rp-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--rp-muted)] hover:bg-white/5 disabled:cursor-default disabled:opacity-50"
                    >
                      → {SUPPORT_STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    className="ml-auto rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-2.5 py-1 text-[10px] font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
