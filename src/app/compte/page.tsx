import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = { title: "Mon compte" };

export default function Page() {
  return <AccountClient />;
}
