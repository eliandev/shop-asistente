# Licencias del widget Pro — guía del dueño

## El modelo freemium

| | Gratis | Pro |
|---|---|---|
| Link compartible (`/chat?c=...`) | ✅ Siempre | ✅ |
| Widget embebido en el sitio del cliente | 🌱 Vista previa con aviso de activación | ✅ Con licencia |

- **Gratis:** cualquiera crea su asistente en `/crear` y comparte el link.
  Es el gancho: catálogo en vivo, tarjetas, anti-invención — todo funciona.
- **Pro:** para que la burbuja flotante atienda DENTRO del sitio/tienda del
  cliente, el snippet necesita `data-licencia` válida. Sin ella, el chat
  embebido responde un mensaje de activación (sin gastar tokens de API).

## Cómo funciona técnicamente

- La licencia es un token **HMAC-SHA256 firmado con `LICENCIA_SECRET`**
  (variable de entorno, solo servidor), atado a la identidad estable del
  asistente: **marca + dominio** tal como el cliente los puso en `/crear`.
- **Sin base de datos:** si la firma coincide, es válida. Consistente con la
  arquitectura "el link es el asistente".
- El chat detecta que corre embebido (`window.self !== window.top`) y manda
  `embebido: true` + la licencia; el servidor decide.
- Es un candado de negocio (evita "copiar el widget sin pagar"), no un
  sistema antifraude: para un SaaS con cuentas/facturación real, ver Fase 7.

## Flujo cuando alguien paga

1. El cliente toca **"Activar el widget Pro"** en `/crear` → te llega un
   WhatsApp con su marca y dominio.
2. Cobrás por el canal que prefieras.
3. Generás su licencia (la marca y el dominio deben ser EXACTOS a los que
   usó en el creador):

   ```bash
   node scripts/generar-licencia.mjs "Glow Beauty" colourpop.com
   ```

4. Le enviás la licencia: la pega en `data-licencia="..."` de su snippet.
   Listo — el widget queda activo al instante (sin redeploys).

## Cuidados

- `LICENCIA_SECRET` vive en `.env.local` y en las env vars de Vercel
  (production y preview). **Si cambia el secreto, TODAS las licencias
  emitidas dejan de valer.** No lo rotes sin plan.
- Si el cliente cambia el nombre de su marca o el dominio en el creador,
  la licencia deja de coincidir: generale una nueva (política a definir).
- El widget de ART-ES (sin `data-config`) no requiere licencia: es la marca
  de la casa y su demo.
