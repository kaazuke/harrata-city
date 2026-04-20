"use client";

import { useMemo, useState } from "react";
import type { FormField } from "@/config/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function DynamicForm({
  title,
  description,
  fields,
  endpoint,
  extraPayload,
}: {
  title: string;
  description?: string;
  fields: FormField[];
  endpoint: string;
  extraPayload?: Record<string, unknown>;
}) {
  const initial = useMemo(() => {
    const o: Record<string, string | boolean> = {};
    for (const f of fields) {
      if (f.type === "checkbox") {
        o[f.id] = false;
      } else {
        o[f.id] = "";
      }
    }
    return o;
  }, [fields]);

  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extraPayload, data: values }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("err");
        setMessage(json.error ?? "Envoi impossible");
        return;
      }
      setStatus("ok");
      setMessage("Merci — votre dossier a été transmis.");
      setValues(initial);
    } catch {
      setStatus("err");
      setMessage("Erreur réseau");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--rp-fg)]">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--rp-muted)]">{description}</p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {fields.map((f) => (
          <div key={f.id} className="space-y-2">
            <label className="text-xs font-semibold text-[var(--rp-muted)]">
              {f.label}
              {f.required ? <span className="text-[var(--rp-danger)]"> *</span> : null}
            </label>
            {f.type === "textarea" ? (
              <Textarea
                required={!!f.required}
                placeholder={f.placeholder}
                value={String(values[f.id] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.id]: e.target.value }))
                }
              />
            ) : null}

            {f.type === "text" || f.type === "email" || f.type === "number" ? (
              <Input
                type={f.type === "number" ? "number" : f.type}
                required={!!f.required}
                placeholder={f.placeholder}
                value={String(values[f.id] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.id]: e.target.value }))
                }
              />
            ) : null}

            {f.type === "select" ? (
              <select
                className="w-full rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--rp-fg)] outline-none focus:border-[color-mix(in_oklab,var(--rp-primary)_55%,var(--rp-border))]"
                required={!!f.required}
                value={String(values[f.id] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.id]: e.target.value }))
                }
              >
                <option value="">Choisir…</option>
                {(f.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : null}

            {f.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm text-[var(--rp-fg)]">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.id])}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.id]: e.target.checked }))
                  }
                />
                {f.placeholder ?? "Je confirme"}
              </label>
            ) : null}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Envoi…" : "Envoyer"}
      </Button>

      {message ? (
        <div
          className={`text-sm ${
            status === "ok" ? "text-[var(--rp-success)]" : "text-[var(--rp-danger)]"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
