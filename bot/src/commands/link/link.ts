import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { env } from "../../config/env.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Obtiens le lien pour associer ton compte Discord au site Harrata City."),
  execute: async (interaction) => {
    const base = env.site.apiUrl.replace(/\/$/, "");
    const loginUrl = `${base}/api/auth/discord?returnTo=${encodeURIComponent("/compte")}`;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🔗 Lier ton compte Harrata City")
      .setDescription(
        [
          `Clique sur le lien ci-dessous, connecte-toi **avec le même compte Discord** et autorise l'application.`,
          `Une fois lié, tu recevras automatiquement le rôle <@&${env.roles.linked || "LINKED_ROLE_ID"}> sur ce serveur.`,
          "",
          `👉 [Lier mon compte](${loginUrl})`,
        ].join("\n"),
      )
      .setFooter({ text: "Le lien est personnel, ne le partage pas." });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
