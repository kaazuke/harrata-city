import { NextResponse } from "next/server";

type Payload = {
  type?: "whitelist" | "staff" | "business";
  data?: Record<string, unknown>;
};

function summarize(data: Record<string, unknown>) {
  return Object.entries(data)
    .map(([k, v]) => `**${k}**: ${String(v)}`)
    .join("\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    if (!body?.type || !body?.data) {
      return NextResponse.json(
        { ok: false, error: "Payload invalide" },
        { status: 400 },
      );
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (webhook) {
      const content = [
        `**Candidature** — ${body.type}`,
        summarize(body.data),
      ].join("\n\n");
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Site RP",
          content: content.slice(0, 1900),
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
