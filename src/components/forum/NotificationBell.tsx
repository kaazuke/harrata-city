"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Avatar } from "@/components/account/Avatar";
import { formatForumRelative } from "@/lib/forum-mutate";
import {
  clearNotificationsFor,
  countUnread,
  deleteNotification,
  getNotificationsFor,
  markAllRead,
  markNotificationRead,
} from "@/lib/forum-notifications";

export function NotificationBell() {
  const { user, findByUsername } = useAccount();
  const { config, setConfig, persist } = useSiteConfig();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  const notifs = useMemo(
    () => getNotificationsFor(config, user?.username),
    [config, user?.username],
  );
  const unread = useMemo(
    () => countUnread(config, user?.username),
    [config, user?.username],
  );

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (menuRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  if (!user) return null;

  function applyAndPersist(next: typeof config) {
    if (next === config) return;
    setConfig(next);
    persist(next);
  }

  function handleOpen() {
    if (!open && unread > 0) {
      const next = markAllRead(config, user!.username);
      applyAndPersist(next);
    }
    setOpen((v) => !v);
  }

  function handleNotificationClick(id: string) {
    applyAndPersist(markNotificationRead(config, id));
    setOpen(false);
  }

  function handleRemove(id: string) {
    applyAndPersist(deleteNotification(config, id));
  }

  function handleClearAll() {
    applyAndPersist(clearNotificationsFor(config, user!.username));
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ""}`}
        onClick={handleOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-[var(--rp-fg)] transition hover:bg-white/[0.06]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--rp-danger)] px-1.5 text-[10px] font-bold text-white shadow-md">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {mounted && open && pos
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: pos.top,
                right: pos.right,
                zIndex: 1000,
              }}
              className="w-[min(380px,calc(100vw-16px))] overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-bg)_96%,black)] shadow-[var(--rp-shadow-md)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--rp-border)] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--rp-fg)]">
                    Notifications
                  </div>
                  <div className="text-[11px] text-[var(--rp-muted)]">
                    {notifs.length === 0
                      ? "Aucune notification"
                      : `${notifs.length} au total`}
                  </div>
                </div>
                {notifs.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-[var(--rp-muted)] hover:text-[var(--rp-fg)]"
                  >
                    Tout effacer
                  </button>
                ) : null}
              </div>

              <ul className="max-h-[60vh] divide-y divide-[var(--rp-border)] overflow-y-auto">
                {notifs.length === 0 ? (
                  <li className="px-4 py-8 text-center text-xs text-[var(--rp-muted)]">
                    Quand quelqu’un répondra à un de vos sujets, vous le verrez ici.
                  </li>
                ) : (
                  notifs.map((n) => {
                    const actor = findByUsername(n.actor);
                    const href =
                      n.topicId && n.categoryId
                        ? `/forum/${n.categoryId}/${n.topicId}`
                        : null;
                    const inner = (
                      <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-3 transition hover:bg-white/[0.04]">
                        <Avatar
                          account={actor}
                          fallbackName={n.actor}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-[var(--rp-muted)]">
                            <span className="font-semibold text-[var(--rp-fg)]">
                              @{n.actor}
                            </span>{" "}
                            a répondu à votre sujet
                          </div>
                          {n.topicTitle ? (
                            <div className="mt-0.5 truncate text-sm font-medium text-[var(--rp-fg)]">
                              {n.topicTitle}
                            </div>
                          ) : null}
                          {n.excerpt ? (
                            <p className="mt-1 line-clamp-2 text-[11px] italic text-[var(--rp-muted)]">
                              « {n.excerpt} »
                            </p>
                          ) : null}
                          <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--rp-muted)]">
                            {formatForumRelative(n.createdAt)}
                            {!n.read ? (
                              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--rp-primary)]" />
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="Supprimer cette notification"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(n.id);
                          }}
                          className="self-start text-[var(--rp-muted)] hover:text-[var(--rp-danger)]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {href ? (
                          <Link
                            href={href}
                            onClick={() => handleNotificationClick(n.id)}
                            className="block"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(n.id)}
                            className="block w-full text-left"
                          >
                            {inner}
                          </button>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
