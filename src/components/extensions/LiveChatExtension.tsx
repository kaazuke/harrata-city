"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { getExtension, isExtensionEnabled } from "@/lib/extensions/manage";

interface ChatSettings {
  title?: string;
  accentColor?: string;
  position?: "bottom-right" | "bottom-left";
  maxMessages?: number;
  slowmodeSeconds?: number;
  welcomeMessage?: string;
}

interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorColor?: string;
  authorRole?: string;
  text: string;
  ts: number;
}

const STORAGE_KEY = "ext:live-chat:messages";
const CHANNEL_NAME = "ext:live-chat";
const MAX_TEXT = 240;
const HARD_CAP = 200;

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-HARD_CAP) : [];
  } catch {
    return [];
  }
}

function saveMessages(list: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-HARD_CAP)));
  } catch {
    /* ignore quota */
  }
}

function newId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveChatExtension() {
  const { config } = useSiteConfig();
  const { user, roleDef } = useAccount();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastSentRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const enabled = isExtensionEnabled(config, "live-chat");
  const ext = getExtension(config, "live-chat");
  const settings = (ext?.settings ?? {}) as ChatSettings;

  const accent = settings.accentColor?.trim() || "#7aa2f7";
  const title = settings.title?.trim() || "Chat live";
  const maxMessages = Math.min(
    Math.max(Number(settings.maxMessages) || 60, 10),
    HARD_CAP,
  );
  const slowmode = Math.max(Number(settings.slowmodeSeconds) || 0, 0);
  const position = settings.position === "bottom-left" ? "bottom-left" : "bottom-right";

  useEffect(() => {
    setHydrated(true);
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;
    ch.onmessage = (event) => {
      const data = event.data as
        | { type: "msg"; payload: ChatMessage }
        | { type: "clear" }
        | undefined;
      if (!data) return;
      if (data.type === "msg") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.payload.id)) return prev;
          const next = [...prev, data.payload].slice(-HARD_CAP);
          saveMessages(next);
          return next;
        });
        if (!open) setUnread((u) => u + 1);
      } else if (data.type === "clear") {
        setMessages([]);
        saveMessages([]);
      }
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [enabled, hydrated, open]);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [open, messages.length]);

  const visibleMessages = useMemo(
    () => messages.slice(-maxMessages),
    [messages, maxMessages],
  );

  if (!hydrated || !enabled) return null;

  function send() {
    setError(null);
    if (!user) {
      setError("Connectez-vous pour discuter.");
      return;
    }
    const text = draft.trim().slice(0, MAX_TEXT);
    if (!text) return;
    const now = Date.now();
    if (slowmode > 0 && now - lastSentRef.current < slowmode * 1000) {
      const wait = Math.ceil((slowmode * 1000 - (now - lastSentRef.current)) / 1000);
      setError(`Slowmode : attendez ${wait}s avant le prochain message.`);
      return;
    }
    const msg: ChatMessage = {
      id: newId(),
      authorId: user.id,
      authorName: user.profile.displayName?.trim() || user.username,
      authorColor: user.profile.color,
      authorRole: roleDef?.label,
      text,
      ts: now,
    };
    lastSentRef.current = now;
    setMessages((prev) => {
      const next = [...prev, msg].slice(-HARD_CAP);
      saveMessages(next);
      return next;
    });
    channelRef.current?.postMessage({ type: "msg", payload: msg });
    setDraft("");
  }

  function clearAll() {
    if (!confirm("Vider l'historique du chat (pour ce navigateur) ?")) return;
    setMessages([]);
    saveMessages([]);
    channelRef.current?.postMessage({ type: "clear" });
  }

  const positionClass =
    position === "bottom-left" ? "left-4 sm:left-6" : "right-4 sm:right-6";

  return (
    <div
      className={`fixed bottom-4 z-40 ${positionClass} sm:bottom-6`}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col items-end gap-2" style={{ pointerEvents: "auto" }}>
        {open ? (
          <div
            className="flex h-[460px] w-[330px] flex-col overflow-hidden rounded-[var(--rp-radius)] border bg-[var(--rp-surface)] shadow-2xl backdrop-blur sm:w-[360px]"
            style={{
              borderColor: `color-mix(in oklab, ${accent} 35%, var(--rp-border))`,
            }}
          >
            <header
              className="flex items-center justify-between gap-2 border-b px-3 py-2"
              style={{
                borderColor: `color-mix(in oklab, ${accent} 25%, var(--rp-border))`,
                background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 18%, transparent), transparent)`,
              }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--rp-fg)]">
                  {title}
                </p>
                <p className="text-[10px] text-[var(--rp-muted)]">
                  Synchronisé entre vos onglets · {messages.length} messages
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--rp-muted)] hover:bg-white/10"
                  title="Vider l'historique"
                >
                  Vider
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-[var(--rp-muted)] hover:bg-white/10"
                  aria-label="Fermer le chat"
                >
                  ✕
                </button>
              </div>
            </header>

            <div
              ref={listRef}
              className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-xs"
            >
              {visibleMessages.length === 0 ? (
                <p className="mt-6 text-center text-[var(--rp-muted)]">
                  {settings.welcomeMessage?.trim() ||
                    "Aucun message. Soyez le premier à écrire !"}
                </p>
              ) : (
                visibleMessages.map((m) => {
                  const mine = user?.id === m.authorId;
                  return (
                    <div key={m.id} className={mine ? "text-right" : "text-left"}>
                      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-[var(--rp-muted)]">
                        {mine ? (
                          <>
                            <span>{formatTime(m.ts)}</span>
                            {m.authorRole ? <span>· {m.authorRole}</span> : null}
                            <span
                              className="font-semibold"
                              style={{ color: m.authorColor || accent }}
                            >
                              {m.authorName}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className="font-semibold"
                              style={{ color: m.authorColor || accent }}
                            >
                              {m.authorName}
                            </span>
                            {m.authorRole ? <span>· {m.authorRole}</span> : null}
                            <span>· {formatTime(m.ts)}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`inline-block max-w-[85%] rounded-2xl px-3 py-1.5 ${
                          mine
                            ? "rounded-br-md text-[#041016]"
                            : "rounded-bl-md bg-black/30 text-[var(--rp-fg)]"
                        }`}
                        style={
                          mine
                            ? { background: accent }
                            : undefined
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-[var(--rp-border)] px-3 py-2"
            >
              {error ? (
                <p className="mb-1 text-[10px] text-[var(--rp-danger)]">{error}</p>
              ) : null}
              {user ? (
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={MAX_TEXT}
                    placeholder="Votre message…"
                    className="flex-1 rounded-full border border-[var(--rp-border)] bg-black/20 px-3 py-1.5 text-xs text-[var(--rp-fg)] outline-none focus:border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))]"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#041016] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: accent }}
                  >
                    Envoyer
                  </button>
                </div>
              ) : (
                <p className="text-center text-[10px] text-[var(--rp-muted)]">
                  Connectez-vous pour participer au chat.
                </p>
              )}
              <p className="mt-1 text-right text-[10px] text-[var(--rp-muted)]">
                {draft.length}/{MAX_TEXT}
              </p>
            </form>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative grid h-12 w-12 place-items-center rounded-full border text-lg shadow-xl transition hover:scale-105"
          style={{
            background: accent,
            color: "#041016",
            borderColor: `color-mix(in oklab, ${accent} 60%, white 10%)`,
          }}
          aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        >
          <span aria-hidden>{open ? "✕" : "💬"}</span>
          {!open && unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full border border-white/20 bg-[var(--rp-danger)] px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
