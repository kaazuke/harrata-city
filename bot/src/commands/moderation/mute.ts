import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { sendModLog } from "../../modules/modLog.js";

const DURATIONS = {
  "60s": 60_000,
  "5m": 5 * 60_000,
  "10m": 10 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
  "1w": 7 * 24 * 60 * 60_000,
} as const;

type DurationKey = keyof typeof DURATIONS;

const command: Command = {
  staffOnly: true,
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Rend un membre silencieux pour une durée définie (timeout).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("membre").setDescription("Membre à rendre silencieux").setRequired(true),
    )
    .addStringOption((opt) => {
      const o = opt.setName("duree").setDescription("Durée du timeout").setRequired(true);
      (Object.keys(DURATIONS) as DurationKey[]).forEach((k) => o.addChoices({ name: k, value: k }));
      return o;
    })
    .addStringOption((opt) => opt.setName("raison").setDescription("Raison").setRequired(true)),
  execute: async (interaction) => {
    const target = interaction.options.getUser("membre", true);
    const duree = interaction.options.getString("duree", true) as DurationKey;
    const reason = interaction.options.getString("raison", true);
    const ms = DURATIONS[duree];

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "❌ Membre introuvable.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({
        content: "⛔ Je ne peux pas rendre silencieux ce membre.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await member.timeout(ms, `${interaction.user.tag} — ${reason}`);

    await target
      .send(
        `🔇 Tu as été rendu silencieux sur **${interaction.guild?.name}** pour **${duree}**.\n**Raison :** ${reason}`,
      )
      .catch(() => null);

    await sendModLog(interaction.client, {
      action: `Mute (${duree})`,
      color: 0x9b59b6,
      target,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `✅ ${target.tag} est désormais silencieux pour ${duree}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
