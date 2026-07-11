import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/lib/system-prompt";
import {
  buscarProductos,
  shopifyConfigurado,
  type ProductoShopify,
} from "@/lib/shopify";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

// --- Límites para proteger tu factura de API durante la votación pública ---
const MAX_MENSAJE = 800;
const MAX_HISTORIAL = 12;
const RATE_LIMIT = 15;
const RATE_VENTANA_MS = 60_000;
const MAX_VUELTAS_HERRAMIENTA = 3;

const peticiones = new Map<string, { conteo: number; reinicio: number }>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const r = peticiones.get(ip);
  if (!r || ahora > r.reinicio) {
    peticiones.set(ip, { conteo: 1, reinicio: ahora + RATE_VENTANA_MS });
    return false;
  }
  r.conteo += 1;
  return r.conteo > RATE_LIMIT;
}

// Herramienta que Silvi puede invocar para consultar Shopify en vivo.
const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: "buscar_productos",
    description:
      "Busca productos reales en la tienda Shopify de ART-ES por nombre, tipo o palabra clave. " +
      "Devuelve título, descripción, precio y disponibilidad EN VIVO. " +
      "Usalo SIEMPRE que el cliente pregunte por productos, precios, disponibilidad o qué se vende.",
    input_schema: {
      type: "object",
      properties: {
        consulta: {
          type: "string",
          description:
            "Término de búsqueda (ej: 'bolso', 'cartera', 'cojines'). " +
            "Usar cadena vacía \"\" para ver el catálogo general (ideal para '¿qué venden?'). " +
            "La búsqueda es estricta: si un término específico no devuelve nada, " +
            "reintentá con cadena vacía y ofrecé lo que sí hay.",
        },
      },
      required: ["consulta"],
    },
  },
];

type Mensaje = { role: "user" | "assistant"; content: string };

/**
 * El chat renderiza texto plano; el prompt pide no usar Markdown pero el
 * modelo a veces igual pone negritas. Se limpian los marcadores más comunes
 * para que no se vean asteriscos en pantalla.
 */
function aTextoPlano(t: string): string {
  return t
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^\s*\*\s+/gm, "- ");
}

async function ejecutarHerramienta(
  nombre: string,
  input: any,
  encontrados: ProductoShopify[]
): Promise<string> {
  if (nombre !== "buscar_productos") {
    return "Herramienta desconocida.";
  }
  try {
    const consulta = typeof input?.consulta === "string" ? input.consulta : "";
    const productos = await buscarProductos(consulta.slice(0, 120));
    if (productos.length === 0) {
      return "No se encontraron productos para esa búsqueda en la tienda.";
    }
    encontrados.push(...productos);
    // al modelo no le mandamos las URLs de imagen (ruido de tokens);
    // las tarjetas visuales se arman server-side con `encontrados`
    return JSON.stringify(
      productos.map(({ imagen, ...resto }) => resto)
    );
  } catch (e) {
    console.error("Error consultando Shopify:", e);
    return "No fue posible consultar la tienda en este momento. No hay datos de productos disponibles.";
  }
}

/** Tarjeta de producto que el cliente renderiza bajo la respuesta. */
interface TarjetaProducto {
  titulo: string;
  precio: string;
  url: string | null;
  imagen: string | null;
}

const PALABRAS_COMUNES = new Set([
  "bolso", "bolsos", "cartera", "carteras", "set", "mano", "estilo",
  "para", "color", "con", "hecho", "hecha", "tejido", "tejida", "los",
  "las", "del", "por",
]);

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Palabras que identifican a un producto (ej. "elena", "rubi", "cojines"). */
function palabrasDistintivas(titulo: string): string[] {
  return normalizar(titulo)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !PALABRAS_COMUNES.has(w));
}

/**
 * De todos los productos que devolvió la herramienta, se queda con los que la
 * respuesta realmente menciona, en el orden en que aparecen en el texto.
 */
function productosMencionados(
  texto: string,
  encontrados: ProductoShopify[]
): TarjetaProducto[] {
  const t = normalizar(texto);
  const vistos = new Set<string>();
  return encontrados
    .map((p) => {
      const posiciones = palabrasDistintivas(p.titulo)
        .map((w) => t.indexOf(w))
        .filter((i) => i >= 0);
      return { p, pos: posiciones.length ? Math.min(...posiciones) : -1 };
    })
    .filter(({ p, pos }) => {
      if (pos < 0) return false;
      const clave = p.url ?? p.titulo;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    })
    .sort((a, b) => a.pos - b.pos)
    .slice(0, 5)
    .map(({ p }) => ({
      titulo: p.titulo,
      precio: p.precioDesde,
      url: p.url,
      imagen: p.imagen,
    }));
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    if (limitado(ip)) {
      return NextResponse.json(
        { error: "Estás enviando muchos mensajes muy rápido. Probá en un momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const historial: Mensaje[] = Array.isArray(body?.messages) ? body.messages : [];
    const artesano =
      typeof body?.artesano === "string" ? body.artesano.slice(0, 60) : null;

    const limpios = historial
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MENSAJE) }))
      .slice(-MAX_HISTORIAL);

    if (limpios.length === 0 || limpios[limpios.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "No hay un mensaje válido para responder." },
        { status: 400 }
      );
    }

    const system = getSystemPrompt(artesano);
    const usarHerramientas = shopifyConfigurado();

    const mensajes: Anthropic.MessageParam[] = limpios.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let respuesta = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      temperature: 0.3,
      system,
      messages: mensajes,
      ...(usarHerramientas ? { tools: HERRAMIENTAS } : {}),
    });

    const encontrados: ProductoShopify[] = [];

    let vueltas = 0;
    while (respuesta.stop_reason === "tool_use" && vueltas < MAX_VUELTAS_HERRAMIENTA) {
      vueltas++;

      mensajes.push({ role: "assistant", content: respuesta.content });

      const resultados: Anthropic.ToolResultBlockParam[] = [];
      for (const bloque of respuesta.content) {
        if (bloque.type === "tool_use") {
          const contenido = await ejecutarHerramienta(
            bloque.name,
            bloque.input,
            encontrados
          );
          resultados.push({
            type: "tool_result",
            tool_use_id: bloque.id,
            content: contenido,
          });
        }
      }

      mensajes.push({ role: "user", content: resultados });

      respuesta = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 700,
        temperature: 0.3,
        system,
        messages: mensajes,
        tools: HERRAMIENTAS,
      });
    }

    const texto = aTextoPlano(
      respuesta.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim()
    );

    return NextResponse.json({
      reply:
        texto ||
        "Perdoná, no logré generar respuesta. Escribinos por WhatsApp y con gusto te ayudamos.",
      productos: texto ? productosMencionados(texto, encontrados) : [],
    });
  } catch (err) {
    console.error("Error en /api/chat:", err);
    return NextResponse.json(
      { error: "Ocurrió un error procesando tu mensaje. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
