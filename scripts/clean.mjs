import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [".next", path.join("node_modules", ".cache"), ".turbo"];

for (const t of targets) {
  const abs = path.join(root, t);
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log("Supprimé:", t);
  } catch (e) {
    console.log("Ignoré:", t, String(e?.message ?? e));
  }
}
