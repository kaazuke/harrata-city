"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Card, CardBody } from "@/components/ui/Card";

type Tab = "whitelist" | "staff" | "business";

export default function CandidaturesPage() {
  const { config } = useSiteConfig();
  const [tab, setTab] = useState<Tab>("whitelist");

  const tabs: { id: Tab; label: string; desc: string }[] = [
    {
      id: "whitelist",
      label: "Whitelist",
      desc: "Accès joueur — présentez-vous et votre personnage.",
    },
    {
      id: "staff",
      label: "Staff",
      desc: "Rejoindre l équipe : modération, support, dev…",
    },
    {
      id: "business",
      label: "Entreprise / Faction",
      desc: "Projet de structure : besoins, effectifs, scénarios.",
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Candidatures"
        title="Postulez proprement, sans friction"
        subtitle="Les champs sont pilotés par la configuration du site (admin). Branchez Discord webhook côté serveur pour recevoir les dossiers."
      />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))] bg-white/10 text-[var(--rp-fg)]"
                  : "border-[var(--rp-border)] text-[var(--rp-muted)] hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-[var(--rp-muted)]">
          {tabs.find((x) => x.id === tab)?.desc}
        </div>

        <Card className="mt-8">
          <CardBody>
            {tab === "whitelist" ? (
              <DynamicForm
                title="Formulaire whitelist"
                description="Les champs sont modifiables depuis l admin."
                fields={config.forms.whitelist}
                endpoint="/api/forms"
                extraPayload={{ type: "whitelist" }}
              />
            ) : null}
            {tab === "staff" ? (
              <DynamicForm
                title="Formulaire staff"
                fields={config.forms.staff}
                endpoint="/api/forms"
                extraPayload={{ type: "staff" }}
              />
            ) : null}
            {tab === "business" ? (
              <DynamicForm
                title="Formulaire entreprise / faction"
                fields={config.forms.business}
                endpoint="/api/forms"
                extraPayload={{ type: "business" }}
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
