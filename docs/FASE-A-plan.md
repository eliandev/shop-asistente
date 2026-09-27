# Fase A — Plan de implementación (MVP monetizable)

**Objetivo:** pasar de "demo del reto" a **cobrar** — que un merchant se registre,
publique su asistente, se **suscriba con Stripe** y active el widget Pro
**automáticamente**. Meta: **primer cliente de pago**.

**Stack decidido:** Next.js 14 (existente) · **Supabase** (Postgres + Auth) ·
**Stripe** (billing) · se mantiene UCP (catálogo), n8n (Criterio/leads), Vercel.
**Criterio incluido en Growth/Scale.** Precios exactos: en paralelo (no bloquean).

> **Regla de oro:** no romper producción v2. Todo en **feature branch** con
> **preview deployments** de Vercel; merge a `main` recién cuando el flujo de
> cobro esté verde. El **Free con link instantáneo se conserva** como hook.

---

## 1. Definición de "listo para cobrar" (Done de la Fase A)

- [ ] Un merchant se **registra** (email o Google) y entra a su **dashboard**.
- [ ] Crea/edita un **asistente persistente** (guardado en DB) y lo publica en `/a/:slug`.
- [ ] Conecta su tienda Shopify por dominio; el asistente responde con **catálogo en vivo**.
- [ ] Se **suscribe con Stripe** (self-serve) y el **widget Pro se activa solo** (licencia automática) en su dominio.
- [ ] El **uso se mide** y se muestra; al cancelar, el Pro y la licencia se **revocan**.
- [ ] **ToS + Privacidad** publicados; aislamiento por cuenta verificado; `npm run build` OK.

## 2. Modelo de datos (Supabase Postgres)

| Tabla | Campos clave | Notas |
|---|---|---|
| `profiles` | id (=auth.users), email, name, locale | 1:1 con Supabase Auth |
| `workspaces` | id, owner_id, name | la "cuenta"; base para seats futuros |
| `workspace_members` | workspace_id, user_id, role (owner/editor/viewer) | seats Growth/Scale |
| `assistants` | id, workspace_id, **slug** (unique), config (jsonb), domain, status | `config` = el `ConfigAsistente` actual |
| `subscriptions` | workspace_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end | **fuente de verdad del acceso** |
| `usage_events` | workspace_id, assistant_id, tokens_in/out, created_at | append-only |
| `usage_counters` | workspace_id, period_start, messages | rollup para enforcement rápido |
| `licenses` | workspace_id, assistant_id, domain, key (HMAC), status | reemplaza el script manual |
| `leads` | *(seguir en Firestore por ahora)* | migrar a Supabase es opcional/diferible |

**Seguridad:** RLS por pertenencia a `workspace`; `service_role` solo en el servidor.

## 3. Épicas y tareas

### E0 · Setup infra  *(S)*
- [ ] Proyecto Supabase + env (`SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE` server-only).
- [ ] Migrations del esquema (§2) + políticas RLS.
- [ ] Cliente Supabase (server/client) + helpers de sesión.

### E1 · Auth + cuentas  *(M)*
- [ ] Signup/login **email + Google**; verificación y reset (Supabase Auth).
- [ ] Crear `workspace` al registrarse; middleware de rutas protegidas.

### E2 · Asistentes persistentes + dashboard mínimo  *(L)*
- [ ] Guardar el wizard `/crear` en DB (`assistants.config`) — no solo en el link.
- [ ] Dashboard: listar / crear / editar / duplicar / archivar; **slug** `/a/:slug`.
- [ ] La ruta pública del asistente lee config desde DB (además del `?c=` legado).

### E3 · Motor multi-tenant + atribución de uso  *(M)*
- [ ] `api/chat`: resolver asistente por slug/id desde DB (mantener UCP + anti-invención).
- [ ] Registrar `usage_event` por respuesta, atado a workspace/assistant.

### E4 · Metering + límites  *(M)*
- [ ] Rollup `usage_counters` por período; barra de progreso en dashboard.
- [ ] Avisos 80/100%; **soft-limit** con upgrade/overage; Free agotado → mensaje + deriva WhatsApp.
- [ ] *(Puede salir en modo "solo medir" al inicio y activar el bloqueo después, para no atrasar el cobro.)*

### E5 · Billing Stripe  *(L)*
- [ ] Products/Prices (Free/Starter/Growth/Scale) en Stripe (test primero).
- [ ] **Checkout** self-serve + **Customer Portal**.
- [ ] **Webhooks** → tabla `subscriptions` (estado = acceso real).
- [ ] Prueba gratis 14 días *(con/sin tarjeta — decisión pendiente)*.

### E6 · Licencia Pro automática  *(M)*
- [ ] Al activarse suscripción con widget → emitir/renovar licencia (HMAC, cuenta+dominio).
- [ ] Al cancelar/morosear → **revocar** (widget vuelve al aviso sin gastar modelo).
- [ ] Reemplaza `scripts/generar-licencia.mjs`.

### E7 · Criterio como feature (Growth+)  *(M)*
- [ ] Gate por plan; activar el soporte Criterio para el dominio del merchant + ruteo.

### E8 · Legal + go-live  *(S)*
- [ ] **ToS + Privacidad** (base bilingüe), aviso de IA, DPA/subencargados.
- [ ] Stripe Tax básico para venta global.

### E9 · QA + lanzamiento  *(M)*
- [ ] Test de **aislamiento por cuenta** (no fugas entre workspaces).
- [ ] Flujo de cobro **end-to-end** (checkout → licencia activa → cancelar → revocada).
- [ ] Deploy a prod + smoke test; monitoreo básico.

## 4. Camino crítico al PRIMER COBRO (thin slice)

`E0 → E1 (auth) → E2 (persistir + dashboard) → E5 (Stripe checkout) → E6 (licencia) → E8 (ToS/Privacy) → COBRAR`

El **metering con bloqueo (E4)** y **Criterio como feature (E7)** pueden ir
**justo después** del primer cobro (E4 en modo "solo medir" al lanzar). Así
llegamos a ingreso lo antes posible sin sacrificar lo esencial.

## 5. Lo que necesito de vos para empezar a construir

1. **Cuenta/proyecto Supabase** (o acceso) → me pasás `SUPABASE_URL` + keys (la `service_role` va **solo** a Vercel/servidor, nunca al bundle).
2. **Cuenta Stripe** (modo **test** primero) → API keys de test.
3. **Precios provisorios** por plan (aunque después se calibren) para crear los Products en Stripe.
4. **Decisión:** prueba gratis **con o sin tarjeta**.

> Las llaves reales las cargás **vos** en `.env.local` (local) y en Vercel; yo nunca las manejo en texto plano.

## 6. Riesgos y cómo los manejamos

- **Romper prod v2** → feature branch + preview deployments; merge solo con cobro verde.
- **Perder la magia "sin cuenta"** → el Free crea el asistente sin cuenta (efímero); se pide cuenta solo para **guardar/publicar/cobrar**.
- **Fugas entre cuentas** → RLS + tests de autorización en E9.
- **Costo de IA** → metering + límites (E4) como control de margen.
- **Migración de leads** → diferible; Firestore sigue sirviendo mientras tanto.
