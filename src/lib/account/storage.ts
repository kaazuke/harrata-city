import type { AccountStore } from "./types";

const KEY = "rp-accounts-v1";

export function loadStore(): AccountStore {
  if (typeof window === "undefined") {
    return { version: 1, accounts: [], currentUserId: null };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { version: 1, accounts: [], currentUserId: null };
    const parsed = JSON.parse(raw) as Partial<AccountStore>;
    return {
      version: 1,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      currentUserId: typeof parsed.currentUserId === "string" ? parsed.currentUserId : null,
    };
  } catch {
    return { version: 1, accounts: [], currentUserId: null };
  }
}

export function saveStore(store: AccountStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore quota / disabled storage */
  }
}
