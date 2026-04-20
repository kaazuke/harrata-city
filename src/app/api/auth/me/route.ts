import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth/session";
import { resolveAuthSecret } from "@/lib/auth/runtime-config";

export async function GET(request: NextRequest) {
  const secret = await resolveAuthSecret();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!secret || !token) {
    return NextResponse.json({ user: null });
  }
  const user = verifySession(token, secret);
  return NextResponse.json({ user });
}
