import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function uploadAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_PUBLIC_MARKETPLACE_UPLOAD === "true"
  );
}

/**
 * Upload d’image pour la vitrine (Tebex / catalogue).
 * Désactivé en production sauf si ALLOW_PUBLIC_MARKETPLACE_UPLOAD=true
 * (hébergement privé — ne pas exposer sur Internet sans reverse-proxy / auth).
 */
export async function POST(req: Request) {
  if (!uploadAllowed()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Upload serveur désactivé. En dev il est actif ; en prod ajoutez ALLOW_PUBLIC_MARKETPLACE_UPLOAD=true ou utilisez une image hébergée (URL) + export HTML.",
      },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Formulaire invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Fichier trop volumineux (max ${MAX_BYTES / 1024 / 1024} Mo).` },
      { status: 400 },
    );
  }

  const mime = file.type;
  const ext = ALLOWED.get(mime);
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Type non autorisé (JPEG, PNG, WebP, GIF)." },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Fichier trop volumineux." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", "marketplace");
  await mkdir(dir, { recursive: true });

  const base = `listing_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${base}${ext}`;
  const fsPath = path.join(dir, filename);

  try {
    await writeFile(fsPath, buf);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Écriture disque impossible (droits ou hébergement read-only)." },
      { status: 500 },
    );
  }

  const url = `/uploads/marketplace/${filename}`;
  return NextResponse.json({ ok: true, url });
}
