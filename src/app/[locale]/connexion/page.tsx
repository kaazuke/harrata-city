import type { Metadata } from "next";
import { LoginClient } from "@/components/account/LoginClient";

export const metadata: Metadata = { title: "Connexion" };

export default function Page() {
  return <LoginClient />;
}
