import { ActivityType, type Client } from "discord.js";
import type { EventHandler } from "../lib/eventRegistry.js";
import { logger } from "../lib/logger.js";

const handler: EventHandler<"clientReady"> = {
  name: "clientReady",
  once: true,
  execute: (client: Client<true>) => {
    logger.info(
      { tag: client.user.tag, id: client.user.id, guilds: client.guilds.cache.size },
      "Bot prêt",
    );

    client.user.setPresence({
      activities: [{ name: "Harrata City FiveM", type: ActivityType.Playing }],
      status: "online",
    });
  },
};

export default handler;
