"use client";

import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { StatsBars } from "@/components/stats/StatsBars";

export default function StatistiquesPage() {
  const { config } = useSiteConfig();
  return (
    <div>
      <PageHero
        eyebrow="Statistiques"
        title="Pilotage & transparence"
        subtitle="Cartes réutilisables + graphique simple. Branchez une API FiveM / DB pour des données live."
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.statCards.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="text-xs font-semibold text-[var(--rp-muted)]">{s.label}</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--rp-fg)]">{s.value}</div>
                {s.hint ? <div className="mt-2 text-xs text-[var(--rp-muted)]">{s.hint}</div> : null}
                {s.trend ? (
                  <div className="mt-2 text-xs font-semibold text-[var(--rp-success)]">{s.trend}</div>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardBody>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-lg font-semibold text-[var(--rp-fg)]">
                  Activité hebdomadaire (mock)
                </div>
                <div className="mt-1 text-sm text-[var(--rp-muted)]">
                  Exemple de série temporelle — remplacez par vos agrégats.
                </div>
              </div>
              <div className="text-xs text-[var(--rp-muted)]">
                API suggérée :{" "}
                <span className="font-mono">{config.server.metricsApiUrl || "NON CONFIGURÉE"}</span>
              </div>
            </div>
            <StatsBars />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
