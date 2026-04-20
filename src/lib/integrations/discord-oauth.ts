export function discordAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}) {
  const scopes = opts.scopes?.length ? opts.scopes : ["identify", "email"];
  const u = new URL("https://discord.com/api/oauth2/authorize");
  u.searchParams.set("client_id", opts.clientId);
  u.searchParams.set("redirect_uri", opts.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", scopes.join(" "));
  u.searchParams.set("state", opts.state);
  u.searchParams.set("prompt", "consent");
  return u.toString();
}

export async function discordExchangeCode(opts: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    client_id: opts.clientId,
    client_secret: opts.clientSecret,
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord token: ${res.status} ${t}`);
  }
  return (await res.json()) as { access_token: string; token_type: string };
}

export async function discordFetchMe(accessToken: string) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord @me: ${res.status} ${t}`);
  }
  return (await res.json()) as {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string | null;
  };
}
