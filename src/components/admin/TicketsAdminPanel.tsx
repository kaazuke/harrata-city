"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  clearTickets,
  deleteTicket,
  readTickets,
  ticketsChannel,
  updateTicket,
  type Ticket,
  type TicketStatus,
  type TicketType,
} from "@/lib/extensions/tickets-store";

const STATUS_TONE: Record<TicketStatus, string> = {
  open: "var(--rp-warning, #f59e0b)",
  in_progress: "var(--rp-primary)",
  closed: "var(--rp-success)",
};

export function TicketsAdminPanel() {
  const t = useTranslations("admin.tickets");
  const locale = useLocale();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");

  const statusLabel = (s: TicketStatus) =>
    s === "open" ? t("status_open") : s === "in_progress" ? t("status_in_progress") : t("status_closed");

  const typeLabel = (ty: TicketType) =>
    ty === "report" ? t("type_report") : ty === "question" ? t("type_question") : t("type_bug");

  useEffect(() => {
    setTickets(readTickets());
    const ch = ticketsChannel();
    if (!ch) return;
    ch.onmessage = () => setTick((x) => x + 1);
    return () => ch.close();
  }, []);

  useEffect(() => {
    setTickets(readTickets());
  }, [tick]);

  const filtered = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "all") return sorted;
    return sorted.filter((tk) => tk.status === filter);
  }, [tickets, filter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((tk) => tk.status === "open").length,
      in_progress: tickets.filter((tk) => tk.status === "in_progress").length,
      closed: tickets.filter((tk) => tk.status === "closed").length,
    };
  }, [tickets]);

  function changeStatus(id: string, status: TicketStatus) {
    updateTicket(id, { status });
    setTick((x) => x + 1);
  }

  function remove(id: string) {
    if (!confirm(t("deleteOne"))) return;
    deleteTicket(id);
    setTick((x) => x + 1);
  }

  function clearAll() {
    if (!confirm(t("deleteAll"))) return;
    clearTickets();
    setTick((x) => x + 1);
  }

  return (
    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/15 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[var(--rp-fg)]">{t("title")}</h4>
          <p className="mt-0.5 text-[11px] text-[var(--rp-muted)]">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setTick((x) => x + 1)}>
            {t("refresh")}
          </Button>
          <Button type="button" variant="ghost" onClick={clearAll}>
            {t("clearAll")}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["all", t("filterAll", { count: stats.total })],
            ["open", t("filterOpen", { count: stats.open })],
            ["in_progress", t("filterInProgress", { count: stats.in_progress })],
            ["closed", t("filterClosed", { count: stats.closed })],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id as TicketStatus | "all")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filter === id
                ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-[var(--rp-radius)] border border-white/5 bg-black/20 px-3 py-4 text-center text-xs text-[var(--rp-muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((tk) => (
            <li
              key={tk.id}
              className="rounded-[var(--rp-radius)] border border-white/8 bg-black/20 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className="rounded-full px-2 py-0.5 font-bold uppercase tracking-wider"
                      style={{
                        background: `color-mix(in oklab, ${STATUS_TONE[tk.status]} 22%, transparent)`,
                        color: STATUS_TONE[tk.status],
                      }}
                    >
                      {statusLabel(tk.status)}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-semibold text-[var(--rp-muted)]">
                      {typeLabel(tk.type)}
                    </span>
                    <span className="text-[var(--rp-muted)]">
                      {new Date(tk.createdAt).toLocaleString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[var(--rp-muted)]">
                      {t("by")} <span className="font-mono">{tk.authorName}</span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-[var(--rp-fg)]">{tk.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-[var(--rp-muted)]">
                    {tk.description}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/5 pt-2">
                {(["open", "in_progress", "closed"] as TicketStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(tk.id, s)}
                    disabled={tk.status === s}
                    className="rounded-full border border-[var(--rp-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--rp-muted)] hover:bg-white/5 disabled:cursor-default disabled:opacity-50"
                  >
                    → {statusLabel(s)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => remove(tk.id)}
                  className="ml-auto rounded-full border border-[color-mix(in_oklab,var(--rp-danger)_45%,var(--rp-border))] px-2 py-0.5 text-[10px] font-semibold text-[var(--rp-danger)] hover:bg-[color-mix(in_oklab,var(--rp-danger)_10%,transparent)]"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
