import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { sendModLog } from "../../modules/modLog.js";

const command: Command = {
  staffOnly: true,
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertit un membre du serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("membre").setDescription("Le membre à avertir").setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("raison").setDescription("Raison de l'avertissement").setRequired(true),
    ),
  execute: async (interaction) => {
    const target = interaction.options.getUser("membre", true);
    const reason = interaction.options.getString("raison", true);

    await target
      .send(
        `⚠️ Tu as reçu un avertissement sur **${interaction.guild?.name}**.\n**Raison :** ${reason}`,
      )
      .catch(() => null);

    await sendModLog(interaction.client, {
      action: "Avertissement",
      color: 0xfee75c,
      target,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({ content: `✅ ${target} a été averti.`, ephemeral: true });
  },
};

export default command;
