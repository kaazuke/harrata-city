/**
 * Stockage local pour l'extension `tickets-rp`.
 * 100% client : tickets stockés dans localStorage, synchronisés entre onglets
 * via BroadcastChannel. Pas de backend.
 */

export type TicketType = "report" | "question" | "bug";
export type TicketStatus = "open" | "in_progress" | "closed";

export interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  authorId: string | null;
  authorName: string;
  status: TicketStatus;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

const KEY = "ext:tickets:list";
const CHANNEL = "ext:tickets";
const HARD_CAP = 500;

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  report: "Signalement",
  question: "Question",
  bug: "Bug technique",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  closed: "Fermé",
};

export function newTicketId() {
  return `tkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function readTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Ticket[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function writeTickets(list: Ticket[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-HARD_CAP)));
  } catch {
    /* ignore */
  }
}

export function broadcastTickets(action: { type: "update" } | { type: "clear" }) {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage(action);
  ch.close();
}

export function ticketsChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL);
}

export function addTicket(ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">): Ticket {
  const now = Date.now();
  const t: Ticket = {
    ...ticket,
    id: newTicketId(),
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  const list = [...readTickets(), t];
  writeTickets(list);
  broadcastTickets({ type: "update" });
  return t;
}

export function updateTicket(id: string, patch: Partial<Ticket>): Ticket | null {
  const list = readTickets();
  let updated: Ticket | null = null;
  const next = list.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...patch, updatedAt: Date.now() };
    return updated;
  });
  if (updated) {
    writeTickets(next);
    broadcastTickets({ type: "update" });
  }
  return updated;
}

export function deleteTicket(id: string) {
  const list = readTickets().filter((t) => t.id !== id);
  writeTickets(list);
  broadcastTickets({ type: "update" });
}

export function clearTickets() {
  writeTickets([]);
  broadcastTickets({ type: "clear" });
}
