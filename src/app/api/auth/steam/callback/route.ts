import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  RETURN_COOKIE,
  safeReturnTo,
  sessionCookieAttributes,
  signSession,
} from "@/lib/auth/session";
import { resolveAuthSecret } from "@/lib/auth/runtime-config";
import {
  extractSteamIdFromClaimedId,
  steamValidateAssertion,
} from "@/lib/integrations/steam-openid";

export async function GET(request: NextRequest) {
  const secret = await resolveAuthSecret();
  const returnTo = safeReturnTo(request.cookies.get(RETURN_COOKIE)?.value);
  const errorUrl = (code: string) =>
    new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth=${code}`, request.url);
  const okUrl = new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth=ok`, request.url);

  if (!secret) {
    return NextResponse.redirect(errorUrl("missing_auth_secret"));
  }

  const url = new URL(request.url);
  if (url.searchParams.get("openid.mode") !== "id_res") {
    return NextResponse.redirect(errorUrl("steam_mode"));
  }

  try {
    const ok = await steamValidateAssertion(url.searchParams);
    if (!ok) {
      return NextResponse.redirect(errorUrl("steam_invalid"));
    }
    const claimed = url.searchParams.get("openid.claimed_id");
    const steamId = extractSteamIdFromClaimedId(claimed);
    if (!steamId) {
      return NextResponse.redirect(errorUrl("steam_id"));
    }

    const session = signSession(
      {
        provider: "steam",
        sub: steamId,
        username: `Steam ${steamId}`,
      },
      secret,
    );
    const res = NextResponse.redirect(okUrl);
    res.cookies.set(COOKIE_NAME, session, sessionCookieAttributes(60 * 60 * 24 * 7));
    res.cookies.set(RETURN_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.redirect(errorUrl("steam_error"));
  }
}
