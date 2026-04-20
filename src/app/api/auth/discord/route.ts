import { NextResponse, type NextRequest } from "next/server";
import {
  randomState,
  RETURN_COOKIE,
  safeReturnTo,
  STATE_COOKIE,
  stateCookieAttributes,
} from "@/lib/auth/session";
import { resolveDiscord } from "@/lib/auth/runtime-config";
import { discordAuthorizeUrl } from "@/lib/integrations/discord-oauth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const errorUrl = (code: string) =>
    new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth=${code}`, request.url);

  const { clientId, redirectUri } = await resolveDiscord();
  if (!clientId) {
    return NextResponse.redirect(errorUrl("discord_missing_env"));
  }
  const origin = url.origin;
  const finalRedirect = redirectUri ?? `${origin}/api/auth/discord/callback`;
  const state = randomState();
  const dest = discordAuthorizeUrl({
    clientId,
    redirectUri: finalRedirect,
    state,
  });
  const res = NextResponse.redirect(dest);
  res.cookies.set(STATE_COOKIE, state, stateCookieAttributes());
  res.cookies.set(RETURN_COOKIE, returnTo, stateCookieAttributes());
  return res;
}
