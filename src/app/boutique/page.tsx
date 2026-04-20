"use client";

import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import type { BoutiqueProduct, SiteConfig } from "@/config/types";
import { tebexPackageUrl } from "@/lib/integrations/tebex";

function checkoutUrl(p: BoutiqueProduct, config: SiteConfig) {
  if (p.tebexUrl) {
    return p.tebexUrl;
  }
  const tebex = config.integrations?.tebex;
  if (
    tebex?.enableGeneratedPackageLinks &&
    tebex.storeBaseUrl &&
    p.tebexPackageId
  ) {
    return tebexPackageUrl(tebex.storeBaseUrl, p.tebexPackageId);
  }
  return null;
}

export default function BoutiquePage() {
  const { config } = useSiteConfig();
  return (
    <div>
      <PageHero
        eyebrow="Boutique"
        title="Conversion premium, sans pay-to-win"
        subtitle="Structure prête pour Tebex : fiches produits, badges promo, et liens d achat externes."
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        {config.modules.boutiquePromo ? (
          <div className="rounded-[var(--rp-radius)] border border-[color-mix(in_oklab,var(--rp-accent)_35%,var(--rp-border))] bg-[color-mix(in_oklab,var(--rp-accent)_10%,transparent)] px-5 py-4 text-sm text-[var(--rp-fg)]">
            <span className="font-semibold text-[var(--rp-accent)]">Promo</span>
            <span className="mx-2 text-white/25">|</span>
            Offre weekend : bundles cosmétiques & support prioritaire.
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {config.boutiqueProducts.map((p) => {
            const buy = checkoutUrl(p, config);
            return (
            <Card key={p.id} className="overflow-hidden">
              <div className="border-b border-[var(--rp-border)] px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  {p.badge === "vip" ? <Badge tone="primary">VIP</Badge> : null}
                  {p.badge === "new" ? <Badge tone="success">Nouveau</Badge> : null}
                  {p.badge === "promo" ? <Badge tone="accent">Promo</Badge> : null}
                  {p.badge === "limited" ? <Badge tone="danger">Limité</Badge> : null}
                  {p.promoLabel ? (
                    <Badge tone="accent">{p.promoLabel}</Badge>
                  ) : null}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-[var(--rp-fg)]">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--rp-muted)]">{p.description}</p>
              </div>
              <CardBody>
                <div className="text-2xl font-semibold text-[var(--rp-fg)]">
                  {p.priceLabel}
                </div>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--rp-muted)]">
                  {p.perks.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {buy ? (
                    <a href={buy} target="_blank" rel="noreferrer">
                      <Button type="button" className="w-full sm:w-auto">
                        Acheter (Tebex)
                      </Button>
                    </a>
                  ) : (
                    <Button type="button" disabled className="w-full sm:w-auto">
                      Lien Tebex à configurer
                    </Button>
                  )}
                  <Link href="/contact">
                    <Button type="button" variant="ghost" className="w-full sm:w-auto">
                      Question avant achat
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
          })}
        </div>
      </div>
    </div>
  );
}
