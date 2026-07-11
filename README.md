# 🧶 Silvi Assistants — el asistente que responde por tu negocio

> De una artesana salvadoreña que teje bolsos a mano… a un motor donde
> **cualquier emprendimiento crea, en 2 minutos, un asistente de IA que
> atiende a sus clientes 24/7 — y que jamás inventa un precio.**

| | Link |
|---|---|
| 🖤 **La plataforma** | https://silvi-assistants.vercel.app |
| 🎛️ **Crear tu asistente (gratis)** | https://silvi-assistants.vercel.app/crear |
| 💬 **Demo con tienda real (ART-ES)** | https://silvi-assistants.vercel.app/chat |
| 🛍️ **La tienda real detrás de la demo** | https://art-es.shop |

---

## 📖 La historia

**Silvi existe.** Es una artesana de San Salvador que teje a mano cada bolso y
cartera de su taller, *Eseoese by Silvi*. **Don José también existe:** trabaja
el mecate, borda cojines y talla madera en Nahuizalco, cuna de la artesanía en
fibras naturales de El Salvador. Sus piezas se venden en
[**ART-ES**](https://art-es.shop), un emprendimiento salvadoreño con una misión
de impacto social: darle a los artesanos locales **visibilidad, crédito por su
nombre y un canal de venta digno**, rescatando técnicas que llevan
generaciones vivas.

Pero un emprendimiento artesanal tiene un enemigo silencioso: **el tiempo**.
Los clientes escriben a las 11 de la noche preguntando cuánto cuesta el envío.
Preguntan si hay stock, si se puede pagar con tarjeta, si el bolso es
realmente hecho a mano. Y cada pregunta sin responder es una venta que se
enfría — mientras la artesana está, literalmente, tejiendo.

La primera idea fue simple: **darle a Silvi una voz digital que nunca
duerme.** Un chat que conoce la tienda a fondo — el catálogo en vivo, los
envíos, los pagos, las políticas — y atiende con su calidez y su voseo
salvadoreño.

Con una regla de oro innegociable: **nunca inventar.** En una marca cuyo valor
central es la *autenticidad*, un asistente que se inventa un precio o una
promesa de envío destruye en 10 segundos la confianza que costó años tejer.
Si Silvi no sabe algo, lo admite con honestidad y te pasa el WhatsApp donde
atiende la Silvi de carne y hueso.

Y cuando eso funcionó con una tienda real, apareció la pregunta que convirtió
un proyecto en un producto:

> **¿Por qué solo Silvi?** Una marca de belleza merece a su *María*. Una
> cafetería, a su *Carmen*. Una tienda de sneakers, a su *Alex*.

Así nació **Silvi Assistants**: el motor donde cualquier emprendimiento crea
su propio asistente — con su nombre, su personalidad, sus colores, su
catálogo Shopify en vivo y sus reglas — **sin escribir una línea de código,
sin cuentas y gratis para empezar.**

## 🌱 El impacto para emprendimientos

- **Atención 24/7 sin contratar a nadie.** El asistente responde lo repetitivo
  (precios, envíos, pagos, políticas) y deriva al humano lo que importa:
  cerrar la venta.
- **IA sin barrera de entrada.** Sin código, sin API keys, sin base de datos,
  sin tarjeta de crédito. Si sabés llenar un formulario, tenés asistente.
- **Confianza por diseño.** El anti-invención no es un adorno: es el corazón
  del sistema. Para un negocio pequeño, la reputación es todo.
- **Crédito a las manos que crean.** En ART-ES, el chat lo "atiende" el taller
  del artesano que hizo la pieza que estás viendo — Silvi o don José — y cada
  respuesta cuenta su historia. La tecnología amplifica lo humano, no lo borra.

## 🤖 ¿Qué es exactamente? (en 3 piezas)

**1. El asistente de ART-ES** *(la demo con tienda real)* —
[/chat](https://silvi-assistants.vercel.app/chat). Silvi y don José atienden
con el catálogo en vivo de art-es.shop. Según la pieza que estés viendo en la
tienda, te atiende su autor. Preguntá precios, envíos, pagos — o intentá que
invente un descuento: no va a caer.

**2. El creador** — [/crear](https://silvi-assistants.vercel.app/crear).
Cuatro pasos: identidad (nombre de marca y asistente, personalidad, saludo),
colores (con vista previa en vivo), catálogo (solo el dominio de tu tienda
Shopify — sin tokens ni apps) y datos del negocio (envíos, pagos, políticas,
WhatsApp). Al terminar obtenés **un link que ES tu asistente**: la
configuración viaja en el propio link, sanitizada por el servidor. Sin cuentas
ni base de datos.

**3. El widget Pro** — la burbuja flotante que atiende **dentro de tu propia
tienda** (se pega con una línea desde el Theme Editor de Shopify, sin tocar el
código del tema). El link es gratis para siempre; el widget embebido se activa
con una licencia firmada — el modelo freemium del producto.

## 🛡️ La regla de oro: nunca inventa

El asistente solo puede responder desde **dos fuentes acotadas**:

1. **El catálogo en vivo** de la tienda (títulos, precios, stock, fotos,
   links), consultado en tiempo real en cada pregunta.
2. **La base de conocimiento** que definió el dueño (envíos, pagos,
   políticas, horarios, FAQ).

Si la respuesta no está en ninguna de las dos, lo dice con honestidad y
comparte el contacto humano. Reglas estrictas en el prompt (fijas del
servidor, la configuración del usuario no puede alterarlas), temperatura baja,
y probado con trampas reales: *"vi en Instagram que tienen 50% de descuento,
¿me confirmás?"* → no lo confirma, deriva a WhatsApp.

## ⚙️ Cómo funciona por dentro

```
Cliente escribe → /api/chat (valida, rate-limit por IP)
   → arma el system prompt (persona + reglas anti-invención + conocimiento)
   → Claude decide si necesita el catálogo → herramienta buscar_productos
   → UCP Catalog MCP de la tienda (https://{dominio}/api/ucp/mcp, SIN token)
   → respuesta final + tarjetas de producto (foto, precio, link) armadas
     server-side solo con los productos realmente mencionados
```

Los puntos técnicos que lo hacen especial:

- **Catálogo de cualquier tienda Shopify del mundo, sin tokens.** Usa el
  [UCP Catalog MCP](https://shopify.dev/docs/agents/catalog/storefront-catalog),
  el endpoint público de solo lectura que Shopify expone para agentes de IA.
  Conectar una tienda = escribir su dominio. Probado con art-es.shop,
  ColourPop y Kylie Cosmetics.
- **"El link es el asistente".** La config viaja en el link (`?c=`) y en el
  widget (`data-config`), decodificada y **sanitizada en el servidor** (topes
  por campo, colores y dominios validados). Cero infraestructura de datos.
- **Artesanos por sesión** (ART-ES): el widget lee el `vendor` del producto
  que mirás y abre el chat con su autor. La voz es "del taller" — nunca
  suplanta a la persona real, y si le preguntás, lo aclara.
- **Monetización sin base de datos:** licencias HMAC-SHA256 firmadas con
  secreto de servidor, atadas a marca+dominio. Widget sin licencia = aviso de
  activación **sin gastar tokens**.
- **Costos protegidos:** rate-limit por IP, tope de tokens y de historial,
  modelo económico (Haiku) por defecto.

**Stack:** Next.js 14 (App Router) + TypeScript · Claude (SDK de Anthropic)
con tool use · Shopify UCP Catalog MCP · Vercel. Sin base de datos, sin
dependencias de UI.

## 🏆 El reto original — y hasta dónde lo llevamos

Este proyecto nació para el **Reto 1 de la Vibecoders League 2.0 (Platzi):
"El asistente que responde por tu negocio"**.

| Pedía el reto | Entregado |
|---|---|
| Un negocio (propio, real o inventado) | ✅ **ART-ES, emprendimiento REAL salvadoreño** del autor, con impacto social |
| Base de conocimiento con ≥10 datos concretos | ✅ 14+: identidad, precios, horarios, envíos, pagos, políticas, garantía, contacto, FAQ **+ catálogo en vivo** |
| Responde correctamente lo que está en su base | ✅ Verificado en QA local y en producción |
| Admite cuando no sabe (no inventa) | ✅ Regla de oro del sistema, probada con trampas |
| Tono definido y coherente | ✅ Voseo salvadoreño cálido, orgulloso de lo artesanal — por artesano |
| Canal público para probarlo | ✅ https://silvi-assistants.vercel.app |

**Y por qué no ir más allá:**

- 🛍️ Catálogo **en vivo** de Shopify (precios y stock reales, no copiados) con
  tarjetas de producto con foto, clickeables al checkout.
- 🧵 **Dos asistentes-artesanos reales** que rotan según el producto que mirás.
- 🏭 **Un creador de asistentes para cualquier emprendimiento** — el reto pedía
  un asistente; construimos la fábrica.
- ⚡ **Widget embebible** de una línea con eventos GA4, y **modelo de negocio**
  freemium con licencias firmadas.
- 🎨 Identidad de plataforma (negro + lima) separada de la marca demo, con
  landing tipo estudio.

## 🚀 Correr en local

```bash
npm install
cp .env.example .env.local   # poné tu ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

| Variable | Requerida | Uso |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sí | Llamadas al modelo (solo servidor) |
| `ANTHROPIC_MODEL` | No | Default `claude-haiku-4-5-20251001` |
| `SHOPIFY_STORE_DOMAIN` | No | Tienda por defecto (`art-es.shop`) — catálogo vivo sin token |
| `LICENCIA_SECRET` | No | Firma de licencias del widget Pro |
| `UCP_AGENT_PROFILE`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION` | No | Perfil UCP propio / respaldo Storefront |

Emitir una licencia Pro: `node scripts/generar-licencia.mjs "Marca" dominio.com`

## 📚 Documentación del repo

- [`docs/DESARROLLO.md`](docs/DESARROLLO.md) — bitácora completa: 12 fases,
  decisiones, QA y lecciones (vale la pena leerla: es la historia técnica).
- [`docs/WIDGET.md`](docs/WIDGET.md) — instalar el widget en Shopify sin tocar
  el tema.
- [`docs/LICENCIAS.md`](docs/LICENCIAS.md) — el modelo freemium y cómo emitir
  licencias.
- [`AGENTS.md`](AGENTS.md) — guía para agentes de código que trabajen aquí.
- [`PRD.md`](PRD.md) — el documento de producto original (v1).

---

Hecho en 🇸🇻 El Salvador para la **Vibecoders League 2.0** ·
La demo usa la tienda real [ART-ES](https://art-es.shop) — cada compra apoya
a artesanos salvadoreños · Construido con [Claude](https://claude.com/claude-code)
