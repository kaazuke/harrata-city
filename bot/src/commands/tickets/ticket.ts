import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  staffOnly: true,
  data: new SlashCommandBuilder()
    .setName("ticket-panel")
    .setDescription("Envoie le panneau de tickets dans le salon courant.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎫 Support Harrata City")
      .setDescription(
        [
          "Besoin d'aide ? Ouvre un ticket et un membre du staff te répondra rapidement.",
          "",
          "**Catégories disponibles :**",
          "🟢 **Général** — questions, aide, bug mineur",
          "🟡 **Whitelist** — question sur ta candidature",
          "🔴 **Signalement** — rapport de joueur / abus",
        ].join("\n"),
      )
      .setFooter({ text: "Un seul ticket ouvert à la fois par membre." });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket:open:general")
        .setLabel("Général")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("ticket:open:whitelist")
        .setLabel("Whitelist")
        .setEmoji("🟡")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("ticket:open:report")
        .setLabel("Signalement")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),
    );

    const channel = interaction.channel;
    if (channel && "send" in channel) {
      await channel.send({ embeds: [embed], components: [row] });
    }
    await interaction.reply({ content: "✅ Panneau envoyé.", flags: MessageFlags.Ephemeral });
  },
};

export default command;
