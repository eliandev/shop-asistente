# FIX — Widget del asistente "Criterio" dispara el webhook dos veces

## Contexto del proyecto
Carpeta: `art-es-asistente`. Es el widget de chat que se embebe en la página y
que envía las consultas del usuario a un webhook de n8n (flujo "Criterio", el
agente de soporte de SILVI ASSISTANTS). El webhook recibe un POST con el
mensaje del usuario y sus datos de contacto, y devuelve una respuesta que el
widget muestra en el chat.

## Síntoma observado
Cuando el usuario escribe una consulta (ej: "necesito un reembolso"), el flujo
de n8n se ejecuta **dos veces** y genera **dos tarjetas en ClickUp**:

1. Una card con la consulta real pero **sin nombre ni email** del cliente
   (aparece como "Cliente" a secas).
2. Una segunda card que **sí lleva el nombre y el email**, pero cuyo mensaje es
   solo los datos de contacto (o está vacío), por lo que el agente la clasifica
   erróneamente como `consulta_simple` y responde un saludo genérico.

Esto indica que el widget hace **dos POST separados** al webhook:
- POST #1: el mensaje del usuario, sin datos de contacto.
- POST #2: el nombre/email como un envío aparte.

## Objetivo del fix
El widget debe hacer **UN SOLO POST** al webhook por consulta, incluyendo en el
**mismo body**: `nombre`, `email` y `chatInput` (el mensaje). Nunca debe enviar
los datos de contacto en una llamada separada del mensaje.

Body esperado por el webhook (una sola vez):
```json
{
  "nombre": "<nombre del cliente>",
  "email": "<email del cliente>",
  "chatInput": "<mensaje del usuario>"
}
```
(El backend n8n ya lee estos campos: `b.chatInput`, `b.nombre || b['Nombre']`,
`b.email || b['Email']`. No cambies los nombres de campo.)

## Tareas para Claude Code

1. **Localizar los envíos al webhook.** Buscá en la carpeta todas las llamadas
   de red al webhook (probablemente `fetch(` o `axios` apuntando a una URL de
   n8n que contenga `/webhook` o el path `agente`). Anotá cuántas hay y desde
   qué funciones se disparan.

2. **Identificar la doble llamada.** Determiná por qué se envían dos POST:
   - ¿Se pide el contacto (nombre/email) en un paso y el mensaje en otro, cada
     uno con su propio `fetch`?
   - ¿Hay un handler de "guardar contacto" y otro de "enviar mensaje" que pegan
     al webhook por separado?
   - ¿Un `useEffect` / listener se dispara de más?

3. **Unificar en una sola llamada.** Refactorizá para que:
   - El widget capture `nombre` y `email` (ya sea con un formulario previo o
     manteniéndolos en estado) **antes** de enviar el mensaje.
   - Al enviar una consulta, se haga **un único** `fetch` con los tres campos
     juntos en el body (ver formato arriba).
   - Se elimine cualquier POST al webhook que envíe solo los datos de contacto,
     o solo el mensaje sin contacto.
   - Si el contacto ya fue capturado antes, reutilizarlo desde el estado; no
     re-disparar el webhook al capturarlo.

4. **Asegurar el envío correcto:**
   - `Content-Type: application/json`.
   - `await` en el fetch (no fire-and-forget) para poder mostrar la respuesta.
   - Manejo de error básico (try/catch) que muestre un mensaje al usuario si el
     POST falla, sin reintentar automáticamente (para no duplicar cards).

5. **Evitar reenvíos accidentales:** deshabilitar el botón de enviar mientras
   hay una petición en curso, para que un doble clic no genere dos POST.

## Criterio de verificación (obligatorio antes de dar por cerrado)
- Al enviar UNA consulta con nombre + email + mensaje, se produce
  **exactamente un** POST al webhook (verificable en la pestaña Network del
  navegador o en las ejecuciones de n8n).
