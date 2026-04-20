import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Teste la latence et la disponibilité du bot."),
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: "Pong…", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(interaction.client.ws.ping);
    await interaction.editReply(`🏓 Pong ! Latence **${latency}ms** · API Discord **${api}ms**`);
  },
};

export default command;
