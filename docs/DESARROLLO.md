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
| 0 | Preparación del entorno | 🟡 En curso | — |
| 1 | Marca y datos reales del negocio | ⬜ Pendiente | Confirmación de marca objetivo |
| 2 | Integración Shopify en vivo | ⬜ Pendiente | Token Storefront API |
| 3 | Branding UI (assets y paleta) | ⬜ Pendiente | Assets del usuario |
| 4 | Calidad y endurecimiento (QA) | ⬜ Pendiente | Fases 1–3 |
| 5 | Despliegue a producción (Vercel) | ⬜ Pendiente | Fase 4 |

---

## Fase 0 — Preparación del entorno

**Objetivo:** dejar el proyecto corriendo en local, con build limpio y control de versiones.

**Checklist**
- [ ] `npm install` sin errores
- [ ] `npm run build` pasa sin errores de tipos ni de build
- [ ] Repo git inicializado con commit inicial
- [ ] `.env.local` creado a partir de `.env.example` (llaves las pone el usuario, nunca se versionan)
- [ ] Bitácora de desarrollo creada (este documento)

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

**Entradas necesarias (las provee el usuario)**
- Marca objetivo confirmada (¿se re-marca para la tienda real conectada o se mantiene ART-ES?)
- Datos reales del negocio: contacto (WhatsApp, redes, web, correo), horarios,
  zonas y costos de envío, métodos de pago, políticas de cambio/devolución, FAQ.

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

**Trabajo**
- Crear app privada en Shopify Admin → Storefront API token (SOLO lectura:
  `unauthenticated_read_product_listings`). La Admin API queda prohibida en esta app.
- Configurar `SHOPIFY_STORE_DOMAIN` y `SHOPIFY_STOREFRONT_TOKEN` en `.env.local`
  (local) y luego en Vercel (producción).
- Probar `buscar_productos` con búsquedas reales del catálogo.
- Verificar degradación elegante: sin credenciales, la app usa productos de ejemplo.

**Nota de seguridad:** el token de Storefront es público y de solo lectura; aún así
vive solo en variables de entorno del servidor, nunca en código versionado.

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

## Registro de decisiones

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-07-10 | Trabajo organizado en 6 fases documentadas en esta bitácora | Pedido del dueño del proyecto: desarrollo paso a paso y documentado |
| 2026-07-10 | Se mantiene el stack actual (Next.js 14, CSS con variables, sin dependencias nuevas) | Convención de AGENTS.md; el proyecto ya está bien estructurado |
| 2026-07-10 | Rate-limit en memoria se acepta para v1 | Alcance actual; documentado como limitación conocida |
