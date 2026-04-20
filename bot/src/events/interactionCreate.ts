import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  type Interaction,
  type InteractionReplyOptions,
} from "discord.js";
import type { EventHandler } from "../lib/eventRegistry.js";
import { commands } from "../lib/commandRegistry.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { handleTicketButton } from "../modules/ticketManager.js";
import { handleWhitelistModal } from "../modules/whitelistManager.js";

const handler: EventHandler<"interactionCreate"> = {
  name: "interactionCreate",
  execute: async (interaction: Interaction) => {
    try {
      if (interaction.isButton() && interaction.customId.startsWith("ticket:")) {
        await handleTicketButton(interaction);
        return;
      }

      if (interaction.isModalSubmit() && interaction.customId === "whitelist:modal") {
        await handleWhitelistModal(interaction);
        return;
      }

      if (!interaction.isChatInputCommand()) return;

      const command = commands.get(interaction.commandName);
      if (!command) {
        logger.warn({ name: interaction.commandName }, "Commande inconnue");
        return;
      }

      if (command.staffOnly) {
        const member = interaction.inCachedGuild() ? interaction.member : null;
        const isStaff =
          member?.permissions.has(PermissionFlagsBits.ManageGuild) ||
          (env.roles.staff && member?.roles.cache.has(env.roles.staff));
        if (!isStaff) {
          await interaction.reply({
            content: "⛔ Cette commande est réservée au staff.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      if (interaction.channel?.type === ChannelType.DM) {
        await interaction.reply({
          content: "⚠️ Cette commande n'est pas utilisable en messages privés.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await command.execute(interaction);
    } catch (err) {
      logger.error({ err }, "Erreur pendant l'exécution d'une interaction");
      if (interaction.isRepliable()) {
        const msg: InteractionReplyOptions = {
          content: "💥 Une erreur est survenue.",
          flags: MessageFlags.Ephemeral,
        };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(msg).catch(() => null);
        } else {
          await interaction.reply(msg).catch(() => null);
        }
      }
    }
  },
};

export default handler;
