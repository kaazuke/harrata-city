import { Client, GatewayIntentBits, Partials } from "discord.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { loadCommands } from "./lib/commandRegistry.js";
import { loadEvents } from "./lib/eventRegistry.js";
import { startStatusUpdater } from "./modules/statusUpdater.js";
import { startNewsPoster } from "./modules/newsPoster.js";

async function main() {
  logger.info("Démarrage du bot Harrata City…");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
  });

  await loadCommands();
  await loadEvents(client);

  client.once("clientReady", (c) => {
    startStatusUpdater(c);
    startNewsPoster(c);
  });

  process.on("unhandledRejection", (err) => logger.error({ err }, "unhandledRejection"));
  process.on("uncaughtException", (err) => logger.error({ err }, "uncaughtException"));

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Arrêt demandé, destruction du client…");
    try {
      await client.destroy();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await client.login(env.discord.token);
}

void main().catch((err) => {
  logger.fatal({ err }, "Échec démarrage du bot");
  process.exit(1);
});
