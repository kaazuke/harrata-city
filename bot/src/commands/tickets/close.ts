import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/command.js";
import { closeTicket } from "../../modules/ticketManager.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Ferme le ticket dans lequel cette commande est exécutée.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  execute: async (interaction) => {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "❌ Cette commande doit être utilisée dans un salon de ticket.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.channel.name.startsWith("ticket-")) {
      await interaction.reply({
        content: "❌ Ce salon n'est pas un ticket.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await closeTicket(interaction);
  },
};

export default command;
