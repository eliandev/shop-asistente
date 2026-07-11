/**
 * ============================================================================
 *  CONFIG DE ASISTENTE PERSONALIZADO — "motor de marca" generalizado
 * ============================================================================
 *  Cualquier marca puede crear su asistente (ej. "María" para una marca de
 *  belleza). La configuración viaja CODIFICADA EN EL LINK (?c=...) y en el
 *  widget (data-config) — sin base de datos: el link ES el asistente.
 *
 *  Seguridad: el servidor decodifica y SANITIZA cada campo (límites de
 *  longitud, caracteres peligrosos fuera). Las reglas anti-invención del
 *  prompt son fijas del servidor: la config solo aporta identidad y datos
 *  del negocio, nunca reglas.
 *
 *  Este módulo se usa en cliente y servidor (sin dependencias de Node).
 * ============================================================================
 */

export interface ConfigAsistente {
  /** nombre de la marca/tienda (ej. "Glow Beauty") */
  marca: string;
  /** nombre del asistente (ej. "María") */
  asistente: string;
  /** a qué se dedica la marca (ej. "productos de belleza y skincare") */
  rubro: string;
  /** saludo inicial del chat */
  saludo: string;
  /** color primario (hex) */
  color: string;
  /** color de fondo (hex) */
  fondo: string;
  /** dominio Shopify para catálogo en vivo (opcional, sin token vía UCP) */
  dominio: string;
  /** contacto humano (opcional): teléfono/WhatsApp */
  whatsapp: string;
  /** web de la marca (opcional) */
  web: string;
  /** datos del negocio en texto libre: envíos, pagos, políticas, horarios */
  datos: string;
}

const LIMITES: Record<keyof ConfigAsistente, number> = {
  marca: 40,
  asistente: 30,
  rubro: 90,
  saludo: 200,
  color: 9,
  fondo: 9,
  dominio: 80,
  whatsapp: 30,
  web: 120,
  datos: 700,
};

const HEX = /^#[0-9a-fA-F]{3,8}$/;

/** Limpia un texto: sin etiquetas ni caracteres de control, con tope. */
function limpiarTexto(valor: unknown, max: number): string {
  if (typeof valor !== "string") return "";
  return valor
    .replace(/[<>`\\]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Deja el dominio en su forma mínima: sin protocolo, sin ruta. */
export function limpiarDominio(valor: unknown): string {
  if (typeof valor !== "string") return "";
  const d = valor
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .slice(0, LIMITES.dominio);
  return /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : "";
}

/** Sanitiza una config cruda (venga de donde venga). */
export function sanitizarConfig(cruda: any): ConfigAsistente {
  const color = typeof cruda?.color === "string" && HEX.test(cruda.color.trim())
    ? cruda.color.trim()
    : "#0047AB";
  const fondo = typeof cruda?.fondo === "string" && HEX.test(cruda.fondo.trim())
    ? cruda.fondo.trim()
    : "#F5EEE3";
  return {
    marca: limpiarTexto(cruda?.marca, LIMITES.marca),
    asistente: limpiarTexto(cruda?.asistente, LIMITES.asistente),
    rubro: limpiarTexto(cruda?.rubro, LIMITES.rubro),
    saludo: limpiarTexto(cruda?.saludo, LIMITES.saludo),
    color,
    fondo,
    dominio: limpiarDominio(cruda?.dominio),
    whatsapp: limpiarTexto(cruda?.whatsapp, LIMITES.whatsapp),
    web: limpiarTexto(cruda?.web, LIMITES.web),
    datos: limpiarTexto(cruda?.datos, LIMITES.datos),
  };
}

/** ¿Tiene lo mínimo para funcionar? (marca + asistente) */
export function configValida(cfg: ConfigAsistente): boolean {
  return cfg.marca.length >= 2 && cfg.asistente.length >= 2;
}

/** Config → valor del parámetro ?c= (JSON URL-encoded). */
export function codificarConfig(cfg: ConfigAsistente): string {
  return encodeURIComponent(JSON.stringify(cfg));
}

/**
 * Valor de ?c= → config sanitizada, o null si no parsea / no es válida.
 * Acepta el valor ya URL-decodificado (los frameworks lo entregan así).
 */
export function decodificarConfig(c: unknown): ConfigAsistente | null {
  if (typeof c !== "string" || !c || c.length > 4000) return null;
  try {
    const cruda = JSON.parse(c);
    const cfg = sanitizarConfig(cruda);
    return configValida(cfg) ? cfg : null;
  } catch {
    return null;
  }
}

/** Saludo por defecto al crear un asistente. */
export function saludoPorDefecto(asistente: string, marca: string): string {
  return `¡Hola! Soy ${asistente || "tu asistente"}, de ${marca || "la tienda"} 💬 Puedo ayudarte con productos, precios y más. ¿Qué buscás?`;
}
