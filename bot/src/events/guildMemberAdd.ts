import { ChannelType, EmbedBuilder, type GuildMember } from "discord.js";
import type { EventHandler } from "../lib/eventRegistry.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const handler: EventHandler<"guildMemberAdd"> = {
  name: "guildMemberAdd",
  execute: async (member: GuildMember) => {
    if (member.guild.id !== env.discord.guildId) return;

    if (!env.channels.welcome) return;
    const channel = await member.guild.channels.fetch(env.channels.welcome).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Bienvenue à Harrata City ! 🎉")
      .setDescription(
        `Salut ${member}, bienvenue sur notre communauté **FiveM Roleplay** !\n\n` +
          "📖 Consulte le <#règlement>\n" +
          "🎮 Rejoins le serveur : `connect 51.68.125.155:30120`\n" +
          "🔗 Lie ton compte : `/link`\n" +
          "📝 Candidate à la whitelist : `/whitelist`",
      )
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `Membre n°${member.guild.memberCount}` })
      .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [embed] }).catch((err) => {
      logger.warn({ err }, "Échec envoi message de bienvenue");
    });
  },
};

export default handler;
