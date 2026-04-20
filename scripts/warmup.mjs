#!/usr/bin/env node
/**
 * Warm-up : visite toutes les routes principales pour forcer la compilation
 * (utile en dev pour éviter le délai de la première navigation sur chaque page).
 *
 * Usage : node scripts/warmup.mjs [base-url]
 *   - base-url par défaut : http://localhost:3000
 */

const base = process.argv[2] ?? "http://localhost:3000";

const routes = [
  "/",
  "/presentation",
  "/reglement",
  "/candidatures",
  "/boutique",
  "/equipe",
  "/actualites",
  "/galerie",
  "/statistiques",
  "/contact",
  "/forum",
  "/connexion",
  "/inscription",
  "/compte",
  "/admin",
];

const start = Date.now();
let okCount = 0;
let failCount = 0;

console.log(`> Warm-up de ${routes.length} routes sur ${base}`);

await Promise.all(
  routes.map(async (path) => {
    const t0 = Date.now();
    try {
      const r = await fetch(base + path, { redirect: "manual" });
      const ms = Date.now() - t0;
      if (r.status >= 500) {
        failCount++;
        console.log(`  x ${path.padEnd(20)} ${r.status} (${ms}ms)`);
      } else {
        okCount++;
        console.log(`  + ${path.padEnd(20)} ${r.status} (${ms}ms)`);
      }
    } catch (e) {
      failCount++;
      console.log(`  x ${path.padEnd(20)} ERR ${e?.message ?? e}`);
    }
  }),
);

const total = Date.now() - start;
console.log(`\nDone in ${total}ms — ok=${okCount} fail=${failCount}`);
