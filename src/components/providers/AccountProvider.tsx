"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from "@/lib/account/hash";
import { loadStore, saveStore } from "@/lib/account/storage";
import {
  BUILTIN_ROLE_DEFINITIONS,
  findRoleDefinition,
  roleHasPermission,
} from "@/lib/account/types";
import type {
  Account,
  AccountOAuthLink,
  AccountProfile,
  AccountRole,
  AccountStore,
  OAuthProvider,
  Permission,
  RoleDefinition,
} from "@/lib/account/types";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import type { AccountErrorKey, AccountResult } from "@/lib/account/account-error-keys";

type Result = AccountResult;
type ResultId = { ok: true; accountId: string } | { ok: false; error: AccountErrorKey; errorValues?: Record<string, string> };

type OAuthIdentity = {
  provider: OAuthProvider;
  id: string;
  username: string;
  avatarUrl?: string;
};

type Ctx = {
  ready: boolean;
  user: Account | null;
  accounts: Account[];
  /** Définitions de rôles courantes (issues de `siteConfig.roles`). */
  roles: RoleDefinition[];
  /** Définition complète du rôle de l'utilisateur courant. */
  roleDef: RoleDefinition | null;
  /** Lookup pratique : récupère la def d'un rôle par ID. */
  roleDefOf: (roleId: AccountRole | undefined | null) => RoleDefinition;
  hasPermission: (perm: Permission) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  register: (username: string, password: string) => Promise<Result>;
  login: (username: string, password: string) => Promise<Result>;
  logout: () => void;
  updateProfile: (patch: Partial<AccountProfile>) => Result;
  changePassword: (current: string, next: string) => Promise<Result>;
  setRole: (userId: string, role: AccountRole) => Result;
  deleteAccount: (userId: string) => Result;
  findByUsername: (username: string) => Account | null;
  findByOAuth: (provider: OAuthProvider, providerId: string) => Account | null;
  loginOrRegisterOAuth: (identity: OAuthIdentity) => ResultId;
  linkOAuth: (identity: OAuthIdentity) => Result;
  unlinkOAuth: (provider: OAuthProvider) => Result;
};

function err(key: AccountErrorKey, errorValues?: Record<string, string>): Result {
  return errorValues ? { ok: false, error: key, errorValues } : { ok: false, error: key };
}

const AccountContext = createContext<Ctx | null>(null);

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,24}$/;

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeUsernameSeed(raw: string): string {
  const cleaned = raw.normalize("NFKD").replace(/[^A-Za-z0-9_-]/g, "_").replace(/_+/g, "_");
  const trimmed = cleaned.replace(/^[_-]+|[_-]+$/g, "");
  return trimmed.slice(0, 24) || "membre";
}

