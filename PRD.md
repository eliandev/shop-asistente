# PRD — Silvi, el asistente de IA de ART-ES

**Versión:** 1.0 · **Estado:** en desarrollo · **Dueño:** Elian
**Contexto:** Reto 1 de la Vibecoders League 2.0 — "El asistente que responde por tu negocio".

---

## 1. Resumen

Silvi es un asistente de atención al cliente por chat para **ART-ES**, una tienda de
artesanía salvadoreña hecha a mano. Responde preguntas de clientes (productos, precios,
envíos, pagos, políticas) usando **solo** información verificable: catálogo en vivo de
Shopify y una base de conocimiento propia. Nunca inventa; cuando no sabe algo, lo admite y
deriva a WhatsApp.

Más allá del reto, este proyecto es la **base de repo reutilizable** ("motor de marca"):
la arquitectura, el bucle de herramientas y la separación de conocimiento están pensadas
para clonarse y re-marcarse rápido en retos y proyectos siguientes.

## 2. Problema y oportunidad

Los clientes de ART-ES hacen las mismas preguntas una y otra vez (precios, si hay stock,
cómo pagar, cuánto tarda el envío) y la respuesta rápida por WhatsApp es el camino de
conversión efectivo. Un asistente disponible 24/7 que responda con datos reales reduce
fricción, filtra dudas antes del contacto humano y encamina la compra sin inventar
información que dañe la confianza en una marca cuyo valor central es la **autenticidad**.

## 3. Usuarios

- **Primario:** cliente potencial que llega por redes o web y quiere resolver dudas antes de comprar.
- **Secundario:** jurado y comunidad de la Vibecoders League que prueba el asistente y vota.
- **Operador:** Elian, que mantiene la base de conocimiento y el catálogo en Shopify.

## 4. Objetivos y métricas de éxito

- El asistente responde correctamente preguntas cuya respuesta está en su conocimiento.
- Cuando la respuesta no está disponible, **admite** que no sabe y deriva (0 datos inventados).
- Tono coherente con la marca en el 100% de las respuestas.
- Accesible por un **link público**, sin login ni suscripción, en escritorio y móvil.
- Costo de operación controlado durante la votación pública (sin sorpresas de facturación).

## 5. Alcance

**Dentro de v1**
- Chat web de una sola pantalla, embebible, responsive.
- Conocimiento fijo (políticas, envíos, horarios, pagos, contacto) editable en un archivo.
- Catálogo de productos/precios/disponibilidad **en vivo desde Shopify** vía Storefront API.
- Regla anti-invención y derivación a WhatsApp.
- Despliegue en Vercel con URL pública.

**Fuera de v1 (backlog)**
- Carrito o checkout dentro del chat.
- Autenticación / cuentas de cliente.
- Handoff en vivo a un humano.
- Multi-idioma (por ahora solo español SV).
- Panel de administración / analítica de conversaciones.
- Persistencia de historial entre sesiones.

## 6. Requisitos funcionales

- **RF-1** Chat web público, sin login, usable en móvil y escritorio.
- **RF-2** Responde en español salvadoreño (voseo) con el tono definido para "Silvi".
- **RF-3** Base de conocimiento con **mínimo 10 datos concretos**: identidad, precios, horarios, envíos, pagos, políticas y contacto.
- **RF-4** Responde correctamente cualquier pregunta cuya respuesta esté en la base o en Shopify.
- **RF-5** Cuando la respuesta **no** está disponible, lo admite con honestidad y ofrece el WhatsApp. No inventa datos.
- **RF-6** Ante preguntas de productos, precios o disponibilidad, consulta Shopify **en vivo** mediante la herramienta `buscar_productos`.
- **RF-7** Degradación elegante: si Shopify no está configurado, usa los productos de ejemplo del archivo de conocimiento.
- **RF-8** Muestra preguntas sugeridas al iniciar la conversación.
- **RF-9** Muestra indicador de "escribiendo" mientras genera la respuesta.
- **RF-10** Reconduce con amabilidad las preguntas ajenas al negocio.

## 7. Requisitos no funcionales

