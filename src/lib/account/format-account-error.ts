import type { AccountFailure } from "@/lib/account/account-error-keys";

type TranslateFn = (key: string, values?: Record<string, string>) => string;

/** Affiche un message d'erreur compte à partir des codes `AccountProvider`. */
export function formatAccountError(te: TranslateFn, r: AccountFailure): string {
  if (r.error === "oauth_already_linked" && r.errorValues) {
    return te("oauth_already_linked", r.errorValues);
  }
  return te(r.error);
}
