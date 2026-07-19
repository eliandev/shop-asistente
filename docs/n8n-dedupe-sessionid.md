# n8n — Deduplicar tarjetas de ClickUp por sesión + consulta

Cierra el residual del fix de doble llamada (ver `FIX-widget-doble-llamada.md`):
como `/criterio` es **ask-first**, una consulta escalada llega a n8n en dos
ejecuciones con el **mismo `sessionId`** y el **mismo `chatInput`**:

1. la respuesta inicial de Criterio (sin contacto), y
2. el reenvío con `nombre` + `email` (cuando el usuario deja sus datos).

Sin dedup, cada ejecución crea una tarjeta → 2 cards. Con este upsert, la
**segunda ejecución ACTUALIZA la tarjeta de la primera** (la enriquece con el
contacto) → **una sola tarjeta**, con la consulta real + nombre + email.

## Por qué `sessionId + chatInput` (y no solo `sessionId`)

El `sessionId` es por sesión de navegador, no por pregunta. Si dedupleáramos solo
por `sessionId`, una segunda pregunta distinta en la misma sesión pisaría la
tarjeta de la primera. La clave `sessionId::chatInput` agrupa la **consulta
original y su reenvío-con-contacto** (mismo texto + misma sesión) y separa
preguntas diferentes. El front reenvía el **texto idéntico** de la consulta que
escaló, así que ambas ejecuciones generan la misma clave.

## Opción recomendada — Code node "Upsert por sesión+consulta"

En el workflow de Criterio, en la **rama de escalación**, **reemplazá el nodo
`ClickUp → Create Task`** por un nodo **Code** (modo *Run Once for All Items*)
con esto. Requiere las env que ya usás: `CLICKUP_API_KEY`, `CLICKUP_LIST_ID`.

```js
// n8n · Code node "Upsert ClickUp por sesion+consulta" (Run Once for All Items)
const store = $getWorkflowStaticData('global');
store.mapa = store.mapa || {};    // clave -> taskId
store.orden = store.orden || [];  // FIFO para acotar tamaño

const LIST_ID = $env.CLICKUP_LIST_ID;
const TOKEN = $env.CLICKUP_API_KEY;
const headers = { Authorization: TOKEN, 'Content-Type': 'application/json' };

const salida = [];

for (const item of $input.all()) {
  const j = item.json || {};
  const sessionId = j.sessionId || (j.body && j.body.sessionId) || '';
  const chatInput = (j.chatInput || '').trim();
  const nombre = j.nombre || j.Nombre || '';
  const email = j.email || j.Email || '';
  const decision = j.decision || j.meta || ''; // salida del agente, si la mapeás

  // agrupa la consulta original y su reenvio-con-contacto; separa preguntas distintas
  const clave = `${sessionId}::${chatInput.toLowerCase()}`;

  const nombreTarea = `Soporte · ${(chatInput || 'consulta').slice(0, 60)}`;
  const descripcion = [
    `Consulta: ${chatInput || '—'}`,
    `Cliente: ${nombre || '—'}`,
    `Email: ${email || '—'}`,
    `Sesion: ${sessionId || '—'}`,
    decision ? `Decision: ${decision}` : '',
  ].filter(Boolean).join('\n');

  let taskId = store.mapa[clave];
  let accion;

  if (taskId) {
    // ya existe → la actualizamos (normalmente para sumar nombre+email)
    await this.helpers.httpRequest({
      method: 'PUT',
      url: `https://api.clickup.com/api/v2/task/${taskId}`,
      headers,
      body: { name: nombreTarea, description: descripcion },
      json: true,
    });
    accion = 'actualizada';
  } else {
    // no existe → crear y recordar
    const res = await this.helpers.httpRequest({
      method: 'POST',
      url: `https://api.clickup.com/api/v2/list/${LIST_ID}/task`,
      headers,
      body: { name: nombreTarea, description: descripcion },
      json: true,
    });
    taskId = res.id;
    store.mapa[clave] = taskId;
    store.orden.push(clave);
    if (store.orden.length > 1000) {        // no crecer sin límite
      delete store.mapa[store.orden.shift()];
    }
    accion = 'creada';
  }

  salida.push({ json: { accion, taskId, clave, sessionId, nombre, email } });
}

return salida;
```

**Notas de cableado**
- El item que llega al node debe traer `sessionId`, `chatInput`, `nombre`,
  `email` (del body del webhook) y, opcional, `decision` (salida del agente).
- Si tu `Create Task` seteaba **assignees, tags o custom fields**, portá esos
  campos al `body` de ambas llamadas (create y update).
- Lo que va **después** (Telegram, Resend) puede seguir leyendo la salida de este
  node (`accion`, `taskId`).

**Límites (aceptables)**
- `getWorkflowStaticData` persiste solo con el workflow **activo** (producción);
  en ejecuciones de prueba manuales puede no guardarse. Si se pierde el estado
  (reimportar el workflow), el peor caso es crear una tarjeta nueva — no rompe.
- Requiere acceso a `$env` en el Code node (por defecto habilitado en n8n Cloud).
  Si lo tenés bloqueado, hardcodeá `LIST_ID`/`TOKEN` o usá nodos HTTP Request con
  credencial en vez de Code.

## Alternativa más simple (sin estado) — "crear solo si hay email"

Si no te importa registrar escalaciones **abandonadas** (sin contacto): agregá un
nodo **IF** antes de `Create Task` que solo continúe cuando el email no esté
vacío (`{{ $json.email }}` *is not empty*). Así la tarjeta se crea **solo en el
reenvío** (que ya trae consulta + contacto) → una sola card. Contra: si el
usuario escala pero nunca deja sus datos, no queda tarjeta.

## Alternativa más durable — custom field `session_id` en ClickUp

Si preferís que el dedup sobreviva reinicios/reimportes: creá un custom field de
texto `session_id` en la lista, guardalo al crear la tarjeta, y antes de crear
buscá con `GET /list/{listId}/task?custom_fields=[{"field_id":"…","operator":"=",
"value":"<sessionId>::<chatInput>"}]`; si existe → update, si no → create. Más
robusto que el static data, pero más nodos.
