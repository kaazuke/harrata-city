import { NextResponse } from "next/server";

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    if (!body?.message || body.message.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Message trop court" },
        { status: 400 },
      );
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Contact site",
          content: [
            body.subject ? `**Sujet**: ${body.subject}` : null,
            body.name ? `**Nom**: ${body.name}` : null,
            body.email ? `**Email**: ${body.email}` : null,
            `**Message**:\n${body.message}`,
          ]
            .filter(Boolean)
            .join("\n")
            .slice(0, 1900),
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
