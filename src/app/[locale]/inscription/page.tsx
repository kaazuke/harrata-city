import type { Metadata } from "next";
import { SignupClient } from "@/components/account/SignupClient";

export const metadata: Metadata = { title: "Créer un compte" };

export default function Page() {
  return <SignupClient />;
}
