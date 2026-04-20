import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { fetchFivemStatus } from "../../lib/fivem.js";
import { buildStatusEmbed } from "../../modules/statusUpdater.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Affiche le statut en direct du serveur FiveM Harrata City."),
  execute: async (interaction) => {
    await interaction.deferReply();
    const status = await fetchFivemStatus();
    const embed = buildStatusEmbed(status);

    if (status.source === "none") {
      embed.setColor(0xed4245).setDescription(
        "❌ Impossible de joindre le serveur. Essaie à nouveau dans quelques instants.",
      );
    }

    await interaction.editReply({ embeds: [embed instanceof EmbedBuilder ? embed : EmbedBuilder.from(embed)] });
  },
};

export default command;
