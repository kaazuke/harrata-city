import { Collection } from "discord.js";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Command } from "../types/command.js";
import { logger } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, "..", "commands");

export const commands = new Collection<string, Command>();

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

export async function loadCommands(): Promise<Command[]> {
  commands.clear();
  const files = await walk(COMMANDS_DIR);
  const loaded: Command[] = [];

  for (const file of files) {
    try {
      const mod = (await import(pathToFileURL(file).href)) as { default?: Command };
      const command = mod.default;
      if (!command || !command.data || typeof command.execute !== "function") {
        logger.warn({ file }, "Commande ignorée : export default invalide");
        continue;
      }
      commands.set(command.data.name, command);
      loaded.push(command);
      logger.debug({ name: command.data.name }, "Commande chargée");
    } catch (err) {
      logger.error({ err, file }, "Erreur chargement commande");
    }
  }

  logger.info({ count: loaded.length }, "Commandes chargées");
  return loaded;
}
