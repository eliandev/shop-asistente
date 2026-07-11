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
| 3 | Branding UI (assets y paleta) | ✅ Completada (2026-07-10) | — |
| 4 | Calidad y endurecimiento (QA) | 🟡 En curso (QA funcional inicial pasado) | — |
| 5 | Despliegue a producción (Vercel) | ⬜ Pendiente | Fase 4 + decisión GitHub/Vercel |
| 6 | Widget flotante embebible | ✅ Completada (2026-07-11) — URL de prod pendiente | — |
| 6.5 | Artesanos por sesión (Silvi / Don José) | ✅ Completada (2026-07-11) | — |
| 7 | Admin de personalización multi-tienda | ⬜ Planificada | Fase 5 + decisiones de almacenamiento |

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

**Ejecución (2026-07-10):**
- Paleta oficial aplicada como tokens CSS en `globals.css`:
  `#0047AB` azul cobalto (primario), `#F5EEE3` crema (fondo), `#FFFFFF`
  (superficie), `#1E1E1E` (tinta). Derivados documentados en el propio CSS
  (tonos de azul para hover/gradiente, línea cálida) y acentos puntuales del
  logo (amarillo para foco, verde para estado "en línea").
- Logo real integrado: `public/logo.png` (avatar del encabezado) y
  `app/icon.png` (favicon automático de Next). `themeColor` #0047AB.
- Contraste verificado: azul cobalto sobre blanco ≈ 7.4:1 (AA/AAA).
- Mejoras de calidad detectadas en QA visual y aplicadas:
  - El modelo a veces emitía Markdown (asteriscos visibles): se agregó regla
    al prompt + limpieza server-side (`aTextoPlano` en `route.ts`).
  - URLs en las respuestas ahora son enlaces clickeables (`conEnlaces` en
    `Chat.tsx`): wa.me y links de producto abren en pestaña nueva.

## Fase 4 — QA funcional inicial (2026-07-10, con API key y catálogo vivo)

| Prueba | Resultado |
|---|---|
| "¿Qué venden?" | ✅ Llama al catálogo vivo (mencionó productos que NO están en el respaldo) y resume con precios reales |
| Envíos a Guatemala / pagos en quetzales | ✅ Admite limitación (solo SV, USD), deriva a WhatsApp real, no inventa |
| Trampa: "vi 50% de descuento en Instagram" | ✅ NO confirma el descuento inexistente; deriva a WhatsApp |
| Precio de producto específico (Cartera Rubí) | ✅ $45.00 USD del catálogo vivo + URL real del producto |
| Voseo salvadoreño y tono | ✅ Consistente ("escribinos", "al toque", "no te desanimés") |
| Enlaces clickeables | ✅ Producto y wa.me como `<a>` con estilo de marca |

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

## Fase 6 — Widget flotante embebible (2026-07-11)

**Pedido del dueño:** el asistente debe vivir en (a) un link público y (b) una
burbuja flotante insertable en la tienda Shopify vía script.

**Implementado y verificado en local:**
- `public/widget.js`: script auto-contenido que inyecta botón flotante + panel
  iframe con el chat. Personalizable por atributos (`data-color`,
  `data-posicion`, `data-etiqueta`). Carga perezosa (el iframe solo carga al
  primer clic → no afecta velocidad de la tienda). Accesible (aria-expanded,
  focus-visible). Empuja eventos `silvi_widget_abierto/cerrado` a dataLayer (GA4).
- `public/widget-demo.html`: página de prueba local.
- `docs/WIDGET.md`: guía de inserción en Shopify. Vía recomendada: sección
  **Custom Liquid** en el grupo Footer del Theme Editor (aparece en todas las
  páginas, editable por no-técnicos, NO toca theme.liquid). Vía alternativa
  (theme.liquid) documentada con advertencia de riesgo + flujo de tema
  duplicado/preview.
- Avatar humano de Silvi (`public/avatar-silvi.png`, 160px) junto al indicador
  de "escribiendo".

**Pendiente:** reemplazar `TU-APP.vercel.app` por la URL real tras la Fase 5.

## Fase 6.5 — Artesanos por sesión (2026-07-11)

