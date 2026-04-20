"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAccount } from "@/components/providers/AccountProvider";
import type { SessionUser } from "@/lib/auth/session";

/**
 * Quand l’utilisateur revient d’un retour OAuth (`?auth=ok` posé par les callbacks Discord/Steam),
 * on récupère la session HTTP et on la mappe sur un compte local :
 * - utilisateur déjà connecté → on lie le service à son compte
 * - service déjà lié à un compte → on connecte ce compte
 * - sinon → on crée un nouveau compte avec un pseudo dérivé du provider
 *
 * Le composant ne rend rien.
 */
export function OAuthSync() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const sp = useSearchParams();
  const { ready, user, loginOrRegisterOAuth, linkOAuth } = useAccount();
  const handledRef = useRef(false);
  const [, force] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const auth = sp?.get("auth");
    if (auth !== "ok") return;
    if (handledRef.current) return;
    handledRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await r.json()) as { user: SessionUser | null };
        const sess = data.user;
        if (cancelled || !sess) {
          cleanQuery();
          return;
        }
        const identity = {
          provider: sess.provider,
          id: sess.sub,
          username: sess.username,
          avatarUrl: sess.avatar,
        };
        if (user) {
          linkOAuth(identity);
        } else {
          loginOrRegisterOAuth(identity);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          cleanQuery();
          force((n) => n + 1);
        }
      }
    })();

    function cleanQuery() {
      const params = new URLSearchParams(sp?.toString());
      params.delete("auth");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }

    return () => {
      cancelled = true;
    };
  }, [ready, sp, user, loginOrRegisterOAuth, linkOAuth, pathname, router]);

  return null;
}
