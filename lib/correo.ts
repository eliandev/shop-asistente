/**
 * ============================================================================
 *  COMPOSITOR DE CORREO — lead "Reclamar tu asistente"
 * ============================================================================
 *  Genera el asunto + HTML + texto del correo que recibe la persona al
 *  reclamar su asistente. NO envía nada: `/api/lead` escribe el resultado en
 *  la colección `mail` y la extensión "Trigger Email from Firestore" lo envía
 *  por SMTP. Así no hay backend de correo propio (ver docs/LEADS.md).
 *
 *  HTML pensado para clientes de correo: layout con tablas, estilos inline,
 *  fondo claro (mejor entregabilidad y legibilidad que un tema oscuro).
 * ============================================================================
 */

import type { TipoLead } from "@/components/ReclamarAsistente";

export interface DatosCorreo {
  nombre: string | null;
  tipo: TipoLead;
  asistente: string; // nombre del asistente
  marca: string;
  color: string; // color primario de la marca (hex)
  shareUrl: string; // link del asistente (/chat?c=...)
  widgetSnippet: string; // <script> del widget para su tienda
}

const MARCA_LIMA = "#0e0e0f";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Deriva el snippet del widget a partir del link (?c=) del asistente. */
export function snippetDesdeShareUrl(
  shareUrl: string,
  origen: string,
  asistente: string,
  color: string,
  tipo: TipoLead
): string {
  let c = "";
  try {
    c = new URL(shareUrl).searchParams.get("c") ?? "";
  } catch {
    /* url inválida: snippet sin config */
  }
  const licencia = tipo === "pro" ? '\n  data-licencia="TU-LICENCIA-PRO"' : "";
  return (
    `<script src="${origen}/widget.js" defer\n` +
    `  data-color="${color}"\n` +
    `  data-etiqueta="Chateá con ${asistente}"${licencia}\n` +
    `  data-config="${c}">\n` +
    `</script>`
  );
}

export function construirCorreoLead(d: DatosCorreo): {
  subject: string;
  html: string;
  text: string;
} {
  const saludo = d.nombre ? `Hola ${esc(d.nombre)}` : "¡Hola!";
  const nombreAsistente = esc(d.asistente || "tu asistente");
  const marca = esc(d.marca || "tu marca");
  const color = /^#[0-9a-fA-F]{3,8}$/.test(d.color) ? d.color : "#0047AB";

  const esPro = d.tipo === "pro";
  const subject = esPro
    ? `${nombreAsistente}: activá el widget en tu tienda`
    : `${nombreAsistente} ya es tu asistente — llevátelo`;

  const intro = esPro
    ? `Estás a un paso de tener a <strong>${nombreAsistente}</strong> atendiendo dentro de tu propia tienda. Te enviaremos tu licencia Pro muy pronto; mientras tanto, tu asistente ya funciona con este link:`
    : `Guardá este correo: acá está <strong>${nombreAsistente}</strong>, el asistente de <strong>${marca}</strong>. Compartí su link donde quieras — redes, bio, WhatsApp. Es gratis para siempre.`;

  const bloquePro = esPro
    ? `
      <tr><td style="padding:8px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4438;">Cuando recibas tu licencia, pegá este código en tu tienda (Custom Liquid del Theme Editor) y reemplazá <code>TU-LICENCIA-PRO</code>:</p>
        <pre style="margin:0;padding:14px;background:#0e0e0f;color:#e6ffa8;border-radius:10px;font-size:12px;line-height:1.5;overflow-x:auto;white-space:pre-wrap;word-break:break-all;">${esc(d.widgetSnippet)}</pre>
      </td></tr>`
    : `
      <tr><td style="padding:8px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4438;">¿Querés la burbuja de chat dentro de tu tienda? Con el plan Pro se instala con una línea. Respondé a este correo y te pasamos tu licencia.</p>
      </td></tr>`;

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5eee3;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5eee3;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4dbc9;">
        <tr><td style="background:${MARCA_LIMA};padding:20px 26px;">
          <span style="color:#c9f73a;font-size:20px;font-weight:800;letter-spacing:2px;">SILVI&deg;</span>
          <span style="color:#8f8f86;font-size:12px;"> &nbsp;·&nbsp; asistentes de IA</span>
        </td></tr>
        <tr><td style="padding:28px 26px 8px;">
          <h1 style="margin:0 0 10px;font-size:22px;color:#1e1e1e;">${saludo} 👋</h1>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4a4438;">${intro}</p>
        </td></tr>
        <tr><td style="padding:0 26px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:12px;background:${esc(color)};">
              <a href="${esc(d.shareUrl)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Abrir a ${nombreAsistente} →</a>
            </td>
          </tr></table>
          <p style="margin:12px 0 0;font-size:12px;color:#8a8474;word-break:break-all;">${esc(d.shareUrl)}</p>
        </td></tr>
        <tr><td style="padding:18px 26px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bloquePro}</table>
        </td></tr>
        <tr><td style="padding:22px 26px 28px;">
          <hr style="border:none;border-top:1px solid #e4dbc9;margin:0 0 14px;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8474;">
            Recibís este correo porque creaste un asistente en Silvi Assistants y pediste llevártelo.
            Hecho en El Salvador · <a href="https://silvi-assistants.vercel.app" style="color:#0047ab;">silvi-assistants.vercel.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `${d.nombre ? `Hola ${d.nombre}` : "¡Hola!"}`,
    "",
    esPro
      ? `Estás a un paso de tener a ${d.asistente} en tu tienda. Te enviaremos tu licencia Pro pronto. Mientras tanto, tu asistente ya funciona:`
      : `Acá está ${d.asistente}, el asistente de ${d.marca}. Compartí su link donde quieras — es gratis para siempre:`,
    "",
    d.shareUrl,
    "",
    esPro
      ? `Cuando recibas tu licencia, pegá este código en tu tienda y reemplazá TU-LICENCIA-PRO:\n\n${d.widgetSnippet}`
      : `¿Querés la burbuja en tu tienda? Respondé a este correo y te pasamos el plan Pro.`,
    "",
    "— Silvi Assistants · silvi-assistants.vercel.app",
  ].join("\n");

  return { subject, html, text };
}
