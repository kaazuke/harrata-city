/**
 * Steam OpenID 2.0 — redirection initiale et validation du retour.
 */

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

export function steamLoginUrl(returnTo: string, realm: string) {
  const u = new URL(STEAM_OPENID);
  u.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  u.searchParams.set("openid.mode", "checkid_setup");
  u.searchParams.set("openid.return_to", returnTo);
  u.searchParams.set("openid.realm", realm);
  u.searchParams.set(
    "openid.identity",
    "http://specs.openid.net/auth/2.0/identifier_select",
  );
  u.searchParams.set(
    "openid.claimed_id",
    "http://specs.openid.net/auth/2.0/identifier_select",
  );
  return u.toString();
}

export function extractSteamIdFromClaimedId(claimedId: string | null) {
  if (!claimedId) {
    return null;
  }
  const m = claimedId.match(/\/id\/(\d{6,})$/);
  return m ? m[1] : null;
}

/** Vérifie auprès de Steam que la réponse OpenID est authentique (mode check_authentication). */
export async function steamValidateAssertion(params: URLSearchParams) {
  const verify = new URLSearchParams();
  for (const [k, v] of params.entries()) {
    if (k.startsWith("openid.")) {
      verify.set(k, v);
    }
  }
  verify.set("openid.mode", "check_authentication");

  const res = await fetch(STEAM_OPENID, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verify.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Steam OpenID HTTP ${res.status}`);
  }
  const valid = /is_valid:\s*true/i.test(text);
  return valid;
}
