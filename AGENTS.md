# AGENTS.md — Silvi / ART-ES

Instrucciones para agentes de código (Claude Code y compatibles) que trabajen en este repo.
Leé también `PRD.md` para el contexto de producto.

## Qué es esto

Asistente de atención al cliente por chat para **ART-ES** (artesanía salvadoreña).
Responde con datos reales: catálogo en vivo de Shopify + base de conocimiento propia.
Nunca inventa. Next.js 14 (App Router) + TypeScript, desplegado en Vercel.
Pensado como **base de repo reutilizable** ("motor de marca") para varios proyectos.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo en http://localhost:3000
npm run build        # build de producción (DEBE pasar antes de dar por hecho un cambio)
npm run lint         # linter de Next
```

- Node 20 LTS recomendado (mínimo 18.18).
- Requiere `.env.local` con `ANTHROPIC_API_KEY` para correr. Copiá `.env.example`.

## Estructura

```
app/
  layout.tsx          # fuentes (next/font) + metadata
  page.tsx            # LANDING de producto (narrativa + CTAs + widget real)
  chat/page.tsx       # monta el chat (el widget y el link público apuntan aquí)
  admin/page.tsx      # DEMO del panel de personalización (client-side, sin persistencia)
  globals.css         # estilos + paleta de marca (tokens CSS) + landing + admin
  api/chat/route.ts   # backend: validación, rate-limit, prompt, BUCLE DE HERRAMIENTAS
components/
  Chat.tsx            # UI del chat (cliente): estado, envío, sugerencias, "escribiendo"
lib/
  knowledge-base.ts   # ÚNICA fuente de verdad del negocio (datos fijos + artesanos)
  system-prompt.ts    # tono + reglas + persona del artesano + serialización
  shopify.ts          # cliente de catálogo: UCP Catalog MCP (principal, sin token) + Storefront API (respaldo opcional)
PRD.md                # requerimientos de producto
```

## Arquitectura (cómo fluye una consulta)

1. `Chat.tsx` envía el historial a `POST /api/chat`.
2. `route.ts` valida, aplica rate-limit y arma el system prompt con `getSystemPrompt()`.
3. Llama al modelo con la herramienta `buscar_productos`.
4. Si `stop_reason === "tool_use"`, ejecuta `buscarProductos()` (Shopify) y devuelve `tool_result`.
5. El modelo redacta la respuesta final; se devuelve `{ reply }` al cliente.

El bucle de herramientas está en `route.ts` y se limita a `MAX_VUELTAS_HERRAMIENTA` (3).

## Convenciones

- **TypeScript** en todo; tipar entradas/salidas de las funciones de `lib`.
- **Copy e identificadores de dominio en español** (es la voz del producto y del equipo): nombres como `buscarProductos`, `mensajes`, `cargando`. El código de framework queda en su convención normal.
- Sin dependencias nuevas salvo que sean necesarias; justificá cualquier alta.
- Estilos con las **variables CSS** ya definidas en `globals.css` (paleta añil). No introducir un sistema de estilos paralelo.
- Mantener las respuestas del asistente cortas y en la voz "Silvi" (ver `system-prompt.ts`).

## Reglas críticas (no romper)

1. **Anti-invención es un requisito duro.** El asistente solo responde con datos de Shopify (productos/precios) o de `knowledge-base.ts` (todo lo demás). Cualquier cambio que permita responder de memoria o inventar es un bug. Mantener temperatura baja y las reglas del prompt.
2. **`lib/knowledge-base.ts` es la única fuente de verdad del negocio.** No hardcodear datos de negocio (precios, horarios, contacto) en componentes, prompt ni rutas. Todo entra por ese archivo.
3. **Secretos solo en el servidor.** `ANTHROPIC_API_KEY` y `SHOPIFY_STOREFRONT_TOKEN` nunca se exponen al cliente ni se ponen en código versionado. Nada de llaves en componentes `"use client"`.
4. **Solo APIs públicas de solo lectura para el catálogo.** Fuente principal: UCP Catalog MCP de la tienda (`https://{dominio}/api/ucp/mcp`, sin token); respaldo opcional: Storefront API con token público de lectura. Prohibido usar la Admin API o tokens privados de Shopify en esta app pública. No agregar operaciones de escritura (crear/editar productos, órdenes, clientes) ni de checkout/carrito.
5. **Nada de almacenamiento del navegador** (`localStorage`/`sessionStorage`) para estado del chat: usar estado de React en memoria.
6. **No debilitar los límites de costo** (rate-limit por IP, tope de tokens, tope de historial) sin una razón explícita.
7. **Fijar versiones de API de Shopify.** El respaldo Storefront usa `SHOPIFY_API_VERSION` (default `2026-04`); no usar `unstable` ni release candidates en producción. El cliente UCP tolera ambas formas de respuesta del MCP (`structuredContent` o `content[0].text`).
8. **No subir datos de plantilla como reales.** Los valores de ejemplo en `knowledge-base.ts` deben reemplazarse antes de publicar; no inventar datos "para completar".

## Variables de entorno

| Variable | Requerida | Uso |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sí | Llamadas al modelo (solo servidor) |
| `ANTHROPIC_MODEL` | No | Default `claude-haiku-4-5-20251001`; alternativa `claude-sonnet-5` |
| `SHOPIFY_STORE_DOMAIN` | No | Dominio de la tienda (público o `*.myshopify.com`) — activa catálogo en vivo vía UCP MCP, sin token |
| `UCP_AGENT_PROFILE` | No | URL del perfil UCP del agente; default: perfil de ejemplo de shopify.dev |
| `SHOPIFY_STOREFRONT_TOKEN` | No | Token público de Storefront API — solo como respaldo si UCP falla |
| `SHOPIFY_API_VERSION` | No | Versión del respaldo Storefront; default `2026-04` |

Si falta `SHOPIFY_STORE_DOMAIN`, la app cae automáticamente a los productos de ejemplo.

## Definición de "hecho"

- `npm run build` pasa sin errores de tipos ni de build.
- El cambio no introduce secretos en el cliente ni en el repo.
- Si tocaste comportamiento del asistente, verificaste que sigue admitiendo lo que no sabe (no inventa).
- Los datos de negocio siguen viviendo solo en `knowledge-base.ts`.

## Notas para el agente

- Antes de editar, si el cambio toca conocimiento del negocio, empezá por `lib/knowledge-base.ts`.
- Para probar el flujo de Shopify sin credenciales reales, dejá las variables vacías: el modelo usará los productos de ejemplo y el resto de la lógica corre igual.
- Al crecer el repo se pueden agregar `AGENTS.md` anidados por carpeta; por ahora este archivo raíz es suficiente.
