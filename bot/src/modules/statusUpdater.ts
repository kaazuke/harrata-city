import {
  ChannelType,
  EmbedBuilder,
  type Client,
  type Message,
  type TextChannel,
} from "discord.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { fetchFivemStatus, type FivemLiveStatus } from "../lib/fivem.js";

const STATUS_MESSAGE_MARKER = "harrata:status";
let statusMessage: Message | null = null;
let timer: NodeJS.Timeout | null = null;

export function buildStatusEmbed(status: FivemLiveStatus): EmbedBuilder {
  const ratio =
    status.maxPlayers > 0 ? Math.round((status.playersOnline / status.maxPlayers) * 100) : 0;
  const bar = "█".repeat(Math.min(20, Math.floor(ratio / 5))).padEnd(20, "░");

  const embed = new EmbedBuilder()
    .setColor(status.online ? 0x2ecc71 : 0xed4245)
    .setTitle(status.hostname ?? "Harrata City — FiveM")
    .setDescription(
      status.description ??
        "Serveur FiveM Roleplay — économie vivante, factions, métiers et expérience urbaine.",
    )
    .addFields(
      {
        name: "Statut",
        value: status.online ? "🟢 En ligne" : "🔴 Hors ligne",
        inline: true,
      },
      {
        name: "Joueurs",
        value: `**${status.playersOnline}** / ${status.maxPlayers || "?"}`,
        inline: true,
      },
      {
        name: "Connexion",
        value: "`connect 51.68.125.155:30120`",
        inline: false,
      },
      {
        name: "Remplissage",
        value: `\`${bar}\` ${ratio}%`,
        inline: false,
      },
    )
    .setFooter({ text: `Source : ${status.source} • Mise à jour` })
    .setTimestamp();

  if (status.iconBase64?.startsWith("data:image")) {
    // Discord ne supporte pas les data URIs ; l'icône est affichée côté admin uniquement.
  }

  return embed;
}

async function findOrCreateStatusMessage(channel: TextChannel): Promise<Message> {
  if (statusMessage && statusMessage.channelId === channel.id) return statusMessage;

  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  const existing = messages?.find(
    (m) => m.author.id === channel.client.user?.id && m.embeds[0]?.footer?.text?.includes(STATUS_MESSAGE_MARKER),
  );

  if (existing) {
    statusMessage = existing;
    return existing;
  }

  const placeholder = new EmbedBuilder()
    .setColor(0x95a5a6)
    .setTitle("Statut serveur")
    .setDescription("Chargement…")
    .setFooter({ text: STATUS_MESSAGE_MARKER });

  const msg = await channel.send({ embeds: [placeholder] });
  statusMessage = msg;
  return msg;
}

async function tick(client: Client) {
  if (!env.channels.status) return;
  try {
    const channel = await client.channels.fetch(env.channels.status).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {
      logger.warn({ id: env.channels.status }, "STATUS_CHANNEL_ID invalide ou inaccessible");
      return;
    }

    const status = await fetchFivemStatus();
    const embed = buildStatusEmbed(status);
    embed.setFooter({ text: `${STATUS_MESSAGE_MARKER} • ${status.source}` });

    const message = await findOrCreateStatusMessage(channel);
    await message.edit({ embeds: [embed] });
  } catch (err) {
    logger.error({ err }, "Échec statusUpdater.tick");
  }
}

export function startStatusUpdater(client: Client): void {
  if (!env.channels.status) {
    logger.info("statusUpdater : désactivé (STATUS_CHANNEL_ID non défini)");
    return;
  }

  const seconds = Math.max(15, env.runtime.statusRefreshSeconds);
  logger.info({ seconds }, "statusUpdater : démarrage");

  void tick(client);
  timer = setInterval(() => void tick(client), seconds * 1000);
}

export function stopStatusUpdater(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
