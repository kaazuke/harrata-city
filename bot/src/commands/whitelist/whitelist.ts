import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Ouvre le formulaire de candidature whitelist."),
  execute: async (interaction) => {
    const modal = new ModalBuilder()
      .setCustomId("whitelist:modal")
      .setTitle("Candidature Whitelist — Harrata City");

    const ageInput = new TextInputBuilder()
      .setCustomId("age")
      .setLabel("Ton âge réel")
      .setPlaceholder("ex: 19")
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(3)
      .setRequired(true);

    const charNameInput = new TextInputBuilder()
      .setCustomId("charName")
      .setLabel("Nom & prénom de ton personnage")
      .setPlaceholder("ex: Marcus Rodriguez")
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(80)
      .setRequired(true);

    const backgroundInput = new TextInputBuilder()
      .setCustomId("background")
      .setLabel("Background du personnage (court)")
      .setPlaceholder("3-5 lignes : origines, parcours, motivations…")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(50)
      .setMaxLength(1500)
      .setRequired(true);

    const rpDefInput = new TextInputBuilder()
      .setCustomId("rpDef")
      .setLabel("Définition du RP selon toi")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(20)
      .setMaxLength(500)
      .setRequired(true);

    const experienceInput = new TextInputBuilder()
      .setCustomId("experience")
      .setLabel("Expérience FiveM RP (serveurs passés)")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(ageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(charNameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(backgroundInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(rpDefInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(experienceInput),
    );

    await interaction.showModal(modal);
  },
};

export default command;
