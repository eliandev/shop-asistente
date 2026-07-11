/**
 * ============================================================================
 *  CLIENTE SHOPIFY — Catálogo por tienda vía UCP Catalog MCP (solo lectura)
 * ============================================================================
 *  Silvi usa esto para consultar productos, precios y disponibilidad EN VIVO.
 *
 *  Fuente principal: UCP Catalog MCP de la tienda
 *    POST https://{dominio}/api/ucp/mcp  (herramienta "search_catalog")
 *    - NO requiere token de la tienda: solo el dominio público.
 *    - Docs: https://shopify.dev/docs/agents/catalog/storefront-catalog
 *
 *  Respaldo opcional: Storefront API (GraphQL) si UCP falla y hay token.
 *
 *  Variables de entorno (ver .env.example):
 *    - SHOPIFY_STORE_DOMAIN     requerida para catálogo en vivo.
 *                               Sirve el dominio público (mitienda.com) o el
 *                               interno (mitienda.myshopify.com).
 *    - UCP_AGENT_PROFILE        opcional; URL del perfil UCP del agente.
 *    - SHOPIFY_STOREFRONT_TOKEN opcional; activa el respaldo por Storefront API.
 *    - SHOPIFY_API_VERSION      opcional; versión del respaldo (default 2026-04).
 * ============================================================================
 */

const DOMINIO = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";

/**
 * Perfil UCP que identifica a este agente ante la tienda. Para producción se
 * recomienda publicar un perfil propio (puede ser un JSON estático servido por
 * esta misma app) y ponerlo en UCP_AGENT_PROFILE.
 */
const PERFIL_AGENTE =
  process.env.UCP_AGENT_PROFILE ||
  "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";

/** ¿Está el catálogo en vivo configurado? (solo hace falta el dominio) */
export function shopifyConfigurado(): boolean {
  return Boolean(DOMINIO);
}

export interface ProductoShopify {
  titulo: string;
  descripcion: string;
  precioDesde: string;
  disponible: boolean;
  url: string | null;
  /** miniatura del producto (CDN de Shopify, ya con width para thumbnail) */
  imagen: string | null;
  variantes: { titulo: string; precio: string; disponible: boolean }[];
}

/** Pide al CDN de Shopify una versión pequeña de la imagen (thumbnail). */
function miniatura(url: string | null | undefined, ancho = 240): string | null {
  if (!url) return null;
  return url + (url.includes("?") ? "&" : "?") + `width=${ancho}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Fuente principal: UCP Catalog MCP
 * ──────────────────────────────────────────────────────────────────────────── */

/** Precio UCP: viene en unidades menores (13999 = 139.99). */
function formatearPrecioUcp(p: { amount: number; currency: string }): string {
  return `${(p.amount / 100).toFixed(2)} ${p.currency}`;
}

/** Quita etiquetas HTML y recorta la descripción para el prompt. */
function limpiarDescripcion(html: string, max = 300): string {
  const texto = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

async function buscarPorUcp(consulta: string, n: number): Promise<ProductoShopify[]> {
  // Sin `query`, el endpoint devuelve el catálogo general (browse) — útil para
  // "¿qué venden?". Con `query`, hace búsqueda semántica estricta.
  const catalogo: Record<string, unknown> = { pagination: { limit: n } };
  if (consulta.trim()) catalogo.query = consulta.trim();

  const res = await fetch(`https://${DOMINIO}/api/ucp/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      id: 1,
      params: {
        name: "search_catalog",
        arguments: {
          meta: { "ucp-agent": { profile: PERFIL_AGENTE } },
          catalog: catalogo,
        },
      },
    }),
    cache: "no-store", // precios y stock siempre frescos
  });

  if (!res.ok) {
    throw new Error(`UCP MCP respondió ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Error UCP MCP: ${JSON.stringify(json.error)}`);
  }

  // El contenido puede venir como structuredContent o como texto JSON.
  const inner =
    json?.result?.structuredContent ??
    JSON.parse(json?.result?.content?.[0]?.text ?? "{}");

  const productos: any[] = inner?.products ?? [];

  return productos.map((p: any): ProductoShopify => {
    const variantes = (p.variants ?? []).slice(0, 5).map((v: any) => ({
      titulo: String(v.title ?? ""),
      precio: formatearPrecioUcp(v.price ?? { amount: 0, currency: "" }),
      disponible: Boolean(v.availability?.available),
    }));
    const primeraImagen =
      (p.media ?? []).find((m: any) => m?.type === "image")?.url ??
      (p.variants?.[0]?.media ?? []).find((m: any) => m?.type === "image")?.url ??
      null;
    return {
      titulo: String(p.title ?? ""),
      descripcion: limpiarDescripcion(p.description?.html ?? ""),
      precioDesde: formatearPrecioUcp(
        p.price_range?.min ?? { amount: 0, currency: "" }
      ),
      disponible: (p.variants ?? []).some((v: any) => v.availability?.available),
      url: p.url ?? null,
      imagen: miniatura(primeraImagen),
      variantes,
    };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Respaldo: Storefront API (GraphQL) — solo si hay token configurado
 * ──────────────────────────────────────────────────────────────────────────── */

const QUERY = /* GraphQL */ `
  query BuscarProductos($q: String!, $n: Int!) {
    products(first: $n, query: $q) {
      edges {
        node {
          title
          description(truncateAt: 300)
          handle
          onlineStoreUrl
          availableForSale
          featuredImage { url }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 5) {
            edges {
              node {
                title
                availableForSale
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
  }
`;

function formatearPrecioStorefront(p: { amount: string; currencyCode: string }): string {
  const monto = Number(p.amount);
  const valor = Number.isFinite(monto) ? monto.toFixed(2) : p.amount;
  return `${valor} ${p.currencyCode}`;
}

async function buscarPorStorefront(
  consulta: string,
  n: number
): Promise<ProductoShopify[]> {
  const res = await fetch(`https://${DOMINIO}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query: QUERY, variables: { q: consulta, n } }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify respondió ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Error GraphQL: ${JSON.stringify(json.errors)}`);
  }

  const edges = json?.data?.products?.edges ?? [];

  return edges.map((e: any): ProductoShopify => {
    const nodo = e.node;
    return {
      titulo: nodo.title,
      descripcion: (nodo.description || "").trim(),
      precioDesde: formatearPrecioStorefront(nodo.priceRange.minVariantPrice),
      disponible: Boolean(nodo.availableForSale),
      url: nodo.onlineStoreUrl ?? null,
      imagen: miniatura(nodo.featuredImage?.url ?? null),
      variantes: (nodo.variants?.edges ?? []).map((v: any) => ({
        titulo: v.node.title,
        precio: formatearPrecioStorefront(v.node.price),
        disponible: Boolean(v.node.availableForSale),
      })),
    };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * API pública del módulo
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Busca productos en la tienda. `consulta` vacía devuelve varios productos
 * generales. Usa UCP Catalog MCP (sin token); si falla y hay token de
 * Storefront, reintenta por GraphQL. Lanza error si ninguna fuente responde
 * (el llamador lo maneja).
 */
export async function buscarProductos(
  consulta: string,
  n = 5
): Promise<ProductoShopify[]> {
  if (!shopifyConfigurado()) {
    throw new Error("Shopify no está configurado.");
  }

  try {
    return await buscarPorUcp(consulta, n);
  } catch (errorUcp) {
    if (!TOKEN) throw errorUcp;
    console.warn("UCP MCP falló; usando respaldo Storefront API:", errorUcp);
    return buscarPorStorefront(consulta, n);
  }
}
