import { REST, Routes } from "discord.js";
import { env } from "../src/config/env.js";
import { logger } from "../src/lib/logger.js";
import { loadCommands } from "../src/lib/commandRegistry.js";

async function main() {
  logger.info("Déploiement des slash commands…");

  const commands = await loadCommands();
  const body = commands.map((c) => c.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(env.discord.token);

  const scope = process.argv.includes("--global") ? "global" : "guild";
  const route =
    scope === "global"
      ? Routes.applicationCommands(env.discord.clientId)
      : Routes.applicationGuildCommands(env.discord.clientId, env.discord.guildId);

  logger.info({ scope, count: body.length }, "Envoi à Discord");

  const data = (await rest.put(route, { body })) as unknown[];
  logger.info({ count: data.length }, "✅ Commands déployées");
}

void main().catch((err) => {
  logger.fatal({ err }, "Échec du déploiement");
  process.exit(1);
});
