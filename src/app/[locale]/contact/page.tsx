"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useAccount } from "@/components/providers/AccountProvider";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { addMessage } from "@/lib/support/store";

export default function ContactPage() {
  const { config } = useSiteConfig();
  const { user } = useAccount();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [feedback, setFeedback] = useState("");

  const displayedAuthor =
    user?.profile.displayName?.trim() || user?.username || name.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    const finalName = displayedAuthor;
    const finalSubject = subject.trim();
    const finalMessage = message.trim();

    if (!finalName) {
      setStatus("err");
      setFeedback("Indiquez votre pseudo.");
      return;
    }
    if (!finalSubject || finalSubject.length < 3) {
      setStatus("err");
      setFeedback("Sujet trop court (3 caractères minimum).");
      return;
    }
    if (finalMessage.length < 10) {
      setStatus("err");
      setFeedback("Message trop court (10 caractères minimum).");
      return;
    }

    addMessage({
      authorId: user?.id ?? null,
      authorName: finalName,
      subject: finalSubject.slice(0, 120),
      message: finalMessage.slice(0, 2000),
    });

    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: finalName,
        subject: finalSubject,
        message: finalMessage,
      }),
    }).catch(() => {
      /* best-effort: si pas de webhook configuré, ce n'est pas bloquant */
    });

    setStatus("ok");
    setFeedback("Message envoyé au staff. Vous recevrez une réponse via Discord ou en jeu.");
    setSubject("");
    setMessage("");
    if (!user) setName("");
  }

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Support & FAQ"
        subtitle="Une question, un signalement ? Écrivez au staff sans email — votre message arrive directement dans le panneau d'admin."
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Écrire au staff"
                subtitle="Pas besoin d'email. Le staff vous répondra via Discord ou en jeu."
              />
              <CardBody>
                <form className="grid gap-4" onSubmit={onSubmit}>
                  {!user ? (
                    <div>
                      <label className="text-xs font-semibold text-[var(--rp-muted)]">
                        Votre pseudo
                      </label>
                      <Input
                        className="mt-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Comment doit-on vous appeler ?"
                        required
                      />
                    </div>
                  ) : (
                    <div className="rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3 py-2 text-xs text-[var(--rp-muted)]">
                      Vous êtes connecté(e) en tant que{" "}
                      <span className="font-semibold text-[var(--rp-fg)]">
                        {displayedAuthor}
                      </span>
                      .
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      Sujet
                    </label>
                    <Input
                      className="mt-2"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Résumé court (ex: « Bug whitelist »)"
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--rp-muted)]">
                      Message
                    </label>
                    <Textarea
                      className="mt-2"
                      required
                      rows={6}
                      maxLength={2000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre demande (10 caractères min.)"
                    />
                    <p className="mt-1 text-right text-[10px] text-[var(--rp-muted)]">
                      {message.length}/2000
                    </p>
                  </div>
                  <Button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Envoi…" : "Envoyer au staff"}
                  </Button>
                  {feedback ? (
                    <div
                      className={`text-sm ${
                        status === "ok"
                          ? "text-[var(--rp-success)]"
                          : "text-[var(--rp-danger)]"
                      }`}
                    >
                      {feedback}
                    </div>
                  ) : null}
                </form>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Liens rapides" />
              <CardBody>
                <div className="space-y-2 text-sm">
                  {config.social.discord ? (
                    <a
                      className="block text-[var(--rp-primary)] hover:underline"
                      href={config.social.discord}
                    >
                      Discord
                    </a>
                  ) : null}
                  {config.contact.supportEmail ? (
                    <div className="text-[var(--rp-muted)]">
                      Email :{" "}
                      <span className="font-mono text-[var(--rp-fg)]">
                        {config.contact.supportEmail}
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            {config.modules.ticketVisual ? (
              <Card>
                <CardHeader
                  title="Ticket (visuel)"
                  subtitle="Intégration future : Zendesk / Discord threads."
                />
                <CardBody>
                  <div className="rounded-[var(--rp-radius)] border border-dashed border-[var(--rp-border)] bg-black/20 p-4 text-sm text-[var(--rp-muted)]">
                    <div className="text-xs font-semibold text-[var(--rp-fg)]">
                      #TCK-2048
                    </div>
                    <div className="mt-2">Ouvert • Priorité normale</div>
                    <div className="mt-3 text-xs">
                      Ce bloc est un placeholder premium pour vos futurs workflows.
                    </div>
                  </div>
                  {config.contact.ticketDiscordChannel ? (
                    <a
                      className="mt-4 inline-block text-sm font-semibold text-[var(--rp-primary)] hover:underline"
                      href={config.contact.ticketDiscordChannel}
                    >
                      Ouvrir un ticket Discord →
                    </a>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader title="FAQ" />
              <CardBody>
                <div className="space-y-4">
                  {config.faq.map((f, idx) => (
                    <div
                      key={idx}
                      className="border-b border-[var(--rp-border)] pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="text-sm font-semibold text-[var(--rp-fg)]">
                        {f.question}
                      </div>
                      <div className="mt-2 text-sm text-[var(--rp-muted)]">
                        {f.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
