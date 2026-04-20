"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

export function ForumDisabled() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardBody className="text-center">
          <h1 className="font-heading text-xl font-semibold text-[var(--rp-fg)]">Forum désactivé</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)]">
            Le module forum est désactivé. Réactivez-le dans{" "}
            <Link href="/admin" className="font-semibold text-[var(--rp-primary)] underline-offset-2 hover:underline">
              Administration
            </Link>{" "}
            → onglet <span className="font-mono text-xs">Modules</span> → case{" "}
            <span className="font-mono text-xs">forum</span>, puis enregistrez la configuration locale.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline"
          >
            ← Retour à l’accueil
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