**Pedido del dueño:** que atienda un artesano distinto según lo que el cliente
está viendo, fijo por sesión para no complicarlo. Los artesanos son personas
REALES: Silvi (Eseoese by Silvi, San Salvador — bolsos tejidos/crochet y
carteras) y don José (Nahuizalco — bolsos de mecate, cojines bordados y arte
en madera).

**Diseño implementado ("voz del taller"):**
- Roster `artesanos` en `knowledge-base.ts` (id, taller, especialidad, bio,
  avatar, saludo, alias) + `resolverArtesano()` que mapea vendor/alias → artesano.
- Selección al abrir el chat vía `?artesano=` (el widget la pasa con
  `data-artesano`, en Shopify `{{ product.vendor }}`); si no hay match,
  atiende el default (Silvi). Fija toda la sesión.
- **Framing de autenticidad:** el asistente es "la voz del taller de X" — habla
  en nombre del taller, cuenta la historia del artesano, pero si le preguntan
  directamente NO afirma ser la persona física: aclara que es el asistente del
  taller y ofrece el WhatsApp para hablar con el artesano real.
- Si una pieza es de otro taller, la presenta dando crédito ("esa la hace
  Silvi, nuestra compañera...") sin cambiar de persona a mitad de chat.
- UI dinámica: subtítulo del encabezado, etiqueta de burbujas, saludo y avatar
  del indicador de escritura cambian según el artesano.

**Verificado en navegador (2026-07-11):**
- `/` → atiende Taller de Silvi (default). `/?artesano=nahuizalco` → Don José.
- Pregunta cruzada al taller de José por el bolso de crochet: dio crédito a
  Silvi correctamente Y aclaró con calidez que es el asistente del taller (no
  don José en persona), ofreciendo el WhatsApp. Comportamiento exacto al diseño.

**Requisito operativo en Shopify:** el campo **Vendor** de cada producto debe
tener el taller correcto ("Eseoese by Silvi" / "Artesanías en Nahuizalco") para
que el widget detecte al artesano en páginas de producto.

### Tarjetas de producto con foto (2026-07-11)

**Pedido del dueño:** cuando el asistente mencione un producto, mostrar una
foto pequeña del mismo.

**Implementado (verificado en navegador):**
- `ProductoShopify.imagen`: primera imagen del producto desde el UCP MCP
  (`media[0].url`, fallback a la de la primera variante) pedida como
  miniatura al CDN de Shopify (`?width=240`). El respaldo Storefront usa
  `featuredImage`.
- El modelo NO recibe las URLs de imagen (ahorro de tokens): el servidor
  guarda los resultados de la herramienta y, tras la respuesta final,
  selecciona los productos **realmente mencionados** en el texto (matching
  por palabras distintivas del título, normalizando acentos) en el orden en
  que aparecen, máx. 5, y los devuelve como `productos` junto a `reply`.
- El chat renderiza tarjetas clickeables (foto 52px, nombre, precio) bajo la
  burbuja, con hover/foco accesibles. Si el matching no encuentra menciones,
  no se muestra nada — nunca tarjetas de productos no mencionados.

## Fase 7 — Admin de personalización multi-tienda (planificada)

**Pedido del dueño:** panel admin para personalizar UI, avatar y personalidad
por tienda, y conectar el catálogo (dominio → UCP MCP) sin tocar código.

**Diseño propuesto (a validar):**
- `/admin` protegido con contraseña (`ADMIN_PASSWORD` en env).
- Config de marca (colores, logo/avatar por URL, nombre del asistente, saludo,
  sugerencias, voz/país, dominio Shopify) guardada en un **KV** (Vercel KV /
  Upstash Redis, gratis en tier inicial) en vez de archivos, porque el
  filesystem de Vercel es efímero.
- El chat y el system prompt leen la config del KV con fallback a los archivos
  actuales (knowledge-base.ts sigue siendo la fuente de datos de negocio).
- Multi-tienda: una config por `tiendaId`; el widget y el link pasan
  `?tienda=...` para elegirla.

**Decisiones abiertas:** proveedor de KV, alcance v1 del admin (¿solo branding
y catálogo, o también knowledge base editable?).

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
