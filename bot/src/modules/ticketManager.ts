import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMember,
  type TextChannel,
} from "discord.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const TICKET_TYPES = {
  general: { label: "Général", color: 0x2ecc71 },
  whitelist: { label: "Whitelist", color: 0xfee75c },
  report: { label: "Signalement", color: 0xed4245 },
} as const;

type TicketType = keyof typeof TICKET_TYPES;

function ticketChannelName(member: GuildMember, type: TicketType): string {
  const safe = member.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24) || "user";
  return `ticket-${type}-${safe}`;
}

async function openTicket(interaction: ButtonInteraction, type: TicketType): Promise<void> {
  if (!interaction.guild || !interaction.inCachedGuild()) return;

  const member = interaction.member;

  const existing = interaction.guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildText &&
      c.name.startsWith(`ticket-${type}-`) &&
      c.name.endsWith(
        member.user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24) || "user",
      ),
  );

  if (existing) {
    await interaction.reply({
      content: `Tu as déjà un ticket ouvert : ${existing}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const parent = env.channels.tickets
    ? await interaction.guild.channels.fetch(env.channels.tickets).catch(() => null)
    : null;

  const channel = await interaction.guild.channels.create({
    name: ticketChannelName(member, type),
    type: ChannelType.GuildText,
    parent: parent && parent.type === ChannelType.GuildCategory ? parent.id : undefined,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      ...(env.roles.staff
        ? [
            {
              id: env.roles.staff,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ]
        : []),
    ],
  });

  const meta = TICKET_TYPES[type];
  const embed = new EmbedBuilder()
    .setColor(meta.color)
    .setTitle(`Ticket ${meta.label}`)
    .setDescription(
      `Bienvenue ${member}, un membre du staff te répondra dès que possible.\n\nDécris ta demande avec le plus de précision possible.`,
    )
    .setFooter({ text: `Type : ${type} • Ouvre le /close pour fermer.` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket:close")
      .setLabel("Fermer le ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),
  );

  await (channel as TextChannel).send({
    content: `${member}${env.roles.staff ? ` <@&${env.roles.staff}>` : ""}`,
    embeds: [embed],
    components: [row],
  });

  await interaction.reply({ content: `✅ Ticket créé : ${channel}`, flags: MessageFlags.Ephemeral });
  logger.info({ user: member.id, type, channel: channel.id }, "Ticket ouvert");
}

export async function closeTicket(
  interaction: ButtonInteraction | ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;

  await interaction.reply({
    content: "🔒 Fermeture du ticket dans 5 secondes…",
  });

  setTimeout(() => {
    interaction.channel
      ?.delete(`Ticket fermé par ${interaction.user.tag}`)
      .catch((err) => logger.warn({ err }, "Échec suppression ticket"));
  }, 5_000);
}

export async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split(":");
  const action = parts[1];

  if (action === "close") {
    await closeTicket(interaction);
    return;
  }

  if (action === "open") {
    const type = (parts[2] ?? "general") as TicketType;
    if (!(type in TICKET_TYPES)) return;
    await openTicket(interaction, type);
    return;
  }
}
