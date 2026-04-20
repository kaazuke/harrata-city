import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export interface Command {
  data: CommandData;
  /** Rôles/permissions requises (vérifiées en plus des permissions Discord natives). */
  staffOnly?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
