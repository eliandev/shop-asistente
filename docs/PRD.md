# PRD v3.0 — Silvi Assistants (producto SaaS monetizable)

**Versión:** 3.0 · **Estado:** propuesta / en definición · **Dueño:** Elian
**Producción actual:** https://www.silvi-chatbot.online · **Repo:** github.com/eliandev/shop-asistente
**Documento hermano:** [BRD.md](./BRD.md) (negocio, mercado, pricing, GTM)
**Base v2.0 (lo ya construido):** ver [../PRD.md](../PRD.md)

> **Decisiones de negocio que fijan este PRD** (ver BRD §Modelo)
> 1. **Monetización:** Freemium + suscripción con **límites de uso** (tiers por volumen de mensajes de IA/mes).
> 2. **Distribución:** **SaaS propio primero** (cuentas + billing propios con Stripe); **Shopify App Store** como fase posterior.
> 3. **Mercado:** **Global**, producto **bilingüe (EN + ES)**, precios en USD.

---

## 1. Resumen ejecutivo

Silvi Assistants es una plataforma no-code para crear **asistentes de IA para tiendas Shopify** que responden con el **catálogo en vivo**, el conocimiento y la marca del negocio, y **nunca inventan datos**. La v2.0 (en producción) probó el producto: cualquiera crea un asistente en 2 minutos, sin cuenta, y "el link es el asistente".

La v3.0 convierte ese producto validado en un **SaaS monetizable**: cuentas, asistentes **persistentes** con dashboard, **billing self-serve** (Stripe), **planes por uso**, licencia Pro **automática**, y el agente de soporte **Criterio** como diferencial vendible. Objetivo: pasar de "demo del reto" a **ingreso recurrente (MRR)** con un embudo freemium global.

## 2. Visión

> "Que cualquier tienda del mundo tenga, en minutos, un empleado de IA que vende y da soporte con datos reales — sin código, sin alucinar, y por el precio de un café."

## 3. Qué cambia respecto a la v2.0

| Dimensión | v2.0 (hoy, reto) | v3.0 (monetizable) |
|---|---|---|
| Identidad | Sin cuentas | **Cuentas + auth** (email + OAuth Google) |
| Asistentes | Config en el link (sin DB) | **Persistentes en DB**, editables desde el dashboard |
| Cobro | Licencia HMAC emitida a mano por script | **Billing self-serve con Stripe**, licencia Pro automática |
| Planes | Gratis / Pro (binario) | **Free / Starter / Growth / Scale** con **límites de uso** |
| Uso | Sin medición | **Metering** de mensajes de IA + enforcement de límites |
| Idioma | Español | **Bilingüe EN + ES** (UI, asistente y Criterio) |
| Soporte | Criterio para Silvi | Criterio **también como feature** para el merchant |
| Analítica | Eventos GA4 sueltos | **Dashboard de métricas** por asistente |
| Datos | Solo leads en Firestore | Multi-tenant: cuentas, asistentes, uso, suscripciones, leads |

Lo que **se conserva** (núcleo de valor): catálogo Shopify en vivo **sin tokens** (UCP), **anti-invención** con derivación a humano, equipo por proveedor, tarjetas de producto, widget de una línea, y el onboarding "el link es el asistente" como **hook del free**.

## 4. Usuarios y personas

- **Merchant SMB / DTC (global):** dueño o marketer de una tienda Shopify (1–3 personas) que quiere responder rápido y vender más sin contratar soporte. Persona primaria de pago.
- **Emprendedor que arranca:** usa el **plan Free** (link compartible) como primer canal de atención; candidato a convertir.
- **Agencia / partner:** gestiona varias tiendas de clientes; interesa multi-tienda y seats (plan Scale).
- **Cliente final (shopper):** chatea con el asistente en la tienda o por link; no es usuario de pago pero define la calidad percibida.
- **Operador de la plataforma (Elian + equipo):** administra planes, soporte (Criterio), y salud del sistema.

## 5. Objetivos y métricas de producto

**North Star:** *mensajes de IA útiles atendidos por mes* (proxy de valor entregado y de uso facturable).

| Objetivo | Métrica | Meta inicial (a validar en BRD) |
|---|---|---|
| Activación | % de signups que publican ≥1 asistente y reciben ≥1 conversación real | ≥ 40% |
| Conversión | Free → pago (primeros 30 días) | ≥ 3–5% |
| Retención | Churn mensual de pago | ≤ 5% |
| Calidad IA | % de respuestas sin invención (auditoría) | ≥ 99% |
| Time-to-value | Tiempo de signup a asistente publicado | ≤ 5 min |
| Costo | Margen bruto por cuenta de pago | ≥ 80% |

## 6. Modelo de planes y límites de uso

**Unidad de uso facturable:** *mensaje de IA* = cada respuesta generada por el asistente (incluye Criterio). Se agrega por **cuenta** y por **período de facturación**. Las conversaciones se muestran como métrica secundaria.

