/**
 * ============================================================================
 *  LICENCIAS DEL WIDGET (plan Pro) — firmadas, sin base de datos
 * ============================================================================
 *  Modelo freemium:
 *    - GRATIS: el link compartible del asistente (/chat?c=...).
 *    - PRO: el widget embebido en el sitio/tienda del cliente.
 *
 *  La licencia es un token HMAC-SHA256 firmado con LICENCIA_SECRET (solo
 *  servidor), atado a la identidad estable del asistente: marca + dominio.
 *  No hace falta base de datos: si la firma coincide, la licencia es válida.
 *
 *  El dueño del producto genera licencias al cobrar:
 *    node scripts/generar-licencia.mjs "Glow Beauty" colourpop.com
 *
 *  Nota: es un candado de negocio (anti "copiar y pegar el widget sin pagar"),
 *  no un sistema antifraude bancario. Para SaaS real: cuentas + KV (Fase 7).
 * ============================================================================
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { ConfigAsistente } from "./config-asistente";

const SECRET = process.env.LICENCIA_SECRET || "";

/** Identidad estable a la que se ata la licencia. */
export function identidadLicencia(marca: string, dominio: string): string {
  const marcaNorm = marca
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${marcaNorm}|${(dominio || "").toLowerCase().trim()}`;
}

/** Genera el token de licencia (usado por el script del dueño). */
export function firmarLicencia(marca: string, dominio: string, secreto = SECRET): string {
  if (!secreto) throw new Error("Falta LICENCIA_SECRET");
  const firma = createHmac("sha256", secreto)
    .update(identidadLicencia(marca, dominio))
    .digest("base64url")
    .slice(0, 24);
  return `PRO-${firma}`;
}

/** ¿La licencia corresponde a esta config? (comparación en tiempo constante) */
export function licenciaValida(
  lic: unknown,
  cfg: Pick<ConfigAsistente, "marca" | "dominio">
): boolean {
  if (!SECRET || typeof lic !== "string" || !lic.startsWith("PRO-")) return false;
  const esperada = firmarLicencia(cfg.marca, cfg.dominio);
  const a = Buffer.from(lic);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Mensaje que ve el visitante cuando el widget no está activado. */
export function mensajeSinLicencia(marca: string, origen: string): string {
  return (
    `Este asistente está en modo vista previa en este sitio 🌱\n\n` +
    `¿Sos de ${marca}? Activá el widget Pro para atender a tus clientes aquí mismo: ` +
    `${origen}/crear (sección "Activar en tu tienda").\n\n` +
    `Mientras tanto, podés chatear gratis con el asistente desde su link directo.`
  );
}
