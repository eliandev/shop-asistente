# Bitácora de desarrollo — Asistente de IA para el negocio

> Documento vivo. Registra el plan por fases, las decisiones tomadas y el estado
> real del proyecto hasta llegar a producción. Se actualiza al cerrar cada fase.

**Proyecto base:** "Silvi / ART-ES" — asistente de atención al cliente por chat
(Next.js 14 + TypeScript + SDK de Anthropic + Shopify Storefront API).
Diseñado como **motor de marca reutilizable**: se re-marca cambiando la base de
conocimiento, la voz del asistente y la paleta visual.

---

## Plan de fases

| Fase | Nombre | Estado | Depende de |
|------|--------|--------|------------|
| 0 | Preparación del entorno | ✅ Completada (2026-07-10) | — |
| 1 | Marca y datos reales del negocio | ✅ Completada (2026-07-10) — 4 confirmaciones menores abiertas | — |
| 2 | Integración Shopify en vivo | ✅ Completada (2026-07-10) — pendiente solo el test end-to-end con API key | — |
| 3 | Branding UI (assets y paleta) | ⬜ Pendiente | Assets del usuario |
| 4 | Calidad y endurecimiento (QA) | ⬜ Pendiente | Fases 1–3 |
| 5 | Despliegue a producción (Vercel) | ⬜ Pendiente | Fase 4 |

---

## Fase 0 — Preparación del entorno

**Objetivo:** dejar el proyecto corriendo en local, con build limpio y control de versiones.

**Checklist**
- [x] `npm install` sin errores
- [x] `npm run build` pasa sin errores de tipos ni de build (Next.js 14.2.35; ruta `/` estática, `/api/chat` dinámica)
- [x] Repo git inicializado con commit inicial (`cfb9ed4`, rama `main`)
- [x] `.env.local` creado a partir de `.env.example` — ⚠️ falta poner la `ANTHROPIC_API_KEY` real (la pone el usuario, nunca se versiona)
- [x] Bitácora de desarrollo creada (este documento)

**Hallazgos del análisis inicial**
- El proyecto llegó sin `node_modules`, sin repo git y con **datos de plantilla**
  en `lib/knowledge-base.ts` (WhatsApp `+503 0000-0000`, dominios `example.com`).
- El rate-limit por IP vive en memoria (`Map`): suficiente para el alcance actual,
  pero en serverless cada instancia tiene su propio contador. Se documenta como
  limitación conocida; si el tráfico lo exige, migrar a un store compartido (KV).
- La tienda Shopify conectada a la sesión de desarrollo es **caterpillarpa.com
  ("Panamá", Shopify Plus, USD, Empresas ADOC)** — no existe tienda "ART-ES".
  ➜ Pendiente confirmar con el dueño del proyecto cuál es la marca objetivo
  de producción (ver Fase 1).

---

## Fase 1 — Marca y datos reales del negocio

**Objetivo:** que el asistente responda con información 100% real. Cero datos inventados
o de plantilla en producción.

**Decisión (2026-07-10):** la marca objetivo confirmada es **ART-ES** (reto
Vibecoders League 2.0). Es un **emprendimiento real del dueño del proyecto**,
con tienda Shopify funcionando en **art-es.shop**. La tienda caterpillarpa.com
conectada a la sesión NO es parte de este proyecto.

**Datos reales cargados (2026-07-10)** en `lib/knowledge-base.ts`:
- Contacto: WhatsApp +503 7210 0755 (wa.me/50372100755), IG @artes.shop.sv,
  FB artes.shop.sv, TikTok @artes.shop, correo artessv2024@gmail.com, web art-es.shop.
- Horarios: L–D 8:00–22:00 por WhatsApp y redes; sin sucursal física.
- Envíos: solo El Salvador; estándar $3.50 a domicilio (varía por zona);
  procesamiento 1–3 días hábiles.
- Pagos: USD; checkout en línea (tarjeta) + Apple Pay / Google Pay / Shop Pay.
- Políticas: devoluciones 30 días (sin uso, etiquetas, empaque, comprobante);
  reembolso al método original ≤10 días hábiles; excepciones estándar;
  garantía de 15 días.
- Productos de respaldo: reemplazados por 5 productos REALES del catálogo vivo
  (bolsos Elena/Aracely/crochet, Cartera Rubí, set de cojines de Nahuizalco).
- Identidad enriquecida con datos verificables del catálogo: talleres
  "Eseoese by Silvi" (San Salvador) y "Artesanías en Nahuizalco".

**Decisiones editoriales (revisables):**
- La **dirección física NO se publica** en el asistente (parece residencial);
  quedó comentada en `knowledge-base.ts` por si se quiere activar.
- El correo admin/reembolsos (geordymemdoza@gmail.com) se mantiene FUERA del
  asistente público; el canal visible es artessv2024@gmail.com.
- El derecho de desistimiento UE (14 días) se omitió: solo se envía a El Salvador.

**Pendientes de confirmar por el dueño (no bloquean):**
- [ ] Método de envío en $0.00 detectado en la config de Shopify: ¿es promo
      real (envío gratis condicional) o error de configuración? No se anuncia
      hasta confirmar.
