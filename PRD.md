# PRD — Silvi Assistants

**Versión:** 2.0 · **Estado:** en producción · **Dueño:** Elian
**Producción:** https://silvi-assistants.vercel.app · **Repo:** github.com/eliandev/shop-asistente
**Contexto:** Vibecoders League 2.0 — Reto 1 ("El asistente que responde por tu
negocio") y Reto 3 ("La forma más creativa de capturar leads").

> **Historial de versiones**
> - **v1.0** — asistente de chat único para ART-ES (una tienda, Storefront API).
> - **v2.0** — producto generalizado: cualquier marca crea su asistente; catálogo
>   por UCP MCP (sin token); equipo de asistentes por proveedor con avatares;
>   widget embebible + monetización; captura de leads (Firestore + n8n).
>   ART-ES pasa a ser la **demo con tienda real**.

---

## 1. Resumen

**Silvi Assistants** es una plataforma donde cualquier emprendimiento crea, en
minutos y sin código, un asistente de IA que responde por su negocio: consulta
su catálogo de Shopify **en vivo**, responde con su tono y sus políticas, y
**nunca inventa** (si no sabe, lo admite y deriva al canal humano).

El asistente insignia y demo con datos reales es **Silvi**, de
[ART-ES](https://art-es.shop) — emprendimiento salvadoreño de artesanía hecha a
mano. La configuración de cada asistente **viaja en su propio link** (`?c=`) y
en el snippet del widget: no hay base de datos de asistentes ("el link es el
asistente"). Lo único que se persiste son los **leads** (Firestore).

## 2. Problema y oportunidad

Los negocios pequeños pierden ventas respondiendo tarde las mismas preguntas
(precios, stock, envíos, pagos). Un asistente 24/7 con datos reales reduce
fricción y encamina la compra — pero montar uno exige tiempo, código y
credenciales. Silvi Assistants elimina esa barrera: **catálogo sin tokens, cero
código, gratis para empezar**, y con un intercambio de valor honesto para
capturar el lead (dar la herramienta funcionando antes de pedir el correo).

## 3. Usuarios

- **Creador de marca:** dueño de una tienda Shopify que arma su asistente en `/crear`.
- **Cliente final:** quien chatea con un asistente (por link o por el widget en la tienda).
- **Operador (Elian):** mantiene ART-ES (demo) y la plataforma; recibe y trabaja los leads.
- **Jurado y comunidad Vibecoders:** prueban y votan.

## 4. Objetivos y métricas de éxito

- Cualquiera crea un asistente funcional en ≤ 2 minutos, sin cuenta.
- El asistente responde correcto lo que está en su conocimiento/catálogo y
  **admite** lo que no (0 datos inventados).
- Conectar el catálogo de una tienda = escribir su dominio (sin tokens).
- Capturar leads en el pico de valor, persistidos con dedupe.
- Costo controlado durante tráfico público de votación.

## 5. Alcance (v2.0)

**Dentro**
- **Landing** de producto (`/`) con identidad propia (negro + lima).
- **Creador** (`/crear`): wizard por pasos con vista previa en vivo; genera link + widget.
- **Chat** (`/chat`): ART-ES por defecto, o asistente personalizado vía `?c=`.
- **Catálogo en vivo** vía UCP Catalog MCP (sin token); Storefront API como respaldo opcional.
- **Equipo de asistentes por proveedor** (ver §9) con avatares.
- **Widget flotante** embebible (una línea) con eventos GA4.
- **Monetización:** link gratis; widget embebido = Pro con licencia firmada.
- **Captura de leads:** modal "Reclamar tu asistente" → Firestore + correo + n8n.
- **Panel demo** (`/admin`) de personalización (sin persistencia).
- SEO completo (títulos por página, OG, sitemap, robots, JSON-LD).

**Fuera (backlog)**
- Cuentas de usuario / login; checkout dentro del chat; handoff humano en vivo.
- Multi-idioma; persistencia del historial de chat.
- Admin real con CRUD de asistentes y lectura de leads (hoy demo + consola Firebase).
- **Avatar subible por el creador** para asistentes personalizados (hoy usan inicial; ver §9).

## 6. Requisitos funcionales

**Chat**
- **RF-1** Chat web público, sin login, móvil y escritorio.
- **RF-2** Responde en el tono definido (ART-ES: voseo salvadoreño "Silvi").
- **RF-3** Conocimiento del negocio (≥10 datos): identidad, precios, horarios, envíos, pagos, políticas, contacto, FAQ.
- **RF-4** Responde correcto lo que está en la base o en el catálogo.
- **RF-5** Si no está disponible, lo admite y deriva al contacto humano. No inventa.
- **RF-6** Ante productos/precios/stock, consulta el catálogo **en vivo** (`buscar_productos`).
- **RF-7** Degradación elegante: sin catálogo, usa datos/productos del conocimiento.
- **RF-8** Sugerencias iniciales + indicador de "escribiendo".
- **RF-9** Tarjetas de producto (foto, precio, link) bajo la respuesta cuando menciona piezas.
- **RF-10** Avatar por burbuja según quién atiende (ver §9).

**Creador (`/crear`)**
- **RF-11** Wizard de pasos (Identidad, Estilo, Catálogo, Conocimiento, Publicar) con **vista previa en vivo** siempre visible.
- **RF-12** Genera el **link compartible** (`?c=`) y el **snippet del widget** con la config codificada y sanitizada.
- **RF-13** Permite definir el **equipo de asistentes por proveedor** (opcional, ver §9).
- **RF-14** Permite agregar **redes sociales** (lista dinámica opcional).

**Widget y monetización**
- **RF-15** Widget flotante insertable con una línea; carga perezosa; eventos `silvi_widget_abierto/cerrado` a `dataLayer`.
- **RF-16** El link es gratis; el widget embebido requiere **licencia Pro** (HMAC). Sin licencia muestra aviso de activación sin gastar tokens.

**Leads (Reto 3)**
- **RF-17** CTA "Reclamar tu asistente" al terminar de crearlo; modal con intención `guardar`/`pro`.
- **RF-18** Persiste el lead en Firestore con snapshot del asistente y dedupe por correo.
- **RF-19** Encola correo (colección `mail`) y dispara webhook de n8n (no bloqueantes).

## 7. Requisitos no funcionales

- **Rendimiento:** respuesta en segundos; bucle de herramientas máx. 3 vueltas.
- **Costo:** modelo Haiku por defecto; tope de tokens e historial; rate-limit por IP.
- **Seguridad:** todas las llaves (`ANTHROPIC_API_KEY`, Firebase, `LICENCIA_SECRET`) **solo en el servidor**. Catálogo por APIs públicas de solo lectura (UCP; Storefront de respaldo). Firestore con reglas deny-all al cliente; IP hasheada; honeypot; config del creador **sanitizada** en el servidor.
- **Privacidad:** no se persiste la conversación; para leads, consentimiento explícito y mínimo necesario.
- **Accesibilidad:** foco visible, `aria-live`, `role="dialog"` en modales, `prefers-reduced-motion`, responsive, contraste AA.

## 8. Arquitectura

- **Stack:** Next.js 14 (App Router) + TypeScript · SDK de Anthropic (tool use) · UCP Catalog MCP de Shopify · Firebase/Firestore (leads) · n8n (automatización) · Vercel. Sin base de datos de asistentes.
- **Rutas:** `app/page.tsx` (landing) · `app/crear` (creador) · `app/chat` (chat) · `app/admin` (demo) · `app/api/chat` · `app/api/lead`.
- **Cliente:** `components/Chat.tsx`, `components/ReclamarAsistente.tsx`, `components/Iconos.tsx`.
- **Dominio:** `lib/knowledge-base.ts` (negocio ART-ES + artesanos), `lib/config-asistente.ts` (config de asistentes personalizados + equipo), `lib/system-prompt.ts`, `lib/shopify.ts` (UCP + respaldo), `lib/licencias.ts`, `lib/correo.ts`, `lib/firebase-admin.ts`.

## 9. Equipo de asistentes por proveedor y avatares  ⭐ (lo que faltaba en v1)

El asistente puede estar formado por **varias personas**, cada una atendiendo
los productos de un **proveedor (vendor)** de la tienda. Al abrir el chat desde
la página de un producto, el widget pasa `{{ product.vendor }}` y atiende quien
corresponda; sin match, atiende el asistente por defecto (nunca se rompe).

**ART-ES (demo, en `lib/knowledge-base.ts` → `artesanos[]`):**
| id | nombre | taller (vendor) | avatar |
|----|--------|-----------------|--------|
| `silvi` | Silvi | Eseoese by Silvi | `/avatar-silvi.jpg` (ilustración) |
| `jose` | Don José | Artesanías en Nahuizalco | `/avatar-jose.jpg` (ilustración) |

**Asistentes personalizados (en `lib/config-asistente.ts` → `equipo[]`):** cada
miembro es `{ vendor, nombre, rubro }`; se definen en el paso "Catálogo" del
creador ("¿Quién atiende cada línea?"). El match de vendor es tolerante
(sin acentos ni mayúsculas). Máximo 4 miembros.

**Avatares:**
- **ART-ES:** avatar ilustrado de cada artesano (imagen), en el encabezado, en
  cada burbuja del asistente y en el indicador de "escribiendo".
- **Personalizados:** avatar = **inicial** del nombre del asistente/miembro
  (círculo con la letra), en los mismos lugares. La subida de una imagen propia
  por marca queda como mejora futura (§5 backlog).

**Framing de autenticidad ("voz del taller"):** el asistente habla en nombre
del taller/equipo y da crédito al resto ("eso lo hace Silvi…"); si le preguntan
si es la persona real, lo aclara con calidez y ofrece el contacto humano. Nunca
suplanta a una persona.

## 10. Fuentes de conocimiento y precedencia

- **Catálogo en vivo (UCP Catalog MCP):** título, descripción, precio, stock,
  foto y link, por tienda (`https://{dominio}/api/ucp/mcp`, sin token). Respaldo:
  Storefront API si hay token.
- **Base de conocimiento / config:** ART-ES en `knowledge-base.ts`;
  personalizados en la config del link (datos del negocio, contacto, redes).
- **Regla de precedencia:** productos/precios manda el catálogo; el resto, la
  base/config. Nada fuera de esas fuentes es válido para responder.

## 11. Monetización

- **Gratis:** link compartible del asistente, para siempre.
- **Pro:** widget embebido en la tienda del cliente, activado con **licencia
  HMAC-SHA256** (`lib/licencias.ts`) atada a marca+dominio. Emisión:
  `node scripts/generar-licencia.mjs "Marca" dominio`. Sin licencia, el widget
  embebido responde un aviso de activación **sin llamar al modelo**.

## 12. Captura de leads (Reto 3)

- Modal **"Reclamar tu asistente"** tras crearlo (`components/ReclamarAsistente.tsx`).
- `POST /api/lead`: valida correo, rate-limit por IP, honeypot, saneamiento;
  **dedupe transaccional** con ID = `SHA-256(email)`; guarda snapshot del
  asistente + intención; IP hasheada.
- Tras guardar: encola el correo en la colección **`mail`** (extensión Trigger
  Email) y dispara el **webhook de n8n** (`N8N_WEBHOOK_URL`) — ambos con
  `await` + `try/catch`, no bloquean la respuesta.
- Reglas de Firestore deny-all al cliente; escribe solo el Admin SDK del servidor.

## 13. Despliegue y variables

- GitHub → Vercel (proyecto `silvi-assistants`), deploy por CLI (`vercel deploy --prod`).
- Variables (servidor): `ANTHROPIC_API_KEY` (req.), `ANTHROPIC_MODEL`,
  `SHOPIFY_STORE_DOMAIN`, `UCP_AGENT_PROFILE`, `SHOPIFY_STOREFRONT_TOKEN`,
  `SHOPIFY_API_VERSION`, `LICENCIA_SECRET`, `FIREBASE_PROJECT_ID`,
  `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `N8N_WEBHOOK_URL`.
- Firestore Database creada; `firestore.rules` publicadas.

## 14. Riesgos y mitigaciones

- **Costo por tráfico** → rate-limit por IP, caps de tokens, Haiku por defecto.
- **Alucinación** → fuentes acotadas, reglas fijas del servidor, temperatura baja.
- **Config manipulada en el link** → sanitización server-side; las reglas
  anti-invención son de la plantilla, la config no las altera.
- **Abuso del formulario de leads** → honeypot, rate-limit, validación, consentimiento.
- **Firestore/gRPC lento en serverless** → `preferRest: true` (mitigado).
- **Credenciales** → solo en servidor; verificado que no filtran al bundle.

## 15. Criterios de aceptación (v2.0)

- [x] `/crear` genera un asistente funcional (link + widget) sin cuenta.
- [x] El asistente responde con catálogo en vivo y admite lo que no sabe.
- [x] Equipo por proveedor: atiende el miembro correcto según el vendor; avatares por burbuja.
- [x] Widget embebible; embebido sin licencia muestra aviso (sin gastar tokens).
- [x] Lead se persiste en Firestore con dedupe; dispara correo y n8n.
- [x] Llaves fuera del bundle; reglas Firestore bloquean al cliente.
- [x] URL pública, SEO por página, responsive y accesible.
- [x] `npm run build` pasa sin errores.