- Ese único POST lleva los tres campos poblados en el body.
- No existe ninguna ruta de código que haga un POST al webhook con solo el
  contacto o solo el mensaje.
- Un doble clic en "enviar" no genera dos peticiones.

## Lo que NO hay que tocar
- Los nombres de los campos del body (`nombre`, `email`, `chatInput`).
- La URL del webhook.
- El flujo de n8n (eso se ajusta por separado; este fix es solo del widget).

## Notas
- Si tras el análisis resulta que la doble llamada NO viene del widget sino de
  una config del webhook de n8n (ej. responder y reejecutar), reportalo en vez
  de forzar un cambio en el front — pero el síntoma (una card con contacto y
  otra sin) apunta fuertemente a dos envíos separados desde el cliente.

---

## ✅ RESUELTO (2026-07-19)

**Origen confirmado:** el único cliente que llama al webhook de Criterio es
`app/criterio/page.tsx` (el `widget.js` y `Chat.tsx` pegan a `/api/chat`, y
`ReclamarAsistente`/`/api/lead` usan otro webhook, el de leads). La doble llamada
era **por diseño del flujo de escalación en dos turnos**:
1. `preguntar()` enviaba el mensaje sin contacto.
2. `enviarContacto()` re-disparaba el webhook con `chatInput = "Mis datos de
   contacto — nombre:…, correo:…"` → 2ª card con mensaje basura, mal clasificada.

**Decisión de producto:** se mantiene el flujo **ask-first** (preguntar sin dar
datos; pedir nombre/correo solo si Criterio escala). Bajo ask-first, la primera
pregunta necesariamente sale sin contacto, así que la escalación entrega el
contacto en una llamada posterior. Se descartó el *gate* (pedir contacto antes de
chatear) para no degradar la UX.

**Cambios en `app/criterio/page.tsx`:**
- `enviarContacto()` ya **no** manda un POST con "mis datos de contacto". En su
  lugar **reenvía la CONSULTA ORIGINAL** (guardada en `consultaEscaladaRef` al
  escalar) **con `nombre` + `email` en el mismo body**, vía
  `preguntar(consulta, c, { mostrarPregunta: false })` (sin duplicar la burbuja
  de la pregunta).
- Guard **síncrono** `enviandoRef` al inicio de `preguntar()`: un doble clic /
  doble submit en el mismo tick no dispara dos POST (más fiable que mirar el
  estado `cargando`, que se actualiza async). Se libera en `finally`.
- El botón "Enviar mis datos" se **deshabilita mientras hay petición en curso**
  (`disabled={cargando || …}`, muestra "Enviando…").

**Verificación (round-trip real con n8n, interceptando `fetch`):** al escalar
"necesito un reembolso" y dejar el contacto, se produjo **exactamente 1 POST** con
los tres campos poblados y la consulta real:
```json
{ "action": "sendMessage", "sessionId": "bec0…574",
  "chatInput": "necesito un reembolso",
  "nombre": "Ana Prueba", "email": "ana.prueba@correo.com" }
```
Ya no existe ningún POST con solo el contacto. La burbuja de la pregunta no se
duplica.

**Residual (opcional, del lado de n8n — NO se tocó):** por ser ask-first, la
consulta escalada genera 2 ejecuciones con el **mismo `sessionId`** (la respuesta
inicial de Criterio + el reenvío con contacto). Para colapsarlas en **una sola
tarjeta de ClickUp**, deduplicar en n8n por `sessionId` (ej. actualizar la card
existente en vez de crear una nueva cuando llega el contacto). La card definitiva
ya lleva la consulta real + nombre + email y se clasifica bien.

**Solución del residual (lista para pegar):** ver `docs/n8n-dedupe-sessionid.md`
— un Code node de upsert en la rama de escalación que crea la tarjeta en la 1ª
ejecución y la ACTUALIZA (con nombre+email) en el reenvío, con la clave
`sessionId::chatInput`. Incluye 2 alternativas (IF "crear solo si hay email" y
custom field durable).