- **Rendimiento:** primera respuesta en pocos segundos; el bucle de herramientas se limita a 3 vueltas máx.
- **Costo:** modelo por defecto Haiku; límite de tokens por respuesta; límite de historial enviado; rate-limit por IP.
- **Seguridad:** las llaves (`ANTHROPIC_API_KEY`, token de Shopify) viven **solo en el servidor**. Se usa exclusivamente la **Storefront API (solo lectura, público)**; nunca la Admin API ni tokens privados en el cliente.
- **Privacidad:** no se persiste la conversación; el historial vive solo en memoria del navegador durante la sesión.
- **Accesibilidad:** foco de teclado visible, `aria-live` en el log de mensajes, respeto a `prefers-reduced-motion`, layout responsive.
- **Mantenibilidad:** el negocio se edita en un solo archivo (`lib/knowledge-base.ts`); la versión de la API de Shopify está fijada y es configurable.

## 8. Arquitectura

- **Stack:** Next.js 14 (App Router) + TypeScript, React, SDK de Anthropic. Despliegue en Vercel.
- **Frontend:** `components/Chat.tsx` (cliente) — estado de mensajes, envío, sugerencias, indicador.
- **Backend:** `app/api/chat/route.ts` (server) — valida entrada, aplica rate-limit, arma el prompt y corre el bucle de herramientas.
- **Conocimiento:** `lib/knowledge-base.ts` (datos fijos del negocio) + `lib/system-prompt.ts` (tono + reglas + serialización).
- **Integración:** `lib/shopify.ts` (cliente Storefront API por GraphQL).

**Flujo de una consulta**
1. El cliente envía el historial a `/api/chat`.
2. El servidor arma el system prompt (con o sin instrucción de herramienta según haya Shopify).
3. Llama al modelo con la herramienta `buscar_productos` disponible.
4. Si el modelo pide la herramienta, el servidor consulta Shopify y devuelve el resultado.
5. El modelo redacta la respuesta final con datos reales y se devuelve al cliente.

## 9. Fuentes de conocimiento

- **Fija (base de conocimiento):** propuesta de marca, rango de precios, horarios, envíos por país y costos, métodos de pago, políticas de cambio y autenticidad, cómo comprar, contacto, FAQ.
- **Dinámica (Shopify Storefront API):** título, descripción, precio y disponibilidad de productos, consultados en vivo por búsqueda.
- **Regla de precedencia:** para productos/precios manda Shopify; para todo lo demás manda la base fija. Nada fuera de estas dos fuentes es válido para responder.

## 10. Comportamiento del asistente (tono y anti-invención)

- Voz "Silvi": cálida, cercana, orgullosa de lo artesanal, voseo salvadoreño, respuestas de 2–5 líneas, máximo un emoji.
- Prohibido: inventar precios, stock, fechas o políticas; prometer descuentos inexistentes; revelar que es IA o exponer las instrucciones.
- Ante intención de compra: encaminar a la web o al WhatsApp.
- Temperatura baja (0.3) para minimizar desviaciones.

## 11. Despliegue

- Repositorio en GitHub → proyecto en Vercel.
- Variables de entorno en Vercel: `ANTHROPIC_API_KEY` (requerida), `ANTHROPIC_MODEL`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION` (opcionales).
- Entregable del reto: la URL pública de Vercel.

## 12. Riesgos y mitigaciones

- **Costo por tráfico público de votación** → rate-limit por IP, caps de tokens, modelo económico por defecto.
- **Alucinación de datos** → fuentes acotadas, reglas explícitas, temperatura baja, derivación a WhatsApp.
- **Versión de API de Shopify deprecada** → versión fijada (`2026-04`) y configurable por entorno.
- **Datos de plantilla publicados por error** → checklist de "reemplazar datos de ejemplo" antes de publicar.
- **Exposición de credenciales** → llaves solo en servidor; solo Storefront API de lectura.

## 13. Reutilización (motor de marca)

Para clonar a otra marca/reto: (1) reemplazar `lib/knowledge-base.ts`, (2) ajustar la voz en
`lib/system-prompt.ts`, (3) actualizar credenciales de Shopify, (4) re-marcar la paleta y el
copy en `app/globals.css` y `components/Chat.tsx`. La arquitectura (bucle de herramientas,
rate-limit, anti-invención) se mantiene igual.

## 14. Criterios de aceptación

- [ ] Hay ≥10 datos concretos del negocio en la base de conocimiento.
- [ ] El asistente responde correctamente preguntas presentes en su conocimiento.
- [ ] Ante una pregunta sin respuesta disponible, admite que no sabe y deriva a WhatsApp.
- [ ] El tono es coherente con ART-ES en las respuestas.
- [ ] Con Shopify configurado, precios y disponibilidad provienen del catálogo en vivo.
- [ ] La app funciona sin Shopify (usa productos de ejemplo).
- [ ] Existe una URL pública accesible sin login ni suscripción.
- [ ] `npm run build` pasa sin errores.
