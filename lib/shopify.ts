/**
 * ============================================================================
 *  CLIENTE SHOPIFY — Storefront API (solo lectura, datos públicos)
 * ============================================================================
 *  Silvi usa esto para consultar productos, precios y disponibilidad EN VIVO.
 *  Necesita dos variables de entorno (ver .env.example):
 *    - SHOPIFY_STORE_DOMAIN     ej: artes.myshopify.com
 *    - SHOPIFY_STOREFRONT_TOKEN token público de Storefront API
 *  Opcional:
 *    - SHOPIFY_API_VERSION      por defecto 2026-04 (estable)
 * ============================================================================
 */

const DOMINIO = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";

/** ¿Están las credenciales de Shopify configuradas? */
export function shopifyConfigurado(): boolean {
  return Boolean(DOMINIO && TOKEN);
}

export interface ProductoShopify {
  titulo: string;
  descripcion: string;
  precioDesde: string;
  disponible: boolean;
  url: string | null;
  variantes: { titulo: string; precio: string; disponible: boolean }[];
}

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

function formatearPrecio(p: { amount: string; currencyCode: string }): string {
  const monto = Number(p.amount);
  const valor = Number.isFinite(monto) ? monto.toFixed(2) : p.amount;
  return `${valor} ${p.currencyCode}`;
}

/**
 * Busca productos en la tienda Shopify. `consulta` vacía devuelve varios
 * productos generales. Lanza error si la API falla (el llamador lo maneja).
 */
export async function buscarProductos(
  consulta: string,
  n = 5
): Promise<ProductoShopify[]> {
  if (!shopifyConfigurado()) {
    throw new Error("Shopify no está configurado.");
  }

  const res = await fetch(`https://${DOMINIO}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query: QUERY, variables: { q: consulta, n } }),
    cache: "no-store", // precios y stock siempre frescos
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
      precioDesde: formatearPrecio(nodo.priceRange.minVariantPrice),
      disponible: Boolean(nodo.availableForSale),
      url: nodo.onlineStoreUrl ?? null,
      variantes: (nodo.variants?.edges ?? []).map((v: any) => ({
        titulo: v.node.title,
        precio: formatearPrecio(v.node.price),
        disponible: Boolean(v.node.availableForSale),
      })),
    };
  });
}