- [ ] Sellos exactos de tarjetas aceptadas (Admin → Configuración → Pagos).
- [ ] Relación entre "garantía de 15 días" (banner del sitio) y la política de
      devolución de 30 días: hoy Silvi comunica ambas tal cual.
- [ ] Texto de identidad de marca (queEs/propuesta/origen): redactado a partir
      del catálogo real; validar que refleje la historia que quieren contar.

**Trabajo**
- Reemplazar todos los valores `// ✏️ EDITAR` de `lib/knowledge-base.ts`.
- Ajustar la voz del asistente en `lib/system-prompt.ts` (nombre, país, registro:
  voseo salvadoreño ↔ español panameño/neutro, según la marca).
- Actualizar metadata (`app/layout.tsx`) y copy inicial del chat (`components/Chat.tsx`).

**Regla de oro (de AGENTS.md):** los datos del negocio viven SOLO en
`lib/knowledge-base.ts`. Nada hardcodeado en componentes ni en el prompt.

---

## Fase 2 — Integración Shopify en vivo

**Objetivo:** que productos, precios y disponibilidad salgan del catálogo real.

**Cambio de enfoque (2026-07-10, propuesto por el dueño del proyecto):** se migró
de la Storefront API (GraphQL + token) al **UCP Catalog MCP por tienda**
(`https://{dominio}/api/ucp/mcp`, herramienta `search_catalog`).
Docs: https://shopify.dev/docs/agents/catalog/storefront-catalog

**Por qué**
- **Sin token:** solo se necesita el dominio de la tienda. Ya no hay que crear
  una app en el Admin ni generar el Storefront token → configurar cualquier
  tienda toma segundos (clave para el concepto de "motor de marca").
- Endpoint público de **solo lectura**, diseñado por Shopify específicamente
  para agentes de IA. Funciona con el dominio público (ej. `mitienda.com`),
  no solo con el `*.myshopify.com`.
- **Verificado empíricamente** contra una tienda Shopify Plus real: devuelve
  título, descripción (HTML), precio (en unidades menores: 13999 = $139.99),
  disponibilidad por variante y URL del producto.
- Se descartó el **Global Catalog** (catalog.shopify.com): ese busca entre
  TODAS las tiendas de Shopify; nuestro caso es una sola tienda.

**Diseño**
- `lib/shopify.ts` mantiene la misma interfaz (`buscarProductos`,
  `shopifyConfigurado`, `ProductoShopify`) → `route.ts` y el prompt no cambian.
- `shopifyConfigurado()` ahora solo exige `SHOPIFY_STORE_DOMAIN`.
- La Storefront API (GraphQL) queda como **respaldo automático** si el UCP MCP
  falla Y hay `SHOPIFY_STOREFRONT_TOKEN` configurado. Opcional.
- Identificación del agente: header `meta.ucp-agent.profile` con perfil UCP;
  configurable vía `UCP_AGENT_PROFILE` (default: perfil de ejemplo de
  shopify.dev; para producción se recomienda publicar perfil propio).

**Trabajo restante**
- [x] Configurar `SHOPIFY_STORE_DOMAIN` con la tienda real de ART-ES:
      **art-es.shop** (dominio principal; también responden www.art-es.shop,
      hxvw1e-vn.myshopify.com y artes-sv.myshopify.com). Configurado en `.env.local`.
- [x] Probar el cliente UCP contra el catálogo real de ART-ES: 10 productos
      en vivo (bolsos tejidos $12–$35, cartera $45, set de cojines $17),
      disponibilidad correcta (detecta 1 agotado).
- [x] Ajuste por hallazgo: la búsqueda UCP es semántica pero estricta
      (consulta vacía con `query` presente devolvía 0). Ahora una consulta
      vacía OMITE `query` → el endpoint devuelve el catálogo general (browse),
      ideal para "¿qué venden?". Descripción de la herramienta actualizada
      para que el modelo reintente con browse si un término no da resultados.
- [x] Verificar degradación elegante: sin dominio, la app usa productos de ejemplo.
- [ ] Probar `buscar_productos` end-to-end con el chat (bloqueado por API key).

---

## Fase 3 — Branding UI (assets y paleta)

**Objetivo:** identidad visual de la marca final aplicada a la UI del chat.

**Entradas necesarias (las provee el usuario)**
- Paleta de colores (idealmente con roles: fondo, superficie, primario, acento, texto).
- Logo / avatar del asistente (SVG o PNG @2x).
- Tipografías (si difieren de Fraunces + Karla actuales).

**Trabajo**
- Actualizar tokens CSS en `app/globals.css` (el sistema ya usa variables CSS; no se
  introduce ningún framework de estilos nuevo).
- Reemplazar avatar/branding en `components/Chat.tsx` (encabezado, saludo, sugerencias, pie).
- Verificar contraste AA, responsive móvil/escritorio y `prefers-reduced-motion`.