| Plan | Precio (USD/mes, *propuesta*) | Mensajes IA/mes | Widget en tienda | Marca Silvi | Tiendas / seats | Criterio (soporte) | Analítica | Soporte |
|---|---|---|---|---|---|---|---|---|
| **Free** | $0 | 100 | ❌ (solo link) | Visible | 1 | ❌ | Básica | Comunidad |
| **Starter** | ~$19 | 1.000 | ✅ 1 tienda | Se quita | 1 | ❌ | Básica | Email |
| **Growth** | ~$49 | 5.000 | ✅ | Se quita | hasta 3 | ✅ | Avanzada | Prioritario |
| **Scale** | ~$149 | 20.000 | ✅ | Se quita | multi + seats | ✅ | Avanzada + export | SLA |

> Precios y topes son **propuesta inicial**; se calibran en el [BRD](./BRD.md#pricing) contra costo de tokens y benchmarks. Anual con descuento (~2 meses gratis).

**Comportamiento de límites (RF clave):**
- **Aviso** al 80% y 100% del cupo (in-app + email).
- Al pasar el 100%: **soft-limit** con opción 1-click de *upgrade* o **paquete de overage** (p. ej. +1.000 mensajes por $X); nunca se corta sin aviso.
- El **plan Free** que agota su cupo muestra al shopper un mensaje de "vuelve pronto" + deriva al WhatsApp del merchant (nunca se rompe la experiencia ni se gasta modelo).

## 7. Requisitos funcionales

### 7.1 Cuentas y autenticación
- **RF-1** Signup/login con email+contraseña y **OAuth Google**; verificación de email; recuperación de contraseña.
- **RF-2** Un **workspace** por cuenta; en Growth/Scale, invitar **miembros** con roles (owner, editor, viewer).
- **RF-3** Perfil, cierre de sesión, borrado de cuenta (GDPR/CCPA — ver §8).

### 7.2 Dashboard del merchant
- **RF-4** CRUD de **asistentes persistentes** (crear, editar, duplicar, archivar); cada uno con **slug corto** estable (`/a/mi-tienda`).
- **RF-5** Editor del asistente = el wizard v2 (Identidad, Estilo, Catálogo, Conocimiento, Publicar) con **vista previa en vivo**, pero **guardando en DB**.
- **RF-6** Conexión de tienda Shopify por **dominio** (UCP, sin tokens); estado de conexión visible.
- **RF-7** Gestión del **widget**: obtener snippet, activar/desactivar, elegir tienda/vendor, ver estado de licencia.
- **RF-8** Vista de **leads** capturados (tabla, export CSV en Scale).
- **RF-9** **Bandeja de Criterio** (Growth+): conversaciones de soporte, decisiones 🟢/🟡/🔴, **borradores para aprobar** con 1-click enviar.

### 7.3 Motor de asistente (se conserva de v2, multi-tenant)
- **RF-10** Catálogo **en vivo** por UCP; anti-invención; derivación a humano; tarjetas de producto; equipo por proveedor. *(Núcleo de v2, ya construido.)*
- **RF-11** Cada respuesta **cuenta como uso** y se atribuye a la cuenta/asistente para metering.

### 7.4 Billing y suscripciones (Stripe)
- **RF-12** Checkout self-serve por plan; **prueba gratis** de 14 días de Growth (sin tarjeta o con tarjeta — a decidir en BRD).
- **RF-13** **Customer Portal** de Stripe: cambiar plan, método de pago, ver facturas, cancelar.
- **RF-14** Upgrade/downgrade con **prorrateo**; manejo de **dunning** (pagos fallidos) con reintentos y aviso.
- **RF-15** **Webhooks de Stripe** → estado de suscripción en DB (activo, en prueba, moroso, cancelado) como fuente de verdad de acceso.

### 7.5 Uso, límites y licencia Pro
- **RF-16** **Metering**: contador de mensajes de IA por cuenta/período; endpoint idempotente; visible en dashboard con barra de progreso.
- **RF-17** **Enforcement** de límites (§6) con avisos 80/100% y flujo de upgrade/overage.
- **RF-18** **Licencia Pro automática**: al activarse una suscripción con widget, se **emite/renueva** la licencia (HMAC, atada a cuenta+dominio) sin intervención manual; al cancelar/morosear, el widget vuelve al aviso de activación **sin gastar modelo**. *(Automatiza el `scripts/generar-licencia.mjs` de v2.)*

### 7.6 Criterio como feature (Growth+)
- **RF-19** El merchant activa un **agente de soporte Criterio** para su propia tienda: KB propia, decisión de autonomía 🟢/🟡/🔴, y ruteo configurable (email / Telegram / webhook).
- **RF-20** Criterio **bilingüe** (responde en el idioma del shopper); captura de contacto solo al escalar (una sola ficha, sin doble llamada — ver [FIX-widget-doble-llamada.md](./FIX-widget-doble-llamada.md) y [n8n-dedupe-sessionid.md](./n8n-dedupe-sessionid.md)).

### 7.7 Analítica
- **RF-21** Dashboard con: conversaciones, mensajes de IA, **tasa de derivación/deflection**, leads capturados, **top preguntas**, uso vs. límite. GA4/dataLayer se mantiene para el widget.

### 7.8 Internacionalización
- **RF-22** UI del producto en **EN + ES** (detección + selector); el **asistente** responde en el idioma del shopper; contenidos legales y correos bilingües.

## 8. Requisitos no funcionales

- **Rendimiento:** respuesta del asistente en segundos; dashboard < 2s; bucle de herramientas máx. 3 vueltas.
- **Costo / margen:** Haiku por defecto; **límites de uso duros/blandos** como principal control de costo; caché donde aplique; objetivo margen bruto ≥ 80%.
- **Seguridad:** auth robusta (hash de contraseñas, sesiones seguras, rate-limit, protección CSRF); **secretos solo en servidor**; catálogo por APIs públicas de solo lectura; multi-tenant con **aislamiento por cuenta** (row-level). Licencias HMAC atadas a cuenta+dominio.
- **Privacidad / cumplimiento:** **GDPR + CCPA**: base legal, export y borrado de datos, DPA; **transparencia de IA** (avisar que es un asistente automático); minimización de datos de shoppers; retención configurable; sub-encargados (Anthropic, Stripe, Vercel, n8n) listados.
- **Fiabilidad:** objetivo **99.9%** de uptime; degradación elegante sin catálogo o sin modelo; observabilidad (logs, alertas, panel de estado).
- **Escalabilidad:** multi-tenant; jobs en background para metering/emails/licencias; listo para picos.
- **Accesibilidad:** WCAG AA (foco visible, aria-live, roles en modales, prefers-reduced-motion, responsive).

## 9. Arquitectura objetivo (evolución de v2)

- **Base v2 (se mantiene):** Next.js 14 (App Router) + TS · SDK Anthropic (tool use) · UCP Catalog MCP · widget de una línea · n8n (automatización de Criterio/leads) · Vercel.
- **Nuevo para SaaS:**
  - **Auth:** Auth.js (NextAuth) o Clerk/Supabase Auth (evaluar en BRD/estimación).
  - **DB multi-tenant:** Postgres gestionado (Supabase/Neon) para cuentas, asistentes, uso, suscripciones, miembros; **Firestore se mantiene para leads** o se migra (decidir).
  - **Billing:** Stripe (Checkout + Customer Portal + Webhooks) como fuente de verdad de acceso.
  - **Metering:** tabla de eventos de uso + agregación por período; enforcement en el `api/chat`.
  - **Licencias:** servicio que emite/renueva HMAC según estado de suscripción (reemplaza el script manual).
  - **i18n:** `next-intl` o equivalente (EN/ES).
- **Fase posterior (Shopify App):** OAuth de Shopify, Shopify Billing API, embedding en el Admin (App Bridge), review del App Store.

## 10. Roadmap por fases (camino a MRR)

| Fase | Nombre | Entregable | Resultado de negocio |
|---|---|---|---|
| **A** | **MVP monetizable** | Auth + asistentes persistentes + dashboard mínimo + Stripe (planes §6) + metering + licencia Pro automática | **Primeros clientes de pago** |
| **B** | **Producto completo** | Bandeja Criterio como feature + analítica + i18n EN + prueba gratis + overage | Conversión y ticket ↑; alcance global |
| **C** | **Distribución y escala** | Shopify App Store + equipo/multi-tienda + integraciones (Klaviyo/Zapier) + referidos | Descubrimiento y expansión (NRR) |

> Detalle de hitos de negocio (primer cliente, $1k/$10k MRR, lanzamiento App) en el [BRD §Roadmap](./BRD.md#roadmap).

## 11. Riesgos (producto) y mitigaciones

- **Costo de IA se dispara** → límites de uso duros/blandos, Haiku, caps de tokens, alertas de margen.
- **Complejidad multi-tenant / fugas entre cuentas** → aislamiento row-level, tests de autorización, revisiones de seguridad.
- **Dependencia de Shopify/UCP** → respaldo Storefront; abstraer la capa de catálogo para sumar otras plataformas.
- **Fricción del alta con cuentas** (perdemos la magia del "sin cuenta") → mantener el **Free con link instantáneo**; pedir cuenta solo para guardar/publicar/cobrar.
- **Alucinación** (riesgo reputacional) → anti-invención del server, fuentes acotadas, auditoría continua.
- **Churn** → activación fuerte, valor visible (analítica), Criterio como pegamento.

## 12. Criterios de aceptación — MVP monetizable (Fase A)

- [ ] Un merchant se registra, **crea y publica** un asistente persistente y lo edita luego desde el dashboard.
- [ ] Conecta su tienda Shopify por dominio y el asistente responde con **catálogo en vivo**.
- [ ] Puede **suscribirse con Stripe** (self-serve), y al hacerlo el **widget Pro se activa solo** (licencia automática) en su dominio.
- [ ] El **uso se mide** y se muestra; al 80/100% recibe avisos y puede hacer upgrade/overage en 1 click.
- [ ] Al cancelar, el acceso Pro y la licencia se **revocan** correctamente (widget vuelve al aviso sin gastar modelo).
- [ ] Anti-invención intacto; secretos fuera del bundle; aislamiento por cuenta verificado.
- [ ] `npm run build` pasa; páginas clave con SEO, responsive y accesibles.
