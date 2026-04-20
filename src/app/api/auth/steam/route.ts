import { NextResponse, type NextRequest } from "next/server";
import {
  RETURN_COOKIE,
  safeReturnTo,
  stateCookieAttributes,
} from "@/lib/auth/session";
import { resolveSteam } from "@/lib/auth/runtime-config";
import { steamLoginUrl } from "@/lib/integrations/steam-openid";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const callback = `${origin}/api/auth/steam/callback`;
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const { realm } = await resolveSteam();
  const dest = steamLoginUrl(callback, realm || origin);
  const res = NextResponse.redirect(dest);
  res.cookies.set(RETURN_COOKIE, returnTo, stateCookieAttributes());
  return res;
}
