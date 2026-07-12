# Textos listos para publicar

---

# RETO 3 · "La forma más creativa de capturar leads"

## R3-1 · Comentario para la clase de Platzi (Reto 3)

---

🎣 **Silvi Assistants — capturo leads regalando algo que ya funciona, no pidiendo el correo primero**

La mayoría de las capturas de leads son al revés: "dejá tu correo y DESPUÉS
te doy algo". Yo lo di vuelta.

En [silvi-assistants.vercel.app/crear](https://silvi-assistants.vercel.app/crear)
cualquier persona arma **su propio asistente de IA** en 2 minutos —con su
marca, sus colores y su catálogo de Shopify en vivo— y lo ve **funcionando de
verdad** antes de que le pida absolutamente nada. Sin cuenta, sin correo, sin
fricción.

Recién cuando ya tiene su asistente listo aparece el intercambio justo: para
**llevárselo** (recibir el link + el instalador por correo) o pedir el **widget
Pro** para su tienda, deja sus datos. El gancho no es una promesa: es una
herramienta que ya tiene en la mano. Eso es lo que lo hace creativo — **el lead
se captura en el pico de valor, no antes.**

**Lo que hay detrás (de verdad, no maqueta):**
- Los leads se guardan en **Firestore** (Firebase), con dedupe por correo
  (mismo correo no duplica, cuenta reintentos) y un **snapshot del asistente**
  que creó cada persona — oro puro para segmentar: sé qué marca es, de qué
  rubro y si conectó tienda.
- Credenciales solo en el servidor, IP guardada hasheada, honeypot
  anti-bots, rate-limit y consentimiento explícito.
- Correo automático cableado (extensión Trigger Email de Firebase): al
  reclamar, sale el correo con el link de su asistente.

**Probalo vos mismo** (creá un asistente y reclamalo) 👉
https://silvi-assistants.vercel.app/crear

Y de paso conocé la historia detrás: es el motor de
[ART-ES](https://art-es.shop), mi emprendimiento salvadoreño de artesanía real.

Código abierto del proyecto: https://github.com/eliandev/shop-asistente

Si te parece creativo, **tu like en este comentario es el voto** 💚 ¡Gracias!

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