**Recomendación de assets:** logo/avatar cuadrado mínimo 80×80 px (se muestra ~40 px,
@2x para retina), SVG preferido; si hay imagen de fondo/hero, versión móvil ~800 px
y escritorio ~1600 px de ancho, WebP.

---

## Fase 4 — Calidad y endurecimiento

**Objetivo:** comportamiento correcto, accesible y con costos controlados antes de publicar.

**Checklist de QA**
- [ ] Responde bien ≥10 preguntas cuya respuesta está en la base de conocimiento
- [ ] Ante preguntas sin respuesta disponible: admite que no sabe y deriva al canal humano (0 invenciones)
- [ ] Preguntas fuera del negocio: reconduce con amabilidad
- [ ] Con Shopify: precios/disponibilidad coinciden con el Admin real
- [ ] Sin Shopify: usa productos de ejemplo sin romperse
- [ ] Rate-limit responde 429 con mensaje amable
- [ ] Accesibilidad: foco visible, `aria-live`, reduced-motion, contraste AA
- [ ] Móvil (375px) y escritorio se ven correctos
- [ ] `npm run build` limpio

---

## Fase 5 — Despliegue a producción

**Objetivo:** URL pública estable.

**Flujo de release (siempre):** rama → commit → push a GitHub → preview deploy de
Vercel → QA sobre el preview → merge a `main` → producción.

**Variables de entorno en Vercel**
| Variable | Requerida | Notas |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sí | Solo servidor |
| `ANTHROPIC_MODEL` | No | Default Haiku; `claude-sonnet-5` para más calidad |
| `SHOPIFY_STORE_DOMAIN` | No | Activa catálogo en vivo |
| `SHOPIFY_STOREFRONT_TOKEN` | No | Solo lectura |
| `SHOPIFY_API_VERSION` | No | Fijada, default `2026-04` |

**Checklist pre-lanzamiento**
- [ ] Cero datos de plantilla en `knowledge-base.ts`
- [ ] Ningún secreto en el repo (`.env*` en `.gitignore`)
- [ ] QA de Fase 4 completo sobre el preview deploy
- [ ] URL pública verificada en móvil y escritorio

---

## Backlog v2 — Motor de marca / multi-tienda

**Visión (del dueño del proyecto):** que cualquier otra tienda Shopify pueda
conectarse fácilmente — ese es el "plus" diferencial del proyecto.

**Lo que ya lo habilita hoy (v1):** conectar el catálogo de cualquier tienda es
solo cambiar `SHOPIFY_STORE_DOMAIN` (sin tokens, gracias al UCP Catalog MCP).
El modelo v1 es **1 despliegue = 1 marca**: se clona el repo y se personaliza.

**Puntos de personalización actuales (a consolidar):**
1. `SHOPIFY_STORE_DOMAIN` — catálogo en vivo (env var, ya resuelto).
2. `lib/knowledge-base.ts` — datos del negocio (envíos, pagos, políticas, contacto).
3. `lib/system-prompt.ts` — nombre y voz del asistente (voseo, registro, país).
4. `app/globals.css` + `components/Chat.tsx` — paleta, tipografías, copy visual.

**Mejora planificada dentro de v1 (Fase 3):** al aplicar el branding, consolidar
la identidad de marca (nombre del asistente, saludo, sugerencias, colores como
tokens) para que re-marcar sea tocar la menor cantidad de archivos posible.

**Ideas v2 (post-reto, no bloquean producción):**
- **Multi-tenant real:** un solo despliegue que sirva varias marcas, resolviendo
  la configuración por dominio/subdominio (ej. `asistente.marca1.com` →
  config de marca 1). Requiere mover knowledge-base a datos por tenant.
- **Auto-branding desde Shopify:** Shopify expone la identidad de marca de la
  tienda (logo, colores, slogan — `shop.brand` en Storefront API); se podría
  pre-poblar la paleta y el avatar automáticamente al conectar una tienda.
- **Onboarding asistido:** un formulario/wizard que genere `knowledge-base.ts`
  para el dueño de la nueva tienda en lugar de editar código.

## Registro de decisiones

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-07-10 | Trabajo organizado en 6 fases documentadas en esta bitácora | Pedido del dueño del proyecto: desarrollo paso a paso y documentado |
| 2026-07-10 | Se mantiene el stack actual (Next.js 14, CSS con variables, sin dependencias nuevas) | Convención de AGENTS.md; el proyecto ya está bien estructurado |
| 2026-07-10 | Rate-limit en memoria se acepta para v1 | Alcance actual; documentado como limitación conocida |
| 2026-07-10 | Marca de producción: **ART-ES** (no se re-marca a la tienda Caterpillar Panamá conectada a la sesión) | Confirmado por el dueño del proyecto |
| 2026-07-10 | `ANTHROPIC_API_KEY` pendiente de crear | El usuario la generará en console.anthropic.com; el desarrollo que no requiere probar el chat avanza igual |
| 2026-07-10 | Catálogo en vivo migrado a **UCP Catalog MCP por tienda** (sin token); Storefront API queda solo como respaldo opcional | Propuesta del dueño del proyecto; simplifica la conexión de cualquier tienda y está verificado contra una tienda real |
