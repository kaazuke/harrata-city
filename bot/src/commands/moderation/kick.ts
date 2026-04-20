import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { sendModLog } from "../../modules/modLog.js";

const command: Command = {
  staffOnly: true,
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulse un membre du serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
      opt.setName("membre").setDescription("Membre à expulser").setRequired(true),
    )
    .addStringOption((opt) => opt.setName("raison").setDescription("Raison").setRequired(true)),
  execute: async (interaction) => {
    const target = interaction.options.getUser("membre", true);
    const reason = interaction.options.getString("raison", true);
    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: "❌ Membre introuvable.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({
        content: "⛔ Je ne peux pas expulser ce membre (rôles trop élevés).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await target
      .send(
        `👢 Tu as été expulsé de **${interaction.guild?.name}**.\n**Raison :** ${reason}`,
      )
      .catch(() => null);

    await member.kick(`${interaction.user.tag} — ${reason}`);

    await sendModLog(interaction.client, {
      action: "Expulsion",
      color: 0xeb6f3c,
      target,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `✅ ${target.tag} a été expulsé.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
