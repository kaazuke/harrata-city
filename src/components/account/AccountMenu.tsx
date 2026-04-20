"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAccount } from "@/components/providers/AccountProvider";
import { Avatar } from "@/components/account/Avatar";
import { RoleBadge } from "@/components/account/RoleBadge";

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user, logout, hasPermission } = useAccount();
  const t = useTranslations("auth.menu");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handlePointer(e: PointerEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleResize() {
      updatePosition();
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [open, updatePosition]);

  if (!ready) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-white/5" aria-hidden />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/connexion"
          className="rounded-full border border-white/12 px-3 py-2 text-xs font-semibold text-[var(--rp-muted)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_40%,var(--rp-border))] hover:text-[var(--rp-fg)]"
        >
          {t("login")}
        </Link>
        <Link
          href="/inscription"
          className="rounded-full bg-[var(--rp-primary)] px-3 py-2 text-xs font-semibold text-[#041016] transition hover:brightness-110"
        >
          {t("register")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-1 pl-1 pr-3 text-xs font-semibold text-[var(--rp-fg)] transition hover:border-[color-mix(in_oklab,var(--rp-primary)_40%,var(--rp-border))] hover:bg-white/[0.08]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar account={user} size="sm" />
        <span className="max-w-[8rem] truncate">{user.profile.displayName || user.username}</span>
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
              className="w-64 overflow-hidden rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-bg)_96%,black)] shadow-[var(--rp-shadow-md)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--rp-border)] px-4 py-3">
                <Avatar account={user} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--rp-fg)]">
                    {user.profile.displayName || user.username}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-[11px] text-[var(--rp-muted)]">
                      @{user.username}
                    </span>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>
              <div className="py-1 text-sm">
                <Link
                  role="menuitem"
                  href="/compte"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-[var(--rp-fg)] hover:bg-white/[0.06]"
                >
                  {t("profile")}
                </Link>
                {hasPermission("admin.access") ? (
                  <Link
                    role="menuitem"
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-[var(--rp-fg)] hover:bg-white/[0.06]"
                  >
                    {t("adminPanel")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2 text-left text-[var(--rp-danger)] hover:bg-white/[0.06]"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    router.push("/");
                  }}
                >
                  {t("logout")}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
