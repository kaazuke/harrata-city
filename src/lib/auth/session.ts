import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export type SessionUser = {
  provider: "discord" | "steam";
  sub: string;
  username: string;
  avatar?: string;
  exp: number;
};

const COOKIE_NAME = "rp_session";
const STATE_COOKIE = "rp_oauth_state";
const RETURN_COOKIE = "rp_oauth_return";

export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/api/")) return "/";
  return raw;
}

export function randomState() {
  return randomBytes(24).toString("hex");
}

export function signSession(user: Omit<SessionUser, "exp">, secret: string, ttlSec = 60 * 60 * 24 * 7) {
  const payload: SessionUser = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string, secret: string): SessionUser | null {
  const i = token.lastIndexOf(".");
  if (i <= 0) {
    return null;
  }
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieAttributes(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function stateCookieAttributes(maxAgeSec = 600) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export { COOKIE_NAME, STATE_COOKIE, RETURN_COOKIE };
