import {
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  type ModalSubmitInteraction,
} from "discord.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export async function handleWhitelistModal(interaction: ModalSubmitInteraction): Promise<void> {
  const age = interaction.fields.getTextInputValue("age");
  const charName = interaction.fields.getTextInputValue("charName");
  const background = interaction.fields.getTextInputValue("background");
  const rpDef = interaction.fields.getTextInputValue("rpDef");
  const experience = interaction.fields.getTextInputValue("experience") || "_(non renseignée)_";

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("📝 Nouvelle candidature whitelist")
    .setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL({ size: 128 }),
    })
    .addFields(
      { name: "Âge", value: age, inline: true },
      { name: "Personnage", value: charName, inline: true },
      { name: "Discord ID", value: `\`${interaction.user.id}\``, inline: true },
      { name: "Background", value: background.slice(0, 1024) },
      { name: "Définition du RP", value: rpDef.slice(0, 1024) },
      { name: "Expérience FiveM", value: experience.slice(0, 1024) },
    )
    .setTimestamp();

  // Transmet au site (endpoint /api/forms) si disponible
  try {
    const base = env.site.apiUrl.replace(/\/$/, "");
    await fetch(`${base}/api/forms`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.site.apiToken ? { authorization: `Bearer ${env.site.apiToken}` } : {}),
      },
      body: JSON.stringify({
        type: "whitelist",
        source: "discord-bot",
        user: {
          discordId: interaction.user.id,
          tag: interaction.user.tag,
        },
        data: { age, charName, background, rpDef, experience },
      }),
    });
  } catch (err) {
    logger.warn({ err }, "whitelistManager : échec transmission vers /api/forms (non bloquant)");
  }

  // Envoi dans le salon mod-log (ou fallback dans le salon d'origine)
  const logChannelId = env.channels.modLog;
  if (logChannelId) {
    const channel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
    if (channel && channel.type === ChannelType.GuildText) {
      await channel.send({ embeds: [embed] }).catch(() => null);
    }
  }

  await interaction.reply({
    content:
      "✅ Ta candidature a été envoyée au staff. Tu seras contacté(e) sous peu.\nMerci d'avoir postulé à **Harrata City** !",
    flags: MessageFlags.Ephemeral,
  });
}
