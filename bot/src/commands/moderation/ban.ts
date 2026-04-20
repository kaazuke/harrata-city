import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { sendModLog } from "../../modules/modLog.js";

const command: Command = {
  staffOnly: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannit un membre du serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("membre").setDescription("Membre à bannir").setRequired(true),
    )
    .addStringOption((opt) => opt.setName("raison").setDescription("Raison").setRequired(true))
    .addIntegerOption((opt) =>
      opt
        .setName("jours")
        .setDescription("Nombre de jours de messages à supprimer (0-7)")
        .setMinValue(0)
        .setMaxValue(7),
    ),
  execute: async (interaction) => {
    const target = interaction.options.getUser("membre", true);
    const reason = interaction.options.getString("raison", true);
    const deleteDays = interaction.options.getInteger("jours") ?? 0;

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({
        content: "⛔ Je ne peux pas bannir ce membre (rôles trop élevés).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await target
      .send(`🔨 Tu as été banni de **${interaction.guild.name}**.\n**Raison :** ${reason}`)
      .catch(() => null);

    await interaction.guild.members.ban(target.id, {
      reason: `${interaction.user.tag} — ${reason}`,
      deleteMessageSeconds: deleteDays * 86_400,
    });

    await sendModLog(interaction.client, {
      action: "Bannissement",
      color: 0xed4245,
      target,
      moderator: interaction.user,
      reason,
      extra: deleteDays > 0 ? `Messages supprimés : ${deleteDays} jour(s)` : undefined,
    });

    await interaction.reply({
      content: `✅ ${target.tag} a été banni.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
