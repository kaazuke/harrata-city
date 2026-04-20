/**
 * Stockage local des messages de support.
 * 100% client : localStorage + BroadcastChannel pour sync entre onglets.
 */

export type SupportStatus = "new" | "read" | "resolved";

export interface SupportMessage {
  id: string;
  authorId: string | null;
  authorName: string;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt: number;
  updatedAt: number;
}

const KEY = "support:messages";
const CHANNEL = "support:channel";
const HARD_CAP = 500;

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  new: "Nouveau",
  read: "Lu",
  resolved: "Résolu",
};

function newId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function readMessages(): SupportMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SupportMessage[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeMessages(list: SupportMessage[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-HARD_CAP)));
  } catch {
    /* ignore */
  }
}

export function supportChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL);
}

function broadcast(action: { type: "update" } | { type: "clear" }) {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage(action);
  ch.close();
}

export function addMessage(input: {
  authorId: string | null;
  authorName: string;
  subject: string;
  message: string;
}): SupportMessage {
  const now = Date.now();
  const m: SupportMessage = {
    id: newId(),
    authorId: input.authorId,
    authorName: input.authorName,
    subject: input.subject,
    message: input.message,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  const list = [...readMessages(), m];
  writeMessages(list);
  broadcast({ type: "update" });
  return m;
}

export function updateMessageStatus(id: string, status: SupportStatus) {
  const list = readMessages().map((m) =>
    m.id === id ? { ...m, status, updatedAt: Date.now() } : m,
  );
  writeMessages(list);
  broadcast({ type: "update" });
}

export function deleteMessage(id: string) {
  const list = readMessages().filter((m) => m.id !== id);
  writeMessages(list);
  broadcast({ type: "update" });
}

export function clearMessages() {
  writeMessages([]);
  broadcast({ type: "clear" });
}

export function countNewMessages(): number {
  return readMessages().filter((m) => m.status === "new").length;
}
