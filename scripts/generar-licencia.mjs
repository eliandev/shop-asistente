#!/usr/bin/env node
/**
 * Genera una licencia PRO del widget para un cliente que pagó.
 *
 * Uso:
 *   node scripts/generar-licencia.mjs "Glow Beauty" colourpop.com
 *   node scripts/generar-licencia.mjs "Mi Marca"            (sin tienda)
 *
 * Lee LICENCIA_SECRET del entorno o de .env.local. La licencia queda atada a
 * marca + dominio EXACTOS que el cliente usó en /crear (si cambia la marca,
 * cambia la licencia). Enviale al cliente su licencia para reemplazar
 * "TU-LICENCIA-PRO" en el snippet del widget.
 */
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [marca, dominio = ""] = process.argv.slice(2);
if (!marca) {
  console.error('Uso: node scripts/generar-licencia.mjs "Nombre de la marca" [dominio.com]');
  process.exit(1);
}

let secreto = process.env.LICENCIA_SECRET;
if (!secreto) {
  try {
    const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
    const env = readFileSync(join(raiz, ".env.local"), "utf8");
    secreto = env.match(/^LICENCIA_SECRET=(.+)$/m)?.[1]?.trim();
  } catch {}
}
if (!secreto) {
  console.error("Falta LICENCIA_SECRET (en el entorno o en .env.local).");
  process.exit(1);
}

// misma normalización que lib/licencias.ts
const marcaNorm = marca
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/\s+/g, " ")
  .trim();
const identidad = `${marcaNorm}|${dominio.toLowerCase().trim()}`;
const licencia =
  "PRO-" + createHmac("sha256", secreto).update(identidad).digest("base64url").slice(0, 24);

console.log("──────────────────────────────────────────────");
console.log(` Marca:    ${marca}`);
console.log(` Dominio:  ${dominio || "(sin tienda conectada)"}`);
console.log(` Licencia: ${licencia}`);
console.log("──────────────────────────────────────────────");
console.log("El cliente debe reemplazar TU-LICENCIA-PRO por esa licencia");
console.log('en el atributo data-licencia de su snippet del widget.');
