"use client";

import { AnalyticsTrackerExtension } from "@/components/extensions/AnalyticsTrackerExtension";
import { DiscordWidgetExtension } from "@/components/extensions/DiscordWidgetExtension";
import { FivemPlayerCounterExtension } from "@/components/extensions/FivemPlayerCounterExtension";
import { LiveChatExtension } from "@/components/extensions/LiveChatExtension";
import { TicketsRpExtension } from "@/components/extensions/TicketsRpExtension";

/**
 * Monte toutes les extensions "side panel / overlay" du site.
 * Chaque composant teste lui-même `isExtensionEnabled` et se rend ou non.
 * Ainsi le layout reste minimal : un seul point d'extension.
 */
export function ExtensionsHost() {
  return (
    <>
      <AnalyticsTrackerExtension />
      <FivemPlayerCounterExtension />
      <DiscordWidgetExtension />
      <TicketsRpExtension />
      <LiveChatExtension />
    </>
  );
}
