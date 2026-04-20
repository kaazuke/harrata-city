/**
 * Usage: node scripts/who-uses-port.mjs 3000
 * Sous Windows avec PowerShell — affiche une aide si netstat échoue.
 */
import { execSync } from "node:child_process";
import process from "node:process";

const port = process.argv[2] || "3000";
console.log(`\nRecherche du PID sur le port ${port} (Windows)...\n`);
try {
  const out = execSync(`netstat -ano | findstr :${port}`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  console.log(out.trim() || "(aucune ligne — port peut-être libre)");
  console.log(
    "\nPour arrêter un processus : taskkill /PID <numero> /F\n",
  );
} catch {
  console.log(
    "Impossible d exécuter netstat. Fermez les terminaux où tourne `next dev` / `next start`, puis relancez `npm run dev:clean`.\n",
  );
}
