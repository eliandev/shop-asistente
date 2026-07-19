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

1. **Gate:** captura nombre + email (validado) antes de chatear.
2. **Chat:** cada mensaje hace `POST` al Chat Trigger de n8n con:
   ```json
   { "action": "sendMessage", "sessionId": "<id>", "chatInput": "<texto>",
     "nombre": "<nombre>", "email": "<email>" }
   ```
3. **Respuesta:** parseo defensivo de `output` / `text` / `[{output|text}]`;
   si no viene nada, muestra "Recibido ✅, un asesor te contactará.".
4. **Meta de decisión:** si el `output` trae el separador `———`, la primera
   parte se muestra como respuesta y la segunda como nota sutil
   (ej. "🔎 Decisión: BORRADOR · 68%").

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

## Fuera de alcance (vive en n8n)

Decisión de autonomía, redacción de respuestas, envío de email (Resend),
alertas de Telegram y bitácora en ClickUp. La página no maneja secretos ni
llama a terceros: solo conversa con el webhook.
