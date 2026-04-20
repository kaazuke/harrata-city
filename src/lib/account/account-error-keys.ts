/** Codes d'erreur stables pour `AccountProvider` — traduits via `accountErrors.*` dans les messages. */
export type AccountErrorKey =
  | "username_rules"
  | "password_min"
  | "username_taken"
  | "invalid_credentials"
  | "oauth_use_provider"
  | "not_signed_in"
  | "wrong_current_password"
  | "admin_only"
  | "user_not_found"
  | "role_not_found"
  | "cannot_demote_last_admin"
  | "cannot_delete_last_admin"
  | "oauth_already_linked"
  | "password_required_before_unlink";

export type AccountResult = { ok: true } | { ok: false; error: AccountErrorKey; errorValues?: Record<string, string> };

export type AccountFailure = Extract<AccountResult, { ok: false }>;
