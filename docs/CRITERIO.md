# Soporte "Criterio" — centro de ayuda conectado a n8n

Ruta pública: **`/criterio`** → https://www.silvi-chatbot.online/criterio

Es el **centro de soporte** de silvi-chatbot.online (se entra desde la nav y el
footer de la landing). Los usuarios preguntan sobre sus chatbots —crearlos,
instalar el widget, plan Pro, conectar el catálogo, dudas técnicas—. Lo atiende
**Criterio**, el agente de soporte de Silvi, que decide cuánta autonomía
tomarse: 🟢 responde solo · 🟡 deja borrador para un humano · 🔴 escala al
equipo. **Toda la lógica de decisión vive en n8n**; esta página es solo el
frontend del chat que le habla al webhook. Se presenta con el chrome del
sistema (negro+lima), no como micrositio aparte.

## Cómo funciona

1. **Ask-first (sin gate):** la página abre con "¿Cómo podemos ayudarte?" y un
   campo de pregunta. **No** se piden datos por adelantado; se conversa directo.
2. **Chat:** cada mensaje hace `POST` al Chat Trigger de n8n con:
   ```json
   { "action": "sendMessage", "sessionId": "<id>", "chatInput": "<texto>",
     "nombre": "<nombre>", "email": "<email>" }
   ```
   (`nombre`/`email` van vacíos hasta que el usuario los deja en la escalación).
3. **Respuesta:** parseo defensivo y tolerante en `parseRespuesta()`. Acepta:
   - `{ output }`, `{ text|message|answer|reply|respuesta }`, string suelto y
     arrays `[{…}]`;
   - la **notificación tipo Telegram** `{ ok, result: { text } }`: toma como
     respuesta al cliente lo que va después de `Envié:` y como decisión lo de
     antes; además **quita el pie** "This message was sent automatically with n8n";
   - **markdown**: `**negrita**` se renderiza como `<strong>` y las URLs como
     enlaces.
   Si aun así no logra extraer texto, muestra un fallback neutro
   ("No pude leer la respuesta del asistente. Probá de nuevo en un momento.").
4. **Meta de decisión:** la decisión puede venir en un campo aparte
   (`decision`/`meta`/`nivel`), tras el separador `———`, o (en el shape Telegram)
   en las líneas previas a `Envié:`. Se muestra como nota sutil
   (ej. "🔎 🟢 ACTUO SOLO · 95%").
5. **Escalación:** el formulario de contacto (nombre + correo) aparece **solo**
   cuando la DECISIÓN indica 🟡/🔴 (borrador, escalar, nivel 2/3, intervención
   humana). Nunca se dispara desde el texto de la respuesta.

**Layout tipo chat:** la página tiene alto fijo de viewport y **no scrollea**;
solo scrollea por dentro el área de conversación (`.sop-scroll`), mientras el
campo de pregunta queda anclado abajo, siempre visible. Está scoped con la clase
`.sop-page` en el `<main>` para no tocar el scroll de la landing.

## Configuración

**Variable de entorno (pública):**
```
NEXT_PUBLIC_CRITERIO_CHAT_URL=https://TU-INSTANCIA.n8n.cloud/webhook/....../chat
```
Ponela en `.env.local` (local) y en Vercel (Production + Preview). Como es
`NEXT_PUBLIC_`, se inyecta en el bundle al **build**: tras cambiarla, hay que
**redesplegar**. Sin ella, el demo carga pero al enviar avisa que no está
conectado.

**CORS en n8n (imprescindible):** el navegador llama al webhook desde el
dominio de la página. En el nodo **Chat Trigger** de n8n → *Options* →
**Allowed Origins (CORS)**, poné `*` o el dominio exacto
(`https://silvi-assistants.vercel.app`). Sin esto, el navegador bloquea la
llamada.

## Cambiar el demo

El asistente está definido como un objeto `ConfigAsistente` en
`app/criterio/page.tsx` (`CRITERIO`): marca, nombre, saludo, color, fondo y los
chips de sugerencia. Cambiá esos valores para re-marcar el demo.

## ⚠️ Qué debe responder el webhook al navegador

**Lo más limpio** es terminar el workflow con un nodo **"Respond to Webhook"**
que devuelva el texto para el cliente:

```json
{ "output": "¡Hola! Para crear tu asistente entrá a /crear…" }
```
o, para mostrar la decisión (y disparar la captura de contacto en 🟡/🔴):
```json
{ "output": "…respuesta…", "decision": "🟡 BORRADOR · intervención humana · 68%" }
```
(también sirve meter la decisión dentro del texto tras `———`).

**El front es resiliente:** si el webhook devuelve la notificación de Telegram
`{ ok, result: { text: "🟢 …decisión…\nEnvié: <respuesta>" } }`, igual funciona
—toma como respuesta lo de después de `Envié:`, como decisión lo de antes, y
quita el pie "sent automatically with n8n". Aun así, devolver `{ output }` limpio
es preferible (menos frágil y sin texto interno como "respondió a Cliente").

Recomendación opcional en n8n: en el nodo de Telegram, desactivar **"Append
n8n Attribution"** para que no cuelgue ese pie en el texto.

La escalación (formulario de contacto) se dispara SOLO desde la decisión
(`decision`/meta o líneas de decisión), nunca desde el texto de la respuesta.

## Fuera de alcance (vive en n8n)

Decisión de autonomía, redacción de respuestas, envío de email (Resend),
alertas de Telegram y bitácora en ClickUp. La página no maneja secretos ni
llama a terceros: solo conversa con el webhook.
