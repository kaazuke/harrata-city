import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  RETURN_COOKIE,
  STATE_COOKIE,
  safeReturnTo,
  sessionCookieAttributes,
  signSession,
} from "@/lib/auth/session";
import { resolveAuthSecret, resolveDiscord } from "@/lib/auth/runtime-config";
import { discordExchangeCode, discordFetchMe } from "@/lib/integrations/discord-oauth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  const [secret, discord] = await Promise.all([resolveAuthSecret(), resolveDiscord()]);
  const { clientId, clientSecret } = discord;

  const returnTo = safeReturnTo(request.cookies.get(RETURN_COOKIE)?.value);
  const errorUrl = (code: string) =>
    new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth=${code}`, request.url);
  const okUrl = new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}auth=ok`, request.url);

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(errorUrl("discord_state"));
  }
  if (!secret || !clientId || !clientSecret) {
    return NextResponse.redirect(errorUrl("discord_missing_env"));
  }

  const origin = new URL(request.url).origin;
  const redirectUri =
    discord.redirectUri ?? `${origin}/api/auth/discord/callback`;

  try {
    const token = await discordExchangeCode({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });
    const me = await discordFetchMe(token.access_token);
    const avatar =
      me.avatar != null
        ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
        : undefined;
    const session = signSession(
      {
        provider: "discord",
        sub: me.id,
        username: me.global_name ?? me.username,
        avatar,
      },
      secret,
    );
    const res = NextResponse.redirect(okUrl);
    res.cookies.set(COOKIE_NAME, session, sessionCookieAttributes(60 * 60 * 24 * 7));
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(RETURN_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.redirect(errorUrl("discord_error"));
  }
}
