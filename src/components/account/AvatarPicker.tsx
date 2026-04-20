"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

const MAX_SIZE = 320;
const MAX_BYTES = 350_000;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Image illisible"));
    i.src = dataUrl;
  });
  const ratio = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(img, 0, 0, w, h);
  let quality = 0.9;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (out.length > MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}

export function AvatarPicker({
  value,
  onChange,
  label = "Avatar",
}: {
  value?: string;
  onChange: (next: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const url = await fileToCompressedDataUrl(file);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur de lecture du fichier.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--rp-muted)]">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-[var(--rp-border)] bg-black/30">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--rp-muted)]">
              vide
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handle(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Traitement…" : value ? "Changer" : "Choisir une image"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onChange(undefined)}
              >
                Retirer
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-[var(--rp-muted)]">
            JPEG/PNG/WebP. Redimensionné à {MAX_SIZE}px max, compressé.
          </p>
          {err ? <p className="text-[11px] text-[var(--rp-danger)]">{err}</p> : null}
        </div>
      </div>
    </div>
  );
}
