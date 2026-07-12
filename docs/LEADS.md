# Captura de leads "Reclamar tu asistente" — guía del dueño

**Reto 3 · Vibecoders League 2.0 — "La forma más creativa de capturar leads"**

## El intercambio de valor

La persona crea su asistente en `/crear` y lo ve funcionando **antes** de que
le pidamos nada. Al final, para *llevárselo* (recibir el link + instalador por
correo) o pedir el **widget Pro**, deja sus datos. El gancho es la
herramienta; el correo es la razón para dejar el contacto.

- CTA principal del paso Publicar: **"Guardar mi asistente — llevármelo"**.
- El botón **"Solicitar activación Pro"** abre el mismo modal con la
  intención `pro` preseleccionada.
- El lead se guarda en **Firestore** con un snapshot del asistente creado
  (marca, asistente, rubro, dominio, color) — oro para segmentar.

## Setup de Firebase (una sola vez, ~5 minutos)

1. https://console.firebase.google.com → **Agregar proyecto** (ej.
   `silvi-assistants`). Analytics opcional.
2. **Firestore Database → Crear base de datos** → modo producción → región
   (ej. `us-east1`).
3. **Reglas:** pegá el contenido de [`firestore.rules`](../firestore.rules)
   (todo denegado — solo escribe el servidor) y publicá.
4. ⚙️ **Configuración del proyecto → Cuentas de servicio → Generar nueva
   clave privada** → descarga un JSON.
5. Del JSON, cargá en `.env.local` **y** en Vercel (Production + Preview):
   - `FIREBASE_PROJECT_ID` = `project_id`
   - `FIREBASE_CLIENT_EMAIL` = `client_email`
   - `FIREBASE_PRIVATE_KEY` = `private_key` **en una sola línea** (los saltos
     de línea como `\n` literales, tal como viene en el JSON)
6. Redeploy (`npx vercel deploy --prod`) y probá el modal.

> Sin estas variables, el endpoint responde `server_not_configured` y el
> modal muestra el estado de error con reintento — el resto del creador
> funciona normal.

## Cómo funciona por dentro

- **`POST /api/lead`** (server): valida el correo, rate-limit por IP (8/min),
  honeypot `website` (si viene lleno, responde ok sin guardar — chau bots),
  sanea todos los campos.
- **Dedupe transaccional:** el ID del documento es `SHA-256(email)` — un
  mismo correo nunca duplica; se hace merge y `submissions += 1`, y la API
  devuelve `duplicate: true` (el modal lo celebra distinto).
- **Privacidad:** IP solo hasheada (con sal del servidor), consentimiento
  explícito, y el documento guarda lo mínimo útil.
- **Seguridad:** escribe únicamente el Admin SDK del servidor; las reglas
  publicadas niegan todo al cliente; la private key jamás entra al bundle.

## Ver los leads

Consola Firebase → Firestore Database → colección **`leads`**. Cada doc:
contacto, intención (`guardar`/`pro`), snapshot del asistente, `fuente`
(utm_source), `submissions`, timestamps.

## Correo automático — YA cableado, falta instalar la extensión

El código **ya compone y encola el correo**: al guardar un lead con su link,
`/api/lead` escribe un documento en la colección **`mail`** con el mensaje
listo (`to`, `message.subject`, `message.html`, `message.text`) — asunto y
cuerpo generados en `lib/correo.ts` (link del asistente + snippet del widget,
con variante para `guardar` y `pro`). Solo falta el cartero:

1. Firebase → **Extensiones** → instalar **Trigger Email from Firestore**
   (`firebase/firestore-send-email`).
2. Configurar durante la instalación:
   - **Collection:** `mail` (es la que ya escribe la API).
   - **SMTP connection URI:** de tu proveedor (SendGrid / Resend / Brevo /
     Gmail con app password). Ej: `smtps://usuario:clave@smtp.host.com:465`.
   - **Default FROM:** ej. `Silvi Assistants <hola@tudominio.com>`.
3. Listo: cada nuevo lead con link dispara el correo. La extensión agrega a
   cada doc de `mail` un campo `delivery` con el estado del envío (útil para
   depurar).

> El campo del correo destino ya viene como `to` y el contenido como
> `message.{subject,html,text}` — el formato exacto que la extensión espera,
> así que no hay que mapear nada.

Mientras la extensión NO esté instalada, los documentos de `mail` se
acumulan sin enviarse (no rompe nada); al instalarla, procesa los pendientes.

## Firebase Analytics (opcional)

Activar **Analytics** en el proyecto para medir el embudo crear → reclamar
(eventos de página `/crear`, apertura del modal, envío del lead).
