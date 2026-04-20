import { PageHero } from "@/components/layout/PageHero";
import { RulesClient } from "@/components/rules/RulesClient";

export default function ReglementPage() {
  return (
    <div>
      <PageHero
        eyebrow="Règlement"
        title="Un cadre clair pour un RP durable"
        subtitle="Général, RP, staff et whitelist — recherchez un mot-clé ou partagez une section via son ancre."
      />
      <RulesClient />
    </div>
  );
}
