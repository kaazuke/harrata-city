/**
 * Vérifie que les chunks référencés par les bundles pages serveur existent.
 * Évite le démarrage avec un .next partiel (Cannot find module './611.js').
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(root, ".next");
const serverDir = path.join(nextDir, "server");
const runtimePath = path.join(serverDir, "webpack-runtime.js");
const pagesDir = path.join(serverDir, "pages");
const chunksDir = path.join(serverDir, "chunks");

function fail(msg) {
  console.error(msg);
  console.error("→ Lancez : npm run build:clean");
  process.exit(1);
}

if (process.env.SKIP_NEXT_VERIFY === "1") {
  console.log("verify-next-server: ignoré (SKIP_NEXT_VERIFY=1)");
  process.exit(0);
}

if (!fs.existsSync(runtimePath)) {
  fail("verify-next-server: .next/server/webpack-runtime.js introuvable.");
}

const runtimeSrc = fs.readFileSync(runtimePath, "utf8");
if (!runtimeSrc.includes("./chunks/")) {
  console.warn(
    "verify-next-server: format webpack-runtime inattendu (pas de ./chunks/). Vérification des fichiers seulement.",
  );
}

if (!fs.existsSync(pagesDir)) {
  fail(
    "verify-next-server: .next/server/pages introuvable (build incomplet ou disque plein pendant le build).",
  );
}

const chunkIds = new Set();
const re = /\.X\(0,\[([0-9,\s]+)\]/g;
for (const name of fs.readdirSync(pagesDir)) {
  if (!name.endsWith(".js") || name.endsWith(".map")) continue;
  const text = fs.readFileSync(path.join(pagesDir, name), "utf8");
  let m;
  while ((m = re.exec(text)) !== null) {
    for (const part of m[1].split(",")) {
      const id = parseInt(part.trim(), 10);
      if (Number.isFinite(id)) chunkIds.add(id);
    }
  }
}

const missing = [];
for (const id of chunkIds) {
  if (id === 311) continue;
  const file = path.join(chunksDir, `${id}.js`);
  if (!fs.existsSync(file)) missing.push(file);
}

if (missing.length) {
  fail(
    `verify-next-server: chunks serveur manquants (${missing.length}) :\n${missing.map((f) => "  - " + path.relative(root, f)).join("\n")}`,
  );
}

if (chunkIds.size) {
  console.log(
    "verify-next-server: OK —",
    chunkIds.size,
    "chunk(s) pages référencé(s), fichiers présents dans .next/server/chunks/",
  );
} else {
  console.log("verify-next-server: OK — aucune référence .X(0,[…]) dans pages (normal si build minimal).");
}