function uniqueUsername(seed: string, taken: Set<string>): string {
  const base = sanitizeUsernameSeed(seed);
  if (!taken.has(base.toLowerCase())) return base;
  for (let i = 2; i < 10_000; i++) {
    const candidate = `${base.slice(0, 22)}_${i}`.slice(0, 24);
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `membre_${Date.now().toString(36)}`;
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { config } = useSiteConfig();
  const roles = useMemo<RoleDefinition[]>(
    () =>
      Array.isArray(config.roles) && config.roles.length > 0
        ? config.roles
        : BUILTIN_ROLE_DEFINITIONS,
    [config.roles],
  );
  const roleDefOf = useCallback(
    (roleId: AccountRole | undefined | null) => findRoleDefinition(roles, roleId),
    [roles],
  );

  const [store, setStore] = useState<AccountStore>({
    version: 1,
    accounts: [],
    currentUserId: null,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setReady(true);
  }, []);

  const persist = useCallback((next: AccountStore) => {
    setStore(next);
    saveStore(next);
  }, []);

  /** Compte le nombre d'accounts dont le rôle a la permission donnée. */
  const countByPermission = useCallback(
    (accounts: Account[], perm: Permission, exceptId?: string): number => {
      let n = 0;
      for (const a of accounts) {
        if (exceptId && a.id === exceptId) continue;
        if (roleHasPermission(roleDefOf(a.role), perm)) n++;
      }
      return n;
    },
    [roleDefOf],
  );

  const findByUsername = useCallback(
    (username: string): Account | null => {
      const u = username.trim().toLowerCase();
      return store.accounts.find((a) => a.usernameLower === u) ?? null;
    },
    [store.accounts],
  );

  const findByOAuth = useCallback(
    (provider: OAuthProvider, providerId: string): Account | null => {
      return store.accounts.find((a) => a.oauth?.[provider]?.id === providerId) ?? null;
    },
    [store.accounts],
  );

  const register = useCallback(
    async (username: string, password: string): Promise<Result> => {
      const u = username.trim();
      if (!USERNAME_RE.test(u)) {
        return err("username_rules");
      }
      if (password.length < 6) {
        return err("password_min");
      }
      const lower = u.toLowerCase();
      if (store.accounts.some((a) => a.usernameLower === lower)) {
        return err("username_taken");
      }
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      const role: AccountRole = store.accounts.length === 0 ? "admin" : "member";
      const account: Account = {
        id: newId(),
        username: u,
        usernameLower: lower,
        passwordHash: hash,
        passwordSalt: salt,
        role,
        createdAt: new Date().toISOString(),
        profile: { displayName: u },
      };
      const next: AccountStore = {
        ...store,
        accounts: [...store.accounts, account],
        currentUserId: account.id,
      };
      persist(next);
      return { ok: true };
    },
    [store, persist],
  );

  const login = useCallback(
    async (username: string, password: string): Promise<Result> => {
      const lower = username.trim().toLowerCase();
      const acc = store.accounts.find((a) => a.usernameLower === lower);
      if (!acc) return err("invalid_credentials");
      if (!acc.passwordHash || !acc.passwordSalt) {
        return err("oauth_use_provider");
      }
      const ok = await verifyPassword(password, acc.passwordSalt, acc.passwordHash);
      if (!ok) return err("invalid_credentials");
      persist({ ...store, currentUserId: acc.id });
      return { ok: true };
    },
    [store, persist],
  );

  const logout = useCallback(() => {
    persist({ ...store, currentUserId: null });
  }, [store, persist]);

  const user = useMemo(
    () => store.accounts.find((a) => a.id === store.currentUserId) ?? null,
    [store],
  );

  const roleDef = useMemo<RoleDefinition | null>(
    () => (user ? roleDefOf(user.role) : null),
    [user, roleDefOf],
  );

  const hasPermission = useCallback(
    (perm: Permission): boolean => {
      if (!user) return false;
      return roleHasPermission(roleDef, perm);
    },
    [user, roleDef],
  );

  const updateProfile = useCallback(
    (patch: Partial<AccountProfile>): Result => {
      if (!user) return err("not_signed_in");
      const accounts = store.accounts.map((a) =>
        a.id === user.id ? { ...a, profile: { ...a.profile, ...patch } } : a,
      );
      persist({ ...store, accounts });
      return { ok: true };
    },
    [store, user, persist],
  );

  const changePassword = useCallback(
    async (current: string, next: string): Promise<Result> => {
      if (!user) return err("not_signed_in");
      if (next.length < 6) {
        return err("password_min");
      }
      const hasPassword = !!(user.passwordHash && user.passwordSalt);
      if (hasPassword) {
        const ok = await verifyPassword(current, user.passwordSalt!, user.passwordHash!);
        if (!ok) return err("wrong_current_password");
      }
      const salt = generateSalt();
      const hash = await hashPassword(next, salt);
      const accounts = store.accounts.map((a) =>
        a.id === user.id ? { ...a, passwordSalt: salt, passwordHash: hash } : a,
      );
      persist({ ...store, accounts });
      return { ok: true };
    },
    [store, user, persist],
  );

  const setRole = useCallback(
    (userId: string, role: AccountRole): Result => {
      if (!user || !roleHasPermission(roleDef, "admin.manage_users")) {
        return err("admin_only");
      }
      const target = store.accounts.find((a) => a.id === userId);
      if (!target) return err("user_not_found");
      const targetRoleDef = roleDefOf(role);
      if (!roles.some((r) => r.id === role)) {
        return err("role_not_found");
      }
      // Empêche de se retirer la dernière permission admin du site.
      const currentRoleHadAdmin = roleHasPermission(roleDefOf(target.role), "admin.access");
      const newRoleHasAdmin = roleHasPermission(targetRoleDef, "admin.access");
      if (currentRoleHadAdmin && !newRoleHasAdmin) {
        const others = countByPermission(store.accounts, "admin.access", target.id);
        if (others === 0) {
          return err("cannot_demote_last_admin");
        }
      }
      const accounts = store.accounts.map((a) =>
        a.id === userId ? { ...a, role } : a,
      );
      persist({ ...store, accounts });
      return { ok: true };
    },
    [store, user, roleDef, roleDefOf, roles, countByPermission, persist],
  );

  const deleteAccount = useCallback(
    (userId: string): Result => {
      const target = store.accounts.find((a) => a.id === userId);
      if (!target) return err("user_not_found");
      const isSelf = user?.id === userId;
      const canManage = roleHasPermission(roleDef, "admin.manage_users");
      if (!isSelf && !canManage) {
        return err("admin_only");
      }
      const targetHasAdmin = roleHasPermission(roleDefOf(target.role), "admin.access");
      if (targetHasAdmin) {
        const others = countByPermission(store.accounts, "admin.access", target.id);
        if (others === 0) {
          return err("cannot_delete_last_admin");
        }
      }
      const accounts = store.accounts.filter((a) => a.id !== userId);
      const currentUserId = isSelf ? null : store.currentUserId;
      persist({ ...store, accounts, currentUserId });
      return { ok: true };
    },
    [store, user, roleDef, roleDefOf, countByPermission, persist],
  );

  const loginOrRegisterOAuth = useCallback(
    (identity: OAuthIdentity): ResultId => {
      const existing = store.accounts.find(
        (a) => a.oauth?.[identity.provider]?.id === identity.id,
      );
      if (existing) {
        persist({ ...store, currentUserId: existing.id });
        return { ok: true, accountId: existing.id };
      }
      const taken = new Set(store.accounts.map((a) => a.usernameLower));
      const username = uniqueUsername(identity.username, taken);
      const link: AccountOAuthLink = {
        id: identity.id,
        username: identity.username,
        avatarUrl: identity.avatarUrl,
        linkedAt: new Date().toISOString(),
      };
      const role: AccountRole = store.accounts.length === 0 ? "admin" : "member";
      const account: Account = {
        id: newId(),
        username,
        usernameLower: username.toLowerCase(),
        role,
        createdAt: new Date().toISOString(),
        profile: {
          displayName: identity.username,
        },
        oauth: { [identity.provider]: link },
      };
      const accounts = [...store.accounts, account];
      persist({ ...store, accounts, currentUserId: account.id });
      return { ok: true, accountId: account.id };
    },
    [store, persist],
  );

  const linkOAuth = useCallback(
    (identity: OAuthIdentity): Result => {
      if (!user) return err("not_signed_in");
      const conflict = store.accounts.find(
        (a) => a.oauth?.[identity.provider]?.id === identity.id && a.id !== user.id,
      );
      if (conflict) {
        return err("oauth_already_linked", {
          provider: identity.provider === "discord" ? "Discord" : "Steam",
          username: conflict.username,
        });
      }
      const link: AccountOAuthLink = {
        id: identity.id,
        username: identity.username,
        avatarUrl: identity.avatarUrl,
        linkedAt: new Date().toISOString(),
      };
      const accounts = store.accounts.map((a) =>
        a.id === user.id
          ? { ...a, oauth: { ...(a.oauth ?? {}), [identity.provider]: link } }
          : a,
      );
      persist({ ...store, accounts });
      return { ok: true };
    },
    [store, user, persist],
  );

  const unlinkOAuth = useCallback(
    (provider: OAuthProvider): Result => {
      if (!user) return err("not_signed_in");
      const hasPassword = !!(user.passwordHash && user.passwordSalt);
      const otherProviders = Object.keys(user.oauth ?? {}).filter((p) => p !== provider);
      if (!hasPassword && otherProviders.length === 0) {
        return err("password_required_before_unlink");
      }
      const accounts = store.accounts.map((a) => {
        if (a.id !== user.id) return a;
        const next = { ...(a.oauth ?? {}) };
        delete next[provider];
        return { ...a, oauth: Object.keys(next).length ? next : undefined };
      });
      persist({ ...store, accounts });
      return { ok: true };
    },
    [store, user, persist],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      user,
      accounts: store.accounts,
      roles,
      roleDef,
      roleDefOf,
      hasPermission,
      isAdmin: roleHasPermission(roleDef, "admin.access"),
      isModerator: roleHasPermission(roleDef, "forum.moderate"),
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      setRole,
      deleteAccount,
      findByUsername,
      findByOAuth,
      loginOrRegisterOAuth,
      linkOAuth,
      unlinkOAuth,
    }),
    [
      ready,
      user,
      store.accounts,
      roles,
      roleDef,
      roleDefOf,
      hasPermission,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      setRole,
      deleteAccount,
      findByUsername,
      findByOAuth,
      loginOrRegisterOAuth,
      linkOAuth,
      unlinkOAuth,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount doit être utilisé dans AccountProvider");
  }
  return ctx;
}
