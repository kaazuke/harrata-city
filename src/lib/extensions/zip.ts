import JSZip from "jszip";
import type { Extension } from "@/config/types";

/**
 * Format attendu d'une extension .zip :
 *
 *   mon-extension.zip
 *   ├── extension.json   (REQUIS — manifest)
 *   ├── icon.png         (optionnel — auto-converti en data URL)
 *   ├── README.md        (optionnel — affiché dans la description si pas de manifest.description)
 *   └── ... tout autre fichier (stocké en base64 dans settings._assets[chemin])
 *
 * Le manifest doit au minimum contenir :
 *   { "id": "mon-id", "name": "Mon extension", "version": "1.0.0" }
 *
 * Champs optionnels du manifest :
 *   description, author, category, settings, iconUrl
 */

export interface ParsedExtensionZip {
  manifest: Pick<Extension, "id" | "name" | "version"> & Partial<Extension>;
  /** Tous les autres fichiers, encodés en base64. Chemin → dataUrl. */
  assets: Record<string, string>;
  /** Si présent dans le zip, data URL de icon.png (déjà copié dans iconUrl du manifest). */
  iconDataUrl?: string;
  /** README.md si présent (utile pour fallback de description). */
  readme?: string;
}

const MAX_ZIP_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1 Mo par fichier
const TEXT_EXT = new Set([".json", ".md", ".txt", ".csv", ".html", ".css", ".js"]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function mimeFromExt(ext: string): string {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".json":
      return "application/json";
    case ".md":
      return "text/markdown";
    case ".txt":
      return "text/plain";
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    default:
      return "application/octet-stream";
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Lit un File .zip et renvoie un manifest + assets. Lance une erreur si invalide. */
export async function parseExtensionZip(file: File): Promise<ParsedExtensionZip> {
  if (file.size > MAX_ZIP_BYTES) {
    throw new Error(
      `Archive trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo). Limite : 5 Mo.`,
    );
  }
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  // Cherche le manifest (`extension.json` à la racine, ou dans le seul sous-dossier
  // racine si l'utilisateur a zippé un dossier au lieu de son contenu).
  let manifestEntry = zip.file(/^extension\.json$/i)[0];
  let pathPrefix = "";
  if (!manifestEntry) {
    // Recherche dans un sous-dossier unique racine (cas "Compressed Folder" Windows).
    const roots = new Set<string>();
    zip.forEach((relPath) => {
      const segs = relPath.split("/");
      if (segs.length > 1 && segs[0]) roots.add(segs[0]);
    });
    for (const root of roots) {
      const candidate = zip.file(new RegExp(`^${root}/extension\\.json$`, "i"))[0];
      if (candidate) {
        manifestEntry = candidate;
        pathPrefix = `${root}/`;
        break;
      }
    }
  }
  if (!manifestEntry) {
    throw new Error("extension.json introuvable à la racine du zip.");
  }

  const manifestText = await manifestEntry.async("string");
  let manifestRaw: unknown;
  try {
    manifestRaw = JSON.parse(manifestText);
  } catch (err) {
    throw new Error(`extension.json invalide : ${(err as Error).message}`);
  }

  const m = manifestRaw as Record<string, unknown>;
  const id = typeof m.id === "string" ? m.id.trim() : "";
  const name = typeof m.name === "string" ? m.name.trim() : "";
  const version = typeof m.version === "string" ? m.version.trim() : "";
  if (!id || !/^[a-z0-9_-]{2,40}$/.test(id)) {
    throw new Error('Manifest : champ "id" requis (2-40 chars, [a-z0-9_-]).');
  }
  if (!name) throw new Error('Manifest : champ "name" requis.');
  if (!version) throw new Error('Manifest : champ "version" requis.');

  const manifest: ParsedExtensionZip["manifest"] = {
    id,
    name,
    version,
    description: typeof m.description === "string" ? m.description : undefined,
    author: typeof m.author === "string" ? m.author : undefined,
    category: typeof m.category === "string" ? m.category : undefined,
    iconUrl: typeof m.iconUrl === "string" ? m.iconUrl : undefined,
    settings:
      m.settings && typeof m.settings === "object"
        ? (m.settings as Record<string, unknown>)
        : {},
  };

  const assets: Record<string, string> = {};
  let iconDataUrl: string | undefined;
  let readme: string | undefined;

  const files: Promise<void>[] = [];
  zip.forEach((relPath, entry) => {
    if (entry.dir) return;
    if (pathPrefix && !relPath.startsWith(pathPrefix)) return;
    const cleanPath = pathPrefix ? relPath.slice(pathPrefix.length) : relPath;
    if (cleanPath.toLowerCase() === "extension.json") return;

    files.push(
      (async () => {
        const u8 = await entry.async("uint8array");
        if (u8.byteLength > MAX_FILE_BYTES) {
          throw new Error(
            `Fichier "${cleanPath}" trop volumineux (>1 Mo). Limite par fichier : 1 Mo.`,
          );
        }
        const ext = extOf(cleanPath);
        const mime = mimeFromExt(ext);
        const dataUrl = `data:${mime};base64,${bytesToBase64(u8)}`;
        assets[cleanPath] = dataUrl;

        if (cleanPath.toLowerCase() === "icon.png" || cleanPath.toLowerCase() === "icon.jpg" || cleanPath.toLowerCase() === "icon.jpeg") {
          iconDataUrl = dataUrl;
        }
        if (cleanPath.toLowerCase() === "readme.md" && TEXT_EXT.has(".md")) {
          readme = new TextDecoder().decode(u8);
        }
      })(),
    );
  });

  await Promise.all(files);

  if (iconDataUrl && !manifest.iconUrl) manifest.iconUrl = iconDataUrl;
  if (readme && !manifest.description) {
    manifest.description = readme.split("\n").slice(0, 8).join(" ").slice(0, 240);
  }

  return { manifest, assets, iconDataUrl, readme };
}

/**
 * Combine le manifest + assets en un objet `Extension` prêt à être passé à
 * `installManual`. Les assets sont stockés dans `settings._assets`.
 */
export function buildExtensionFromZip(parsed: ParsedExtensionZip): Partial<Extension> {
  const { manifest, assets, readme } = parsed;
  const settings: Record<string, unknown> = { ...(manifest.settings ?? {}) };
  if (Object.keys(assets).length > 0) settings._assets = assets;
  if (readme) settings._readme = readme;
  return {
    ...manifest,
    settings,
    enabled: true,
  };
}
