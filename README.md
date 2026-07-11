# ART-ES · Silvi — Asistente de IA para el negocio

Asistente de atención al cliente para **ART-ES**, tienda de artesanía salvadoreña hecha a mano.
Responde preguntas sobre productos, precios, envíos, pagos y políticas usando **solo** una base
de conocimiento definida por vos — y admite honestamente cuando no sabe algo, sin inventar.

**Reto 1 · Vibecoders League 2.0** — "El asistente que responde por tu negocio".

## Qué lo hace único
- **Anti-invención real:** temperatura baja + reglas estrictas en el prompt. Si el dato no está en la base, Silvi lo admite y pasa el WhatsApp.
- **Tono propio:** Silvi habla en español salvadoreño (voseo), cálida y orgullosa de lo artesanal.
- **Identidad visual con carácter:** paleta de **añil salvadoreño**, lejos del look genérico de IA.
- **Listo para tráfico público:** rate limit por IP y límites de tokens para cuidar tu factura durante la votación.

## Editar el negocio (lo único que tocás)
Políticas, envíos, horarios y contacto viven en **`lib/knowledge-base.ts`**. Cambiá esos datos por
los reales (buscá los comentarios `// ✏️ EDITAR`) y el asistente se actualiza solo.

## Conexión con Shopify (productos y precios en vivo)
Si conectás Shopify, Silvi consulta tu catálogo **en tiempo real** en vez de usar los
productos de ejemplo. Los precios y la disponibilidad siempre estarán al día.

**Configuración (¡sin token!):** solo poné en tus variables de entorno:
- `SHOPIFY_STORE_DOMAIN` = el dominio de tu tienda (sirve el público, ej. `mitienda.com`,
  o el interno `mitienda.myshopify.com`).

Usa el **UCP Catalog MCP** de la tienda (`https://tu-dominio/api/ucp/mcp`), un endpoint
público de **solo lectura** que Shopify expone para agentes de IA — no requiere crear
apps ni tokens. Docs: https://shopify.dev/docs/agents/catalog/storefront-catalog

Cómo funciona: cuando alguien pregunta por productos/precios, el modelo llama a la
herramienta `buscar_productos`, que consulta el catálogo en vivo y devuelve datos reales
(título, descripción, precio, disponibilidad y enlace) para responder.

**Opcional (respaldo):** si además configurás `SHOPIFY_STOREFRONT_TOKEN`, la app usa la
Storefront API (GraphQL) como respaldo automático cuando el UCP MCP no responde.
El token de Storefront es público y de solo lectura, seguro para producción.

## Correr en local
```bash
npm install
cp .env.example .env.local   # y poné tu ANTHROPIC_API_KEY real
npm run dev
```
Abrí http://localhost:3000 — la raíz es la **landing** del producto; el chat vive
en **/chat** y la demo del panel de personalización en **/admin**.

## Desplegar en Vercel (link público para votar)
1. Subí el proyecto a un repo de GitHub.
2. En https://vercel.com → **Add New → Project** → importá el repo.
3. En **Environment Variables** agregá:
   - `ANTHROPIC_API_KEY` = tu llave real
   - *(opcional)* `ANTHROPIC_MODEL` = `claude-sonnet-5` para mayor calidad
   - *(opcional, para catálogo en vivo)* `SHOPIFY_STORE_DOMAIN` (sin token; ver sección de Shopify)
4. **Deploy**. Vercel te da una URL pública `https://tu-proyecto.vercel.app` → ese es tu link para el reto.

## Tu llave de API
La conseguís en https://console.anthropic.com → Settings → API Keys.
Nunca la subas al repo: va solo en `.env.local` (local) y en las variables de entorno de Vercel (producción).

## Cambiar de modelo
Por defecto usa **Haiku** (rápido y económico, perfecto para FAQ).
Para respuestas más ricas, poné `ANTHROPIC_MODEL=claude-sonnet-5`.
