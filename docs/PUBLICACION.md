# Textos listos para publicar

---

# RETO · Un agente con criterio propio + automatización (Criterio)

## C-1 · Comentario para la clase de Platzi

---

¡Hola, Platzi mates! 👋 Les presento mi creación para este reto: **Criterio**, un
agente de IA con criterio propio. 🧠

**💡 En qué me inspiré**
Tengo un emprendimiento salvadoreño real, [ART-ES](https://art-es.shop)
(artesanía hecha a mano). Cuando le construí un asistente de IA para vender,
apareció el problema de todo negocio: el soporte. Los bots normales fallan por
dos lados — o responden TODO (y meten la pata con reembolsos, cobros o temas
legales), o escalan TODO (y no sirven para nada). Yo quería uno que supiera
**cuándo hablar y cuándo frenarse y pasarle a un humano**. Eso es Criterio.

**🚦 Cómo funciona (lo interesante)**
Ante cada consulta, Criterio decide cuánta autonomía tomarse:
🟢 **Actúa solo** — si la duda está en su base de conocimiento (crear el
asistente, instalar el widget, conectar el catálogo…), responde al toque.
🟡 **Deja un borrador** — si el tema es sensible o con riesgo (reembolso, cobro,
factura, legal), NO responde solo: redacta una respuesta sugerida y me la manda
para que yo la apruebe.
🔴 **Escala** — si es urgente o una venta grande, avisa de inmediato para
intervención humana.
Y no se queda en el chat: **actúa**. Según su decisión responde al cliente,
registra el caso en ClickUp, me avisa por Telegram y arma el borrador por correo.
Humano en el loop donde importa.

**✨ Un detalle de UX que me gustó**
No te pide datos por adelantado. Preguntás libre; solo cuando hace falta escalar
te pide nombre y correo —en el momento justo— y arma UNA sola ficha con tu
consulta + tu contacto. Nada de formularios en la puerta.

**🛠️ Cómo lo hice**
Next.js para el centro de soporte, la IA de Claude para el "criterio" (devuelve
la decisión + la respuesta) y **n8n** como cerebro de automatización: un webhook
recibe la consulta, Claude decide, y según el semáforo rutea a Telegram, ClickUp
y Resend (correo). Desplegado en Vercel. Y como todo el proyecto: **nunca
inventa** — responde solo con su base de conocimiento; si no sabe, lo admite. Es
el soporte de Silvi Assistants, el motor detrás de ART-ES.

**👉 Probalo en vivo:** https://www.silvi-chatbot.online/criterio
**🎥 O miralo en 2 min:** https://youtu.be/y0YDN_uK18E
Tirale algo básico (te responde 🟢) y después un "necesito un reembolso" para ver
cómo se frena y escala 🟡.

Código y bitácora del proceso: https://github.com/eliandev/shop-asistente

Si te gusta, **tu like en este comentario es el voto** 💚 ¡Gracias, mates! Hecho
con 🤍 desde El Salvador 🇸🇻

---

## C-2 · Post para redes (LinkedIn / X)

---

La mayoría de los bots de soporte tienen dos modos: responder TODO (y meter la
pata en reembolsos o temas legales) o escalar TODO (y no servir).

Le construí uno con criterio propio. Se llama **Criterio**: ante cada consulta
decide cuánta autonomía tomarse —🟢 responde solo, 🟡 deja un borrador para que un
humano apruebe, 🔴 escala si es urgente— y automatiza el ruteo a Telegram, ClickUp
y correo con n8n. Humano en el loop donde importa, y nunca inventa.

Es el soporte de Silvi Assistants, el motor detrás de mi emprendimiento
salvadoreño ART-ES 🧶

👉 Probalo: https://www.silvi-chatbot.online/criterio
🎥 Demo en video (2 min): https://youtu.be/y0YDN_uK18E

Compitiendo en la #VibecodersLeague de @platzi — **el voto es un like a mi
comentario** 👉 [LINK-AL-COMENTARIO-EN-PLATZI]. Sin suscripción. 🙌
Hecho en El Salvador 🇸🇻

---

## C-3 · Mensaje para WhatsApp / amigos

---

¡Hola! 👋 Sigo en el reto de IA de Platzi. Ahora hice un agente de soporte con
"criterio": decide solo si responde, si deja un borrador para que yo lo apruebe,
o si escala algo urgente — y avisa por Telegram/correo automáticamente.

¿Me ayudás con tu voto? Es un **like a mi comentario** (cuenta gratis de Platzi,
sin suscripción):
👉 [LINK-AL-COMENTARIO-EN-PLATZI]

Y si querés verlo: el demo en vivo https://www.silvi-chatbot.online/criterio
o el video de 2 min https://youtu.be/y0YDN_uK18E
¡Gracias! 💚

---

> Reemplazá `[LINK-AL-COMENTARIO-EN-PLATZI]` por el link directo a tu comentario
> (menú ⋮ del comentario → copiar enlace).

---

# RETO 3 · "La forma más creativa de capturar leads"

## R3-1 · Comentario para la clase de Platzi (Reto 3)

---

¡Hola, Platzi mates! 👋 Les presento mi creación para este Reto 3 de captura
de leads: **Silvi Assistants**.

**En qué me inspiré** 💡
Tengo un emprendimiento salvadoreño real, [ART-ES](https://art-es.shop):
artesanía hecha a mano por gente de verdad —Silvi teje los bolsos en San
Salvador y don José borda cojines y talla madera en Nahuizalco—. Vendiendo por
redes me di cuenta de algo: la gente pregunta lo mismo mil veces (precios,
envíos, si hay stock) y muchas ventas se enfrían por no responder a tiempo. De
ahí salió la idea: un asistente de IA que responde por el negocio. Y después
pensé… ¿por qué solo para ART-ES? Que **cualquier marca pueda crear el suyo**.

**Cómo lo hice** 🛠️
Next.js + la IA de Claude para las respuestas, el catálogo **en vivo de
Shopify** (precios y stock reales, sin inventar nada), y para este reto sumé
**Firebase/Firestore** para la captura de leads. Todo desplegado en Vercel.

**Cómo funciona (y por qué creo que es una captura de leads distinta)** 🎣
La mayoría te pide el correo PRIMERO y te da algo después. Yo lo di vuelta:
entrás, creás **tu propio asistente** en 2 minutos con tu marca, tus colores y
tu catálogo, y lo ves **funcionando de verdad** — sin cuenta, sin pedirte nada.
Recién cuando ya lo tenés listo y te encantó, dejás tu correo para
**llevártelo** (te llega el link + el instalador para tu tienda). El lead se
captura en el pico de valor, no en la puerta. Atrás: se guarda en Firestore
con dedupe por correo, un snapshot del negocio de cada quien y correo
automático. 🙌

**Podés probarlo** 👉 https://silvi-assistants.vercel.app/crear
(creá un asistente con cualquier tienda Shopify y "reclamalo" para ver el flujo
completo). Código abierto: https://github.com/eliandev/shop-asistente

Si te gusta, **tu like en este comentario es el voto** 💚 ¡Gracias por el apoyo,
mates! Hecho con 🤍 desde El Salvador 🇸🇻

---

## R3-2 · Post para redes (LinkedIn / X) — Reto 3

---

La mayoría te dice "dejá tu correo y después te muestro".

Yo lo hice al revés: en mi proyecto, primero te doy un asistente de IA
funcionando con tu marca y tu catálogo —gratis, en 2 minutos, sin cuenta— y
recién cuando ya lo tenés en la mano te ofrezco llevártelo por correo.

El lead se captura en el pico de valor, no antes. Y no es una demo: los datos
se guardan en Firestore con dedupe, snapshot del negocio de cada quien y
correo automático.

Es parte de Silvi Assistants, el motor detrás de mi emprendimiento salvadoreño
ART-ES 🧶

🎣 Creá tu asistente y reclamalo: https://silvi-assistants.vercel.app/crear

Compitiendo en la #VibecodersLeague de @platzi — **el voto es un like a mi
comentario** 👉 [LINK-AL-COMENTARIO-EN-PLATZI]. Cualquiera puede votar, sin
suscripción. 🙌

---

## R3-3 · Mensaje para WhatsApp / amigos (Reto 3)

---

¡Hola! 👋 Sigo en el reto de IA de Platzi, ahora en el desafío de "captura de
leads". Hice algo distinto: en vez de pedirte el correo primero, te dejo crear
un asistente de IA con tu marca GRATIS y funcionando, y recién ahí te lo
llevás por correo.

¿Me ayudás con tu voto? Es un **like a mi comentario** (cuenta gratis de
Platzi, sin suscripción):
👉 [LINK-AL-COMENTARIO-EN-PLATZI]

Y si querés jugar creando uno: https://silvi-assistants.vercel.app/crear
¡Gracias! 💚

---

> Reemplazá `[LINK-AL-COMENTARIO-EN-PLATZI]` por el link directo a tu
> comentario del Reto 3 (menú ⋮ del comentario → copiar enlace).

---

# RETO 1 · "El asistente que responde por tu negocio"

## 1 · Comentario para la clase de Platzi (Reto 1)

---

🧶 **Silvi Assistants — el asistente que responde por tu negocio (y la fábrica para que cualquier emprendimiento cree el suyo)**

**El negocio que elegí es real:** [ART-ES](https://art-es.shop), mi
emprendimiento salvadoreño de artesanía hecha a mano. Trabaja con artesanos
reales — Silvi teje los bolsos en su taller de San Salvador y don José hace
los cojines bordados y el arte en madera en Nahuizalco — dándoles visibilidad,
crédito por su nombre y un canal de venta digno.

**Qué sabe mi asistente:** todo lo que un cliente pregunta antes de comprar —
envíos y costos, métodos de pago, políticas de devolución, garantía, horarios,
FAQ (14+ datos concretos) **y el catálogo EN VIVO de la tienda**: consulta
Shopify en tiempo real, así que los precios y el stock nunca están
desactualizados. Responde en español salvadoreño (voseo), con la calidez y el
orgullo artesanal de la marca.

**Qué lo hace único:**

1. 🛡️ **Nunca inventa.** Si el dato no está en su conocimiento ni en el
   catálogo, lo admite y te pasa el WhatsApp real. Probalo: intentá que te
   confirme un descuento falso.
2. 🧵 **Te atiende el artesano correcto.** En la tienda, el chat lo "atiende"
   el taller del autor de la pieza que estás viendo — y si le preguntás si es
   la persona real, lo aclara con honestidad.
3. 🖼️ **Tarjetas de producto con foto y precio**, clickeables directo a la
   tienda.
4. 🏭 **Fui más allá del reto:** construí la fábrica, no solo el asistente.
   En [/crear](https://silvi-assistants.vercel.app/crear) cualquier
   emprendimiento arma SU asistente en 2 minutos — nombre, personalidad,
   colores y su propio catálogo Shopify (sin tokens, sin código, sin cuentas).
   El link que genera ES el asistente. Hay una demo creada así: María, de una
   marca de belleza, conectada a un catálogo real.
5. ⚡ Widget embebible de una línea para cualquier tienda + modelo freemium
   con licencias.

**Probalo acá** 👉 https://silvi-assistants.vercel.app
(chat directo: https://silvi-assistants.vercel.app/chat · creador:
https://silvi-assistants.vercel.app/crear)

Código y bitácora completa del proceso:
https://github.com/eliandev/shop-asistente

Si te gustó el proyecto, **tu like en este comentario es el voto** 💚
¡Gracias por el apoyo!

---

## 2 · Post para redes (LinkedIn / X)

---

Silvi es una artesana salvadoreña. Teje a mano cada bolso de mi
emprendimiento, ART-ES.

Pero los clientes escriben a las 11pm preguntando por envíos… mientras ella
está tejiendo.

Así que le construí una voz digital que nunca duerme: un asistente de IA que
conoce su tienda a fondo, responde con el catálogo EN VIVO de Shopify y —lo
más importante— **jamás inventa**. Si no sabe algo, lo admite y te pasa su
WhatsApp real.

Y cuando funcionó, me hice la pregunta obvia: ¿por qué solo Silvi?

Hoy cualquier emprendimiento puede crear el suyo en 2 minutos, gratis y sin
código: su nombre, su personalidad, sus colores y su catálogo real.

🖤💚 Probalo: https://silvi-assistants.vercel.app
🧶 La tienda real detrás de la historia: https://art-es.shop

Estoy compitiendo en la #VibecodersLeague de @platzi y **el voto es un
like a mi comentario en la clase** 👉 [LINK-AL-COMENTARIO-EN-PLATZI]
Cualquier persona puede votar, sin suscripción. ¡Tu apoyo vale oro! 🙌

Hecho en El Salvador 🇸🇻

---

## 3 · Descripción corta (para bio / formularios)

---

Silvi Assistants: asistentes de IA que responden por tu negocio con datos
reales — catálogo Shopify en vivo, tu conocimiento y tu marca. Nunca
inventan; si no saben, lo admiten y derivan a tu WhatsApp. Creá el tuyo
gratis en 2 minutos: https://silvi-assistants.vercel.app

---

## 4 · Mensaje para WhatsApp / amigos y familia

---

¡Hola! 👋 Estoy compitiendo en un reto de IA de Platzi con un proyecto que
me emociona mucho: le construí un asistente de inteligencia artificial a
ART-ES (mi emprendimiento de artesanía salvadoreña 🧶) y lo convertí en una
plataforma donde cualquier negocio puede crear el suyo gratis.

¿Me ayudás con tu voto? Es solo darle **like a mi comentario** acá (no
necesitás suscripción, solo cuenta gratis de Platzi):
👉 [LINK-AL-COMENTARIO-EN-PLATZI]

Y si querés jugar con el asistente: https://silvi-assistants.vercel.app
¡Gracias! 💚

---

> **Nota:** reemplazá `[LINK-AL-COMENTARIO-EN-PLATZI]` por el link directo a
> tu comentario en la clase (en Platzi: menú ⋮ del comentario → copiar
> enlace, o el link de la clase del reto).

## Recordatorio del reto (para el contexto del jurado)

> **Proyecto 1: El asistente que responde por tu negocio** — base de
> conocimiento real (≥10 datos), responde lo que sabe, admite lo que no
> (no inventa), tono definido, canal público para probarlo.

Cumplimiento punto por punto y todo lo extra: ver la tabla en el
[README](../README.md#-el-reto-original--y-hasta-dónde-lo-llevamos).
