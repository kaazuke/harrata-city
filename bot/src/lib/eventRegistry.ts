import type { Client, ClientEvents } from "discord.js";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = join(__dirname, "..", "events");

export interface EventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

export async function loadEvents(client: Client): Promise<number> {
  const files = (await readdir(EVENTS_DIR)).filter(
    (f) => /\.(ts|js)$/.test(f) && !f.endsWith(".d.ts"),
  );
  let count = 0;

  for (const file of files) {
    try {
      const mod = (await import(pathToFileURL(join(EVENTS_DIR, file)).href)) as {
        default?: EventHandler;
      };
      const handler = mod.default;
      if (!handler || !handler.name || typeof handler.execute !== "function") {
        logger.warn({ file }, "Event ignoré : export default invalide");
        continue;
      }
      if (handler.once) {
        client.once(handler.name, (...args) => handler.execute(...(args as never)));
      } else {
        client.on(handler.name, (...args) => handler.execute(...(args as never)));
      }
      count++;
      logger.debug({ event: handler.name, once: handler.once ?? false }, "Event enregistré");
    } catch (err) {
      logger.error({ err, file }, "Erreur chargement event");
    }
  }

  logger.info({ count }, "Events enregistrés");
  return count;
}
