import { ChannelType, EmbedBuilder, type Client, type User } from "discord.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export interface ModLogEntry {
  action: string;
  color: number;
  target: User;
  moderator: User;
  reason: string;
  extra?: string;
}

export async function sendModLog(client: Client, entry: ModLogEntry): Promise<void> {
  if (!env.channels.modLog) return;

  const channel = await client.channels.fetch(env.channels.modLog).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) {
    logger.warn({ id: env.channels.modLog }, "MOD_LOG_CHANNEL_ID invalide");
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(entry.color)
    .setTitle(entry.action)
    .addFields(
      {
        name: "Membre",
        value: `${entry.target} (\`${entry.target.id}\`)`,
        inline: true,
      },
      {
        name: "Modérateur",
        value: `${entry.moderator} (\`${entry.moderator.id}\`)`,
        inline: true,
      },
      { name: "Raison", value: entry.reason.slice(0, 1000), inline: false },
    )
    .setThumbnail(entry.target.displayAvatarURL({ size: 256 }))
    .setTimestamp();

  if (entry.extra) embed.addFields({ name: "Détails", value: entry.extra });

  await channel.send({ embeds: [embed] }).catch((err) => {
    logger.warn({ err }, "modLog : échec envoi");
  });
}
