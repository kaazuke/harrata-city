import { ChannelType, EmbedBuilder, type Client, type TextChannel } from "discord.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

interface NewsItem {
  id?: string;
  slug?: string;
  title: string;
  summary?: string;
  body?: string;
  tag?: string;
  publishedAt?: string;
  url?: string;
}

const postedIds = new Set<string>();
let timer: NodeJS.Timeout | null = null;

async function fetchLatestNews(): Promise<NewsItem[]> {
  const base = env.site.apiUrl.replace(/\/$/, "");
  const url = `${base}/api/news`;

  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: NewsItem[] } | NewsItem[];
    return Array.isArray(data) ? data : (data.items ?? []);
  } catch (err) {
    logger.debug({ err }, "newsPoster : récupération échouée (endpoint /api/news pas encore exposé ?)");
    return [];
  }
}

async function tick(client: Client) {
  if (!env.channels.news) return;

  try {
    const channel = await client.channels.fetch(env.channels.news).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const items = await fetchLatestNews();
    for (const item of items) {
      const id = item.id ?? item.slug ?? item.title;
      if (!id || postedIds.has(id)) continue;
      postedIds.add(id);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(item.title)
        .setDescription(item.summary ?? item.body?.slice(0, 500) ?? "—")
        .setTimestamp(item.publishedAt ? new Date(item.publishedAt) : new Date());

      if (item.tag) embed.addFields({ name: "Catégorie", value: item.tag, inline: true });
      if (item.url) embed.setURL(item.url);

      await (channel as TextChannel).send({ embeds: [embed] }).catch((err) => {
        logger.warn({ err }, "newsPoster : échec envoi");
      });
    }
  } catch (err) {
    logger.error({ err }, "Échec newsPoster.tick");
  }
}

export function startNewsPoster(client: Client): void {
  if (!env.channels.news) {
    logger.info("newsPoster : désactivé (NEWS_CHANNEL_ID non défini)");
    return;
  }

  const seconds = Math.max(60, env.runtime.newsPollSeconds);
  logger.info({ seconds }, "newsPoster : démarrage");

  // Au boot, on marque les news existantes comme déjà postées pour éviter le spam
  void fetchLatestNews().then((items) => {
    items.forEach((i) => {
      const id = i.id ?? i.slug ?? i.title;
      if (id) postedIds.add(id);
    });
    logger.debug({ seeded: postedIds.size }, "newsPoster : historique initial chargé");
  });

  timer = setInterval(() => void tick(client), seconds * 1000);
}

export function stopNewsPoster(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
